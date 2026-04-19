import { NextResponse } from "next/server"
import { z } from "zod"

import { APP_PERMISSIONS, APP_ROLES } from "@/lib/rbac"
import { getServerSession } from "@/lib/security/auth-server"
import { logSecurityEvent } from "@/lib/security/audit-log"
import {
  applyDistrictPolicyPreset,
  createDistrictPolicySnapshot,
  getDistrictPolicyMatrix,
  getPolicyPresetPreview,
  hasDistrictPermission,
  listDistrictPolicySnapshots,
  restoreDistrictPolicySnapshot,
  type PolicyPreset,
} from "@/lib/security/permission-policy"
import { checkRateLimit } from "@/lib/security/rate-limit"
import { prisma } from "@/lib/server/prisma"

const PolicyUpdateSchema = z.object({
  role: z.enum([
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
  permission: z.string().min(1),
  enabled: z.boolean(),
})

const PolicyPresetSchema = z.object({
  preset: z.enum(["strict", "balanced", "empowered"]),
})

const PolicyRollbackSchema = z.object({
  snapshotId: z.string().min(1),
})

export async function GET(request: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const canManagePolicy = await hasDistrictPermission({
    districtId: session.districtId,
    role: session.role,
    permission: "district.settings.manage",
  })
  if (!canManagePolicy || session.role !== "district_admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const ip =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    session.userId
  const rate = checkRateLimit({
    key: `policy-matrix-read:${ip}`,
    limit: 100,
    windowMs: 15 * 60 * 1000,
  })
  if (!rate.allowed) {
    return NextResponse.json({ message: "Too many requests." }, { status: 429 })
  }

  return NextResponse.json({
    roles: APP_ROLES,
    permissions: APP_PERMISSIONS,
    presetPreview: getPolicyPresetPreview(),
    snapshots: await listDistrictPolicySnapshots(session.districtId),
    matrix: await getDistrictPolicyMatrix(session.districtId),
  })
}

export async function PUT(request: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const canManagePolicy = await hasDistrictPermission({
    districtId: session.districtId,
    role: session.role,
    permission: "district.settings.manage",
  })
  if (!canManagePolicy || session.role !== "district_admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  try {
    const payload = PolicyUpdateSchema.parse(await request.json())
    if (
      payload.role === "district_admin" &&
      payload.permission === "district.settings.manage" &&
      payload.enabled === false
    ) {
      return NextResponse.json(
        { message: "This critical permission cannot be disabled for District Admin." },
        { status: 400 }
      )
    }
    if (!APP_PERMISSIONS.includes(payload.permission as (typeof APP_PERMISSIONS)[number])) {
      return NextResponse.json({ message: "Unknown permission." }, { status: 400 })
    }
    await createDistrictPolicySnapshot({
      districtId: session.districtId,
      createdByUserId: session.userId,
      label: "Manual permission update",
      reason: `${payload.role} -> ${payload.permission} = ${payload.enabled ? "enabled" : "disabled"}`,
    })

    await prisma.districtRolePermissionOverride.upsert({
      where: {
        districtId_role_permission: {
          districtId: session.districtId,
          role: payload.role,
          permission: payload.permission,
        },
      },
      update: {
        enabled: payload.enabled,
        updatedByUserId: session.userId,
      },
      create: {
        districtId: session.districtId,
        role: payload.role,
        permission: payload.permission,
        enabled: payload.enabled,
        updatedByUserId: session.userId,
      },
    })

    await logSecurityEvent({
      eventType: "district_policy_updated",
      actorUserId: session.userId,
      role: payload.role,
      permission: payload.permission,
      enabled: payload.enabled,
    })

    return NextResponse.json({
      ok: true,
      snapshots: await listDistrictPolicySnapshots(session.districtId),
      matrix: await getDistrictPolicyMatrix(session.districtId),
    })
  } catch {
    return NextResponse.json({ message: "Invalid policy update payload." }, { status: 400 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const canManagePolicy = await hasDistrictPermission({
    districtId: session.districtId,
    role: session.role,
    permission: "district.settings.manage",
  })
  if (!canManagePolicy || session.role !== "district_admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  try {
    const payload = PolicyPresetSchema.parse(await request.json()) as { preset: PolicyPreset }
    await createDistrictPolicySnapshot({
      districtId: session.districtId,
      createdByUserId: session.userId,
      label: `Preset apply: ${payload.preset}`,
      preset: payload.preset,
      reason: "Pre-preset snapshot",
    })
    await applyDistrictPolicyPreset({
      districtId: session.districtId,
      updatedByUserId: session.userId,
      preset: payload.preset,
    })
    await logSecurityEvent({
      eventType: "district_policy_preset_applied",
      actorUserId: session.userId,
      preset: payload.preset,
    })
    return NextResponse.json({
      ok: true,
      snapshots: await listDistrictPolicySnapshots(session.districtId),
      matrix: await getDistrictPolicyMatrix(session.districtId),
    })
  } catch {
    return NextResponse.json({ message: "Invalid policy preset payload." }, { status: 400 })
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const canManagePolicy = await hasDistrictPermission({
    districtId: session.districtId,
    role: session.role,
    permission: "district.settings.manage",
  })
  if (!canManagePolicy || session.role !== "district_admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  try {
    const payload = PolicyRollbackSchema.parse(await request.json())
    await createDistrictPolicySnapshot({
      districtId: session.districtId,
      createdByUserId: session.userId,
      label: `Rollback marker: ${payload.snapshotId}`,
      reason: "Pre-rollback snapshot",
    })
    await restoreDistrictPolicySnapshot({
      districtId: session.districtId,
      snapshotId: payload.snapshotId,
    })

    await logSecurityEvent({
      eventType: "district_policy_rollback_applied",
      actorUserId: session.userId,
      snapshotId: payload.snapshotId,
    })

    return NextResponse.json({
      ok: true,
      snapshots: await listDistrictPolicySnapshots(session.districtId),
      matrix: await getDistrictPolicyMatrix(session.districtId),
    })
  } catch (error) {
    return NextResponse.json(
      {
        message:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.message
            : "Invalid rollback payload.",
      },
      { status: 400 }
    )
  }
}
