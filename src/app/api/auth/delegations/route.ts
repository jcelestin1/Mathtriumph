import { NextResponse } from "next/server"
import { z } from "zod"

import { canDelegateTarget, hasPermission } from "@/lib/rbac"
import { getServerSession } from "@/lib/security/auth-server"
import { logSecurityEvent } from "@/lib/security/audit-log"
import { hasDistrictPermission } from "@/lib/security/permission-policy"
import { checkRateLimit } from "@/lib/security/rate-limit"
import { prisma } from "@/lib/server/prisma"

const DelegationCreateSchema = z.object({
  granteeEmail: z.string().email(),
  targetRole: z.enum([
    "district_admin",
    "school_admin",
    "tech_admin",
    "interventionist",
    "instructional_coach",
    "data_analyst",
    "teacher",
    "student",
    "parent",
    "support_admin",
  ]),
  reason: z.string().max(500).optional(),
  durationHours: z.number().int().min(1).max(168).default(24),
})

const DelegationRevokeSchema = z.object({
  delegationId: z.string().min(1),
})

export async function GET(request: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  if (
    !hasPermission(session.role, "role.delegate") ||
    !(await hasDistrictPermission({
      districtId: session.districtId,
      role: session.role,
      permission: "role.delegate",
    }))
  ) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const ip =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    session.userId
  const rate = checkRateLimit({
    key: `delegations-read:${ip}`,
    limit: 120,
    windowMs: 15 * 60 * 1000,
  })
  if (!rate.allowed) {
    return NextResponse.json({ message: "Too many requests." }, { status: 429 })
  }

  const now = new Date()
  const delegations = await prisma.delegationGrant.findMany({
    where: {
      grantorUserId: session.userId,
      revokedAt: null,
      endsAt: { gt: now },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      grantee: {
        select: {
          email: true,
          fullName: true,
        },
      },
    },
  })

  return NextResponse.json({ delegations })
}

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  if (
    !hasPermission(session.role, "role.delegate") ||
    !(await hasDistrictPermission({
      districtId: session.districtId,
      role: session.role,
      permission: "role.delegate",
    }))
  ) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  try {
    const payload = DelegationCreateSchema.parse(await request.json())
    if (!canDelegateTarget(session.role, payload.targetRole)) {
      return NextResponse.json(
        { message: "Target role cannot be delegated by your role." },
        { status: 403 }
      )
    }

    const grantee = await prisma.user.findUnique({
      where: { email: payload.granteeEmail.trim().toLowerCase() },
      select: { id: true, districtId: true, email: true, fullName: true },
    })
    if (!grantee) {
      return NextResponse.json({ message: "Grantee account not found." }, { status: 404 })
    }

    if (grantee.districtId !== session.districtId) {
      return NextResponse.json({ message: "Cross-district delegation is not allowed." }, { status: 403 })
    }

    const startsAt = new Date()
    const endsAt = new Date(startsAt.getTime() + payload.durationHours * 60 * 60 * 1000)
    const delegation = await prisma.delegationGrant.create({
      data: {
        grantorUserId: session.userId,
        granteeUserId: grantee.id,
        targetRole: payload.targetRole,
        reason: payload.reason,
        startsAt,
        endsAt,
      },
      include: {
        grantee: {
          select: {
            email: true,
            fullName: true,
          },
        },
      },
    })

    await logSecurityEvent({
      eventType: "role_delegation_created",
      grantorUserId: session.userId,
      granteeUserId: grantee.id,
      targetRole: payload.targetRole,
      endsAt: endsAt.toISOString(),
    })

    return NextResponse.json({ ok: true, delegation })
  } catch (error) {
    await logSecurityEvent({
      eventType: "role_delegation_create_error",
      message: error instanceof Error ? error.message : "unknown_error",
    })
    return NextResponse.json(
      {
        message:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "Invalid delegation payload.",
      },
      { status: 400 }
    )
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  if (
    !hasPermission(session.role, "role.delegate") ||
    !(await hasDistrictPermission({
      districtId: session.districtId,
      role: session.role,
      permission: "role.delegate",
    }))
  ) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  try {
    const payload = DelegationRevokeSchema.parse(await request.json())
    const delegation = await prisma.delegationGrant.findUnique({
      where: { id: payload.delegationId },
      select: {
        id: true,
        grantorUserId: true,
        revokedAt: true,
      },
    })
    if (!delegation) {
      return NextResponse.json({ message: "Delegation not found." }, { status: 404 })
    }
    if (delegation.grantorUserId !== session.userId && session.role !== "district_admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }
    if (delegation.revokedAt) {
      return NextResponse.json({ ok: true })
    }

    await prisma.delegationGrant.update({
      where: { id: delegation.id },
      data: { revokedAt: new Date() },
    })
    await logSecurityEvent({
      eventType: "role_delegation_revoked",
      delegationId: delegation.id,
      actorUserId: session.userId,
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: "Invalid revocation payload." }, { status: 400 })
  }
}
