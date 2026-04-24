import { NextResponse } from "next/server"
import { z } from "zod"

import { hasPermission } from "@/lib/rbac"
import { logSecurityEvent } from "@/lib/security/audit-log"
import { getServerSession } from "@/lib/security/auth-server"
import { checkRateLimit } from "@/lib/security/rate-limit"
import {
  CreditRecoveryEnrollmentStatus,
  assignCreditRecoveryEnrollment,
  listCreditRecoveryEnrollments,
} from "@/lib/server/credit-recovery"

const EnrollmentQuerySchema = z.object({
  studentUserId: z.string().min(1).optional(),
  status: z.nativeEnum(CreditRecoveryEnrollmentStatus).optional(),
  programSlug: z.string().min(1).optional(),
})

const EnrollmentCreateSchema = z.object({
  studentUserId: z.string().min(1),
  programSlug: z.string().min(1),
  reason: z.enum([
    "credit_recovery",
    "grade_forgiveness",
    "eoc_remediation",
    "bridge_readiness",
  ]),
  originalCourseCode: z.string().trim().min(1).max(32).optional(),
  originalCourseName: z.string().trim().min(1).max(120).optional(),
  targetCompletionAt: z.string().datetime().optional(),
  notes: z.string().trim().max(2000).optional(),
})

export const runtime = "nodejs"

export async function GET(request: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const ip =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    session.userId
  const rate = checkRateLimit({
    key: `credit-recovery-enrollments-read:${ip}`,
    limit: 100,
    windowMs: 15 * 60 * 1000,
  })
  if (!rate.allowed) {
    return NextResponse.json({ message: "Too many requests." }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const parsed = EnrollmentQuerySchema.safeParse({
    studentUserId: searchParams.get("studentUserId") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    programSlug: searchParams.get("programSlug") ?? undefined,
  })
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid query parameters." }, { status: 400 })
  }

  const enrollments = await listCreditRecoveryEnrollments({
    districtId: session.districtId,
    role: session.role,
    userId: session.userId,
    studentUserId: parsed.data.studentUserId,
    status: parsed.data.status,
    programSlug: parsed.data.programSlug,
  })

  return NextResponse.json({ enrollments })
}

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const canAssign =
    hasPermission(session.role, "interventions.manage") ||
    hasPermission(session.role, "assignments.manage")
  if (!canAssign) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const ip =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    session.userId
  const rate = checkRateLimit({
    key: `credit-recovery-enrollments-write:${ip}`,
    limit: 60,
    windowMs: 15 * 60 * 1000,
  })
  if (!rate.allowed) {
    return NextResponse.json({ message: "Too many writes." }, { status: 429 })
  }

  try {
    const payload = EnrollmentCreateSchema.parse(await request.json())
    const enrollment = await assignCreditRecoveryEnrollment({
      districtId: session.districtId,
      assignedByUserId: session.userId,
      studentUserId: payload.studentUserId,
      programSlug: payload.programSlug,
      reason: payload.reason,
      originalCourseCode: payload.originalCourseCode,
      originalCourseName: payload.originalCourseName,
      targetCompletionAt: payload.targetCompletionAt,
      notes: payload.notes,
    })

    await logSecurityEvent({
      eventType: "credit_recovery_enrollment_created",
      actorUserId: session.userId,
      districtId: session.districtId,
      studentUserId: payload.studentUserId,
      programSlug: payload.programSlug,
      enrollmentId: enrollment.id,
    })

    return NextResponse.json({ enrollment }, { status: 201 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid credit recovery enrollment payload."
    return NextResponse.json({ message }, { status: 400 })
  }
}
