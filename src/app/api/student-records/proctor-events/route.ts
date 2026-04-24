import { NextResponse } from "next/server"
import { z } from "zod"

import { checkRateLimit } from "@/lib/security/rate-limit"
import { getServerSession } from "@/lib/security/auth-server"
import { appendProctorEvents } from "@/lib/server/student-records"

const ProctorEventSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  severity: z.enum(["low", "medium", "high"]),
  timestamp: z.string().min(1),
  quizId: z.string().optional(),
  detail: z.string().max(500).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

const PayloadSchema = z.object({
  events: z.array(ProctorEventSchema).min(1).max(120),
})

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
    key: `proctor-events-write:${ip}`,
    limit: 240,
    windowMs: 15 * 60 * 1000,
  })
  if (!rate.allowed) {
    return NextResponse.json({ message: "Too many writes." }, { status: 429 })
  }

  try {
    const payload = PayloadSchema.parse(await request.json())
    await appendProctorEvents(session.districtId, session.userId, payload.events)
    return NextResponse.json({ ok: true, received: payload.events.length })
  } catch {
    return NextResponse.json({ message: "Invalid proctor events payload." }, { status: 400 })
  }
}
