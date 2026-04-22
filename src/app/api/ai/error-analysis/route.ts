import { NextResponse } from "next/server"
import { z } from "zod"

import { buildDualStreamPrompt } from "@/lib/error-analysis"
import { getServerSession } from "@/lib/security/auth-server"
import { logSecurityEvent } from "@/lib/security/audit-log"
import {
  AI_GOVERNANCE_POLICY,
  assertFeaturePurposeAllowed,
  assertDistrictIsolation,
  buildInferenceId,
  sanitizeForAiPrompt,
} from "@/lib/security/ai-governance"
import { checkRateLimit } from "@/lib/security/rate-limit"

const ErrorAnalysisPayloadSchema = z.object({
  purpose: z.enum(["eoc_preparation", "progress_tracking", "error_analysis"]),
  districtId: z.string().min(2).max(80),
  analyses: z.array(z.any()).max(6).optional(),
  prediction: z.any().optional(),
})

type ErrorAnalysisPayload = z.infer<typeof ErrorAnalysisPayloadSchema>

export const runtime = "nodejs"

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  try {
    const ip =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "unknown"
    const rate = checkRateLimit({
      key: `ai-error-analysis:${ip}`,
      limit: 80,
      windowMs: 15 * 60 * 1000,
    })
    if (!rate.allowed) {
      return NextResponse.json({ message: "Rate limit reached." }, { status: 429 })
    }

    const body = ErrorAnalysisPayloadSchema.parse(await request.json()) as ErrorAnalysisPayload
    const purpose = assertFeaturePurposeAllowed("dual_stream_error_analysis", body.purpose)
    const inferenceId = buildInferenceId("dual_stream_error_analysis")
    if (
      !assertDistrictIsolation({
        requestedDistrictId: body.districtId,
        sessionDistrictId: session.districtId,
      })
    ) {
      await logSecurityEvent({
        eventType: "district_isolation_blocked",
        feature: "dual_stream_error_analysis",
        requestedDistrictId: body.districtId,
        sessionDistrictId: session.districtId,
      })
      return NextResponse.json({ message: "District isolation validation failed." }, { status: 403 })
    }
    const analyses = Array.isArray(body.analyses) ? body.analyses.slice(0, 6) : []
    const prediction = body.prediction

    if (!analyses.length) {
      return NextResponse.json(
        { message: "No analyses were provided." },
        { status: 400 }
      )
    }

    await logSecurityEvent({
      eventType: "ai_inference_started",
      feature: "dual_stream_error_analysis",
      inferenceId,
      districtId: session.districtId,
      purpose,
      analysisCount: analyses.length,
      policyVersion: AI_GOVERNANCE_POLICY.policyVersion,
    })

    let dualStreamPrompts = analyses.map((item) => ({
      questionId: item.questionId,
      stream1: item.stream1Draft,
      stream2: item.stream2Diagnostic,
      prompt: sanitizeForAiPrompt(buildDualStreamPrompt(item)),
    }))

    const conceptualCount = analyses.filter((item) => item.errorType === "conceptual").length
    const strategicCount = analyses.filter((item) => item.errorType === "strategic").length
    const interventionPriority =
      conceptualCount >= 2
        ? "high"
        : conceptualCount === 1 || strategicCount >= 1
          ? "medium"
          : "low"

    await logSecurityEvent({
      eventType: "ai_inference_completed",
      feature: "dual_stream_error_analysis",
      inferenceId,
      districtId: session.districtId,
      purpose,
      analysisCount: analyses.length,
      interventionPriority,
      projectedAchievementLevel: prediction?.achievementLevel ?? null,
      requiresHumanReview: true,
      architecture: AI_GOVERNANCE_POLICY.architecture,
      trainingPolicy: AI_GOVERNANCE_POLICY.trainingPolicy,
      processingBoundary: AI_GOVERNANCE_POLICY.processingBoundary,
    })

    const response = NextResponse.json({
      dualStreamPrompts,
      architecture: "sequential-dual-stream",
      interventionPriority,
      suggestedTeacherAction:
        interventionPriority === "high"
          ? "Human review required: assign small-group reteach on benchmark clusters before next simulation."
          : interventionPriority === "medium"
            ? "Human review required: assign targeted spiral practice and monitor with a 5-question exit check."
            : "Teacher confirmation recommended: continue current plan with reinforcement warm-ups.",
      projectedAchievementLevel: prediction?.achievementLevel ?? null,
      compliance: {
        policyVersion: AI_GOVERNANCE_POLICY.policyVersion,
        purpose,
        districtId: session.districtId,
        requiresHumanReview: true,
        purposeLimitation: AI_GOVERNANCE_POLICY.purposeLimitation,
        processingBoundary: AI_GOVERNANCE_POLICY.processingBoundary,
      },
      audit: {
        inferenceId,
      },
    })

    dualStreamPrompts = []
    return response
  } catch (error) {
    await logSecurityEvent({
      eventType: "ai_inference_failed",
      feature: "dual_stream_error_analysis",
      errorMessage: error instanceof Error ? error.message : "unknown",
    })
    return NextResponse.json(
      { message: "Invalid error analysis payload." },
      { status: 400 }
    )
  }
}
