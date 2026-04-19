import { z } from "zod"

import { redactPotentialPii } from "@/lib/security/pii"

export const FERPA_ALLOWED_AI_PURPOSES = [
  "eoc_preparation",
  "progress_tracking",
  "error_analysis",
] as const

export type AiPurpose = (typeof FERPA_ALLOWED_AI_PURPOSES)[number]

export const AiPurposeSchema = z.enum(FERPA_ALLOWED_AI_PURPOSES)

export const AI_GOVERNANCE_POLICY = {
  policyVersion: "2026.1-ferpa",
  architecture: "rag-isolated-per-district",
  trainingPolicy: "no-student-pii-training",
  inferenceRetention: "ephemeral-in-memory",
  highImpactDecisionPolicy: "human-in-the-loop-required",
} as const

export function getDefaultDistrictId() {
  return process.env.MT_DISTRICT_ID ?? "fl-demo-district"
}

export function assertPurposeAllowed(purpose: AiPurpose) {
  return AiPurposeSchema.parse(purpose)
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

