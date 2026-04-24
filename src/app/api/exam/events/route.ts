import { NextResponse } from "next/server"
import { z } from "zod"

import { getServerSession } from "@/lib/security/auth-server"
import { logSecurityEvent } from "@/lib/security/audit-log"
import { checkRateLimit } from "@/lib/security/rate-limit"

const ExamEventSchema = z.object({
  type: z.enum([
    "heartbeat",
    "focus_lost",
    "focus_restored",
    "visibility_hidden",
    "visibility_visible",
    "hardware_warning",
    "lockdown_engaged",
    "lockdown_lifted",
    "penalty_assessed",
    "penalty_acknowledged",
    "fullscreen_exited",
    "screen_change",
    "exam_started",
    "exam_completed",
    "camera_snapshot",
  ]),
  attemptId: z.string().min(1).max(128),
  quizId: z.string().min(1).max(128),
  timestamp: z.number().int().positive(),
  severity: z.enum(["low", "medium", "high"]).optional(),
  detail: z.string().max(500).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

const PayloadSchema = z.object({
  events: z.array(ExamEventSchema).min(1).max(50),
})

const HEARTBEAT_TYPES = new Set(["heartbeat"])
// Camera snapshots can be large data URLs — strip them from the audit log
// payload so we never persist student PII into the security log file.
function sanitizeMetadata(metadata: Record<string, unknown> | undefined) {
  if (!metadata) return undefined
  const sanitized: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(metadata)) {
    if (typeof value === "string" && value.length > 256) {
      sanitized[key] = `[redacted ${value.length} chars]`
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
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

  // Allow generous batched throughput (60 requests/min) since each request
  // can carry up to 50 batched events. This still caps a misbehaving client.
  const rate = checkRateLimit({
    key: `exam-events:${ip}`,
    limit: 60,
    windowMs: 60 * 1000,
  })
  if (!rate.allowed) {
    return NextResponse.json(
      { message: "Too many event submissions." },
      { status: 429 }
    )
  }

  let payload: z.infer<typeof PayloadSchema>
  try {
    payload = PayloadSchema.parse(await request.json())
  } catch {
    return NextResponse.json(
      { message: "Invalid event batch payload." },
      { status: 400 }
    )
  }

  // Persist any non-heartbeat or high-severity events to the security audit
  // log. Heartbeats are deliberately dropped at this layer to keep the log
  // file from being dominated by no-op records.
  const persisted = payload.events.filter(
    (event) => !HEARTBEAT_TYPES.has(event.type) || event.severity === "high"
  )

  for (const event of persisted) {
    await logSecurityEvent({
      eventType: `exam_${event.type}`,
      attemptId: event.attemptId,
      quizId: event.quizId,
      severity: event.severity ?? "low",
      detail: event.detail,
      metadata: sanitizeMetadata(event.metadata),
      userId: session.userId,
      districtId: session.districtId,
      role: session.role,
      eventClientTimestamp: new Date(event.timestamp).toISOString(),
    })
  }

  return NextResponse.json({
    accepted: payload.events.length,
    persisted: persisted.length,
  })
}
