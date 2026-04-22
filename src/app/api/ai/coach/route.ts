import { NextResponse } from "next/server"
import { z } from "zod"

import {
  AI_COACH_MODELS,
  type AiCoachModel,
  getCoachModelLabel,
} from "@/lib/ai-coach"
import { getServerSession } from "@/lib/security/auth-server"
import { logSecurityEvent } from "@/lib/security/audit-log"
import {
  AI_GOVERNANCE_POLICY,
  assertDistrictIsolation,
  assertFeaturePurposeAllowed,
  buildInferenceId,
  sanitizeTopicList,
} from "@/lib/security/ai-governance"
import { checkRateLimit } from "@/lib/security/rate-limit"
import { redactPotentialPii } from "@/lib/security/pii"

const MAX_RESULTS = 10

const CoachPayloadSchema = z.object({
  purpose: z.enum(["eoc_preparation", "progress_tracking", "error_analysis"]),
  districtId: z.string().min(2).max(80),
  model: z.enum(["claude-4", "gpt-5.1"]).optional(),
  scorePercent: z.number().min(0).max(100).optional(),
  elapsedSeconds: z.number().min(0).optional(),
  weakTopics: z.array(z.string().max(120)).max(6).optional(),
  results: z
    .array(
      z.object({
        topic: z.string().max(120),
        isCorrect: z.boolean(),
        userAnswer: z.string().max(500),
        expectedAnswer: z.string().max(500),
      })
    )
    .max(MAX_RESULTS)
    .optional(),
})

type CoachPayload = z.infer<typeof CoachPayloadSchema>

function isAiCoachModel(value: unknown): value is AiCoachModel {
  return typeof value === "string" && AI_COACH_MODELS.includes(value as AiCoachModel)
}

function buildCoachPrompt(payload: Required<CoachPayload>) {
  const incorrect = payload.results.filter((item) => !item.isCorrect)
  const incorrectLines =
    incorrect.length > 0
      ? incorrect
          .map(
            (item) =>
              `- Topic: ${redactPotentialPii(item.topic)}; Student answer: "${redactPotentialPii(item.userAnswer || "No answer")}"; Expected: "${redactPotentialPii(item.expectedAnswer)}"`
          )
          .join("\n")
      : "- None. Student got all items correct."

  const weakTopicLine =
    payload.weakTopics.length > 0
      ? payload.weakTopics.join(", ")
      : "No explicit weak topic list provided."

  return [
    "You are MathTriumph AI Coach.",
    "FERPA safeguards:",
    "- Purpose limitation: eoc preparation and educational progress support only.",
    "- Never infer or output personal identifiers.",
    "- Keep recommendations advisory and require teacher confirmation.",
    "- Do not recommend disciplinary, legal, or placement decisions.",
    "",
    "Give practical K-12 friendly feedback with a confident, encouraging tone.",
    "Output in markdown with these exact sections:",
    "## Strength Snapshot",
    "## Top Fixes",
    "## 7-Day Practice Plan",
    "## Parent/Teacher Talking Point",
    "",
    "Constraints:",
    "- Keep total response under 220 words.",
    "- Use specific math topics and avoid generic phrases.",
    "- Include one confidence-building sentence.",
    "",
    "Student attempt data:",
    `- Score: ${payload.scorePercent}%`,
    `- Elapsed time: ${payload.elapsedSeconds} seconds`,
    `- Weak topics: ${weakTopicLine}`,
    "- Incorrect responses:",
    incorrectLines,
  ].join("\n")
}

