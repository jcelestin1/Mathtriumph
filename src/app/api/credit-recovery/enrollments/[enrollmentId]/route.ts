import { NextResponse } from "next/server"
import { CreditRecoveryProgressStatus } from "@prisma/client"
import { z } from "zod"

import { hasPermission } from "@/lib/rbac"
import { logSecurityEvent } from "@/lib/security/audit-log"
import { getServerSession } from "@/lib/security/auth-server"
import { checkRateLimit } from "@/lib/security/rate-limit"
import { updateCreditRecoveryProgress } from "@/lib/server/credit-recovery"

const ProgressPatchSchema = z.object({
  moduleId: z.string().min(1),
  status: z.nativeEnum(CreditRecoveryProgressStatus).optional(),
  diagnosticScore: z.number().min(0).max(100).nullable().optional(),
  masteryScore: z.number().min(0).max(100).nullable().optional(),
  benchmarkReady: z.boolean().optional(),
  evidence: z.record(z.string(), z.unknown()).optional(),
  teacherNotes: z.string().trim().max(2000).optional(),
})

export const runtime = "nodejs"

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/credit-recovery/enrollments/[enrollmentId]">
) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const canManage =
    hasPermission(session.role, "interventions.manage") ||
    hasPermission(session.role, "assignments.manage")
  if (!canManage) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  const ip =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    session.userId
  const rate = checkRateLimit({
    key: `credit-recovery-progress-write:${ip}`,
    limit: 80,
    windowMs: 15 * 60 * 1000,
  })
  if (!rate.allowed) {
    return NextResponse.json({ message: "Too many writes." }, { status: 429 })
  }

  try {
    const { enrollmentId } = await context.params
    const payload = ProgressPatchSchema.parse(await request.json())
    const enrollment = await updateCreditRecoveryProgress({
      districtId: session.districtId,
      enrollmentId,
      moduleId: payload.moduleId,
      status: payload.status,
      diagnosticScore: payload.diagnosticScore,
      masteryScore: payload.masteryScore,
      benchmarkReady: payload.benchmarkReady,
      evidence: payload.evidence,
      teacherNotes: payload.teacherNotes,
    })

    await logSecurityEvent({
      eventType: "credit_recovery_progress_updated",
      actorUserId: session.userId,
      districtId: session.districtId,
      enrollmentId,
      moduleId: payload.moduleId,
      status: payload.status,
    })

    return NextResponse.json({ enrollment })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid credit recovery progress payload."
    return NextResponse.json({ message }, { status: 400 })
  }
}
