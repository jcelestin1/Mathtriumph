import { z } from "zod"

import { redactPotentialPii } from "@/lib/security/pii"

export const FERPA_ALLOWED_AI_PURPOSES = [
  "eoc_preparation",
  "progress_tracking",
  "error_analysis",
] as const

export type AiPurpose = (typeof FERPA_ALLOWED_AI_PURPOSES)[number]

export const AiPurposeSchema = z.enum(FERPA_ALLOWED_AI_PURPOSES)

export const AI_FEATURE_KEYS = [
  "analysis_pipeline",
  "dual_stream_error_analysis",
  "ai_coach",
] as const

export type AiFeatureKey = (typeof AI_FEATURE_KEYS)[number]

export const AiFeatureKeySchema = z.enum(AI_FEATURE_KEYS)

export const AI_GOVERNANCE_POLICY = {
  policyVersion: "2026.2-ferpa-expanded",
  architecture: "rag-isolated-per-district",
  trainingPolicy: "no-student-pii-training",
  inferenceRetention: "ephemeral-in-memory",
  highImpactDecisionPolicy: "human-in-the-loop-required",
  purposeLimitation: "eoc-preparation-and-related-educational-functions-only",
  dataSegregation: "district-scoped-logical-isolation-no-cross-district-mixing",
  processingBoundary: "server-side-sensitive-record-processing-only",
} as const

const AI_FEATURE_ALLOWED_PURPOSES: Record<AiFeatureKey, readonly AiPurpose[]> = {
  analysis_pipeline: ["eoc_preparation", "error_analysis"],
  dual_stream_error_analysis: ["eoc_preparation", "error_analysis", "progress_tracking"],
  ai_coach: ["eoc_preparation", "progress_tracking"],
}

export function getDefaultDistrictId() {
  return process.env.MT_DISTRICT_ID ?? "fl-demo-district"
}

export function assertPurposeAllowed(purpose: AiPurpose) {
  return AiPurposeSchema.parse(purpose)
}

export function assertFeaturePurposeAllowed(feature: AiFeatureKey, purpose: AiPurpose) {
  const cleanedFeature = AiFeatureKeySchema.parse(feature)
  const cleanedPurpose = assertPurposeAllowed(purpose)
  const allowedPurposes = AI_FEATURE_ALLOWED_PURPOSES[cleanedFeature]
  if (!allowedPurposes.includes(cleanedPurpose)) {
    throw new Error("Purpose is not allowed for this AI feature.")
  }
  return cleanedPurpose
}

export function assertDistrictIsolation({
  requestedDistrictId,
  sessionDistrictId,
}: {
  requestedDistrictId: string
  sessionDistrictId: string
}) {
  const cleanedRequested = requestedDistrictId.trim().toLowerCase()
  const cleanedSession = sessionDistrictId.trim().toLowerCase()
  return cleanedRequested.length > 0 && cleanedRequested === cleanedSession
}

export function sanitizeForAiPrompt(input: string) {
  return redactPotentialPii(input).slice(0, 1200)
}

export function sanitizeTopicList(topics: string[]) {
  return topics.slice(0, 10).map((item) => sanitizeForAiPrompt(item))
}

export function buildInferenceId(feature: AiFeatureKey) {
  const random = Math.random().toString(36).slice(2, 10)
  return `${feature}-${Date.now()}-${random}`
}

