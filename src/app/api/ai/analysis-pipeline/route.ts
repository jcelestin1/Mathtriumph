import { NextResponse } from "next/server"
import { z } from "zod"

import {
  buildEocPrediction,
  buildErrorAnalyses,
} from "@/lib/error-analysis"
import { getServerSession } from "@/lib/security/auth-server"
import { logSecurityEvent } from "@/lib/security/audit-log"
import {
  AI_GOVERNANCE_POLICY,
  assertDistrictIsolation,
  assertPurposeAllowed,
  sanitizeForAiPrompt,
} from "@/lib/security/ai-governance"
import { checkRateLimit } from "@/lib/security/rate-limit"

const AnalysisPipelineSchema = z.object({
  purpose: z.enum(["eoc_preparation", "progress_tracking", "error_analysis"]),
  districtId: z.string().min(2).max(80),
  quiz: z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    subtitle: z.string(),
    durationMinutes: z.number().int().positive(),
    topics: z.array(z.string()).max(20),
    questions: z.array(z.any()).min(1).max(40),
  }),
  results: z.array(z.any()).min(1).max(40),
  questionWork: z.array(z.any()).max(40),
  scorePercent: z.number().min(0).max(100),
})

function summarizeInterventionPriority(
  analyses: Array<{ errorType: string }>
): "low" | "medium" | "high" {
  const conceptualCount = analyses.filter((item) => item.errorType === "conceptual").length
  const strategicCount = analyses.filter((item) => item.errorType === "strategic").length
  if (conceptualCount >= 2) return "high"
  if (conceptualCount === 1 || strategicCount >= 1) return "medium"
  return "low"
}

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const ip =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    session.userId
  const rate = checkRateLimit({
    key: `analysis-pipeline:${ip}`,
    limit: 70,
    windowMs: 15 * 60 * 1000,
  })
  if (!rate.allowed) {
    return NextResponse.json(
      { message: "Analysis request limit reached. Retry shortly." },
      { status: 429 }
    )
  }

  try {
    const parsed = AnalysisPipelineSchema.parse(await request.json())
    const purpose = assertPurposeAllowed(parsed.purpose)
    const districtAllowed = assertDistrictIsolation({
      requestedDistrictId: parsed.districtId,
      sessionDistrictId: session.districtId,
    })
    if (!districtAllowed) {
      await logSecurityEvent({
        eventType: "district_isolation_blocked",
        requestedDistrictId: parsed.districtId,
        sessionDistrictId: session.districtId,
      })
      return NextResponse.json({ message: "District isolation validation failed." }, { status: 403 })
    }

    // Purpose-limited in-memory pipeline: no raw payload persistence.
    const analyses = buildErrorAnalyses({
      quiz: parsed.quiz,
      results: parsed.results,
      questionWork: parsed.questionWork,
    }).map((entry) => ({
      ...entry,
      stream1ReasoningSummary: sanitizeForAiPrompt(entry.stream1ReasoningSummary),
    }))

    const prediction = buildEocPrediction(parsed.scorePercent, analyses, { purpose })
    const interventionPriority = summarizeInterventionPriority(analyses)
    const suggestedTeacherAction =
      interventionPriority === "high"
        ? "Human review required: assign small-group reteach on benchmark clusters before next simulation."
        : interventionPriority === "medium"
          ? "Human review required: assign targeted spiral practice and monitor with an exit check."
          : "Teacher confirmation recommended: continue with reinforcement warm-ups."

    await logSecurityEvent({
      eventType: "ai_dual_stream_predictor_inference",
      districtId: session.districtId,
      purpose,
      analysisCount: analyses.length,
      projectedAchievementLevel: prediction.achievementLevel,
      confidenceBand: prediction.confidenceBand ?? "medium",
      requiresHumanReview: prediction.requiresHumanReview ?? true,
      policyVersion: AI_GOVERNANCE_POLICY.policyVersion,
      architecture: AI_GOVERNANCE_POLICY.architecture,
    })

    return NextResponse.json({
      analyses,
      prediction: {
        ...prediction,
        requiresHumanReview: true,
      },
      interventionPriority,
      suggestedTeacherAction,
      compliance: {
        purpose,
        districtId: session.districtId,
        ragIsolation: AI_GOVERNANCE_POLICY.architecture,
        ephemeralProcessing: AI_GOVERNANCE_POLICY.inferenceRetention,
        noTrainingOnPii: AI_GOVERNANCE_POLICY.trainingPolicy,
      },
    })
  } catch {
    return NextResponse.json(
      { message: "Invalid secure analysis pipeline payload." },
      { status: 400 }
    )
  }
}
