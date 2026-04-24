import { NextResponse } from "next/server"
import { z } from "zod"

import { getServerSession } from "@/lib/security/auth-server"
import { logSecurityEvent } from "@/lib/security/audit-log"

// ─── Schema ───────────────────────────────────────────────────────────────────

const MonitorEventSchema = z.object({
  kind: z.string(),
  ts: z.number(),
  durationMs: z.number().optional(),
  count: z.number().optional(),
  warning: z.string().nullable().optional(),
  // Camera snapshot – stored as truncated reference, not raw base64.
  dataUrl: z.string().optional(),
})

const RequestBodySchema = z.object({
  quizId: z.string().min(1).max(128),
  userId: z.string().optional(),
  events: z.array(MonitorEventSchema).min(1).max(200),
})

type ParsedBody = z.infer<typeof RequestBodySchema>

// ─── POST /api/exam/monitor-events ────────────────────────────────────────────
//
// Accepts a batch of monitor events from the client, validates the session,
// and writes them to the append-only security audit log.  Camera snapshots are
// intentionally stripped of their base64 payload before logging (we only record
// that a snapshot was taken, not the raw image) to keep the log lean.

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: ParsedBody
  try {
    const raw: unknown = await request.json()
    body = RequestBodySchema.parse(raw)
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { quizId, events } = body
  const now = new Date().toISOString()

  // Write each event to the immutable audit log.
  for (const event of events) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { dataUrl: _snapshotPayload, ...safeEvent } = event

    await logSecurityEvent({
      eventType: `exam_monitor_${event.kind}`,
      userId: session.userId,
      role: session.role,
      districtId: session.districtId,
      quizId,
      receivedAt: now,
      hasSnapshot: event.kind === "camera_snapshot" && Boolean(event.dataUrl),
      ...safeEvent,
    })
  }

  return NextResponse.json({ logged: events.length })
}