async function callAnthropic(prompt: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error("Anthropic API key is not configured.")
  }

  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514"
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 700,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Anthropic request failed: ${response.status} ${errorText}`)
  }

  const json = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>
  }
  const text =
    json.content?.find((item) => item.type === "text" && item.text)?.text ?? ""
  if (!text) {
    throw new Error("Anthropic response did not include text content.")
  }
  return text
}

async function callOpenAi(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured.")
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-5.1"
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      store: false,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are a concise K-12 math coach for MathTriumph. Be specific and practical.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`)
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const text = json.choices?.[0]?.message?.content ?? ""
  if (!text) {
    throw new Error("OpenAI response did not include message content.")
  }
  return text
}

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
      key: `ai-coach:${ip}`,
      limit: 50,
      windowMs: 15 * 60 * 1000,
    })
    if (!rate.allowed) {
      return NextResponse.json(
        { message: "AI coach rate limit reached. Please retry shortly." },
        { status: 429 }
      )
    }

    const body = CoachPayloadSchema.parse(await request.json()) as CoachPayload
    const purpose = assertFeaturePurposeAllowed("ai_coach", body.purpose)
    const inferenceId = buildInferenceId("ai_coach")
    const districtAllowed = assertDistrictIsolation({
      requestedDistrictId: body.districtId,
      sessionDistrictId: session.districtId,
    })
    if (!districtAllowed) {
      await logSecurityEvent({
        eventType: "district_isolation_blocked",
        feature: "ai_coach",
        requestedDistrictId: body.districtId,
        sessionDistrictId: session.districtId,
      })
      return NextResponse.json({ message: "District isolation validation failed." }, { status: 403 })
    }

    const model: AiCoachModel = isAiCoachModel(body.model) ? body.model : "gpt-5.1"
    const payload: Required<CoachPayload> = {
      purpose,
      districtId: session.districtId,
      model,
      scorePercent: Math.max(0, Math.min(100, body.scorePercent ?? 0)),
      elapsedSeconds: Math.max(0, body.elapsedSeconds ?? 0),
      weakTopics: sanitizeTopicList(Array.isArray(body.weakTopics) ? body.weakTopics : []),
      results: Array.isArray(body.results) ? body.results.slice(0, MAX_RESULTS) : [],
    }

    if (payload.results.length === 0) {
      return NextResponse.json(
        { message: "No quiz results were provided for coaching." },
        { status: 400 }
      )
    }

    await logSecurityEvent({
      eventType: "ai_inference_started",
      feature: "ai_coach",
      inferenceId,
      districtId: session.districtId,
      purpose,
      model,
      resultCount: payload.results.length,
      policyVersion: AI_GOVERNANCE_POLICY.policyVersion,
    })

    const prompt = buildCoachPrompt(payload)
    const feedback =
      model === "claude-4"
        ? await callAnthropic(prompt)
        : await callOpenAi(prompt)

    await logSecurityEvent({
      eventType: "ai_inference_completed",
      feature: "ai_coach",
      inferenceId,
      districtId: session.districtId,
      purpose,
      model,
      resultCount: payload.results.length,
      weakTopicCount: payload.weakTopics.length,
      requiresHumanReview: true,
      architecture: AI_GOVERNANCE_POLICY.architecture,
      processingBoundary: AI_GOVERNANCE_POLICY.processingBoundary,
    })

    return NextResponse.json({
      model,
      providerLabel: getCoachModelLabel(model),
      feedback,
      compliance: {
        purpose,
        districtId: session.districtId,
        requiresHumanReview: true,
        policyVersion: AI_GOVERNANCE_POLICY.policyVersion,
      },
      audit: {
        inferenceId,
      },
    })
  } catch (error) {
    await logSecurityEvent({
      eventType: "ai_inference_failed",
      feature: "ai_coach",
      errorMessage: error instanceof Error ? error.message : "unknown",
    })
    return NextResponse.json(
      { message: "Unable to generate AI coaching feedback right now." },
      { status: 500 }
    )
  }
}

export async function GET() {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  const hasOpenAi = Boolean(process.env.OPENAI_API_KEY)
  const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY)

  return NextResponse.json({
    models: {
      "gpt-5.1": {
        connected: hasOpenAi,
        provider: "openai",
      },
      "claude-4": {
        connected: hasAnthropic,
        provider: "anthropic",
      },
    },
    anyConnected: hasOpenAi || hasAnthropic,
  })
}
