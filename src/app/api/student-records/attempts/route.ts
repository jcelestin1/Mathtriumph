import { NextResponse } from "next/server"
import { z } from "zod"

import type { QuizAttempt } from "@/lib/quiz-engine"
import { checkRateLimit } from "@/lib/security/rate-limit"
import { getServerSession } from "@/lib/security/auth-server"
import {
  deleteUserAttempts,
  listDistrictAttempts,
  listUserAttempts,
  updateAttemptReview,
  upsertAttempt,
} from "@/lib/server/student-records"

const ReviewPatchSchema = z.object({
  attemptId: z.string().min(1),
  status: z.enum(["pending", "acknowledged", "escalated"]).optional(),
  notes: z.string().max(2000).optional(),
})

const MinimalAttemptSchema = z.object({
  attemptId: z.string().min(1),
  quizId: z.string().min(1),
  role: z.enum([
    "district_admin",
    "school_admin",
    "tech_admin",
    "interventionist",
    "instructional_coach",
    "data_analyst",
    "teacher",
    "student",
    "parent",
    "support_admin",
  ]),
  startedAt: z.string().min(1),
  completedAt: z.string().min(1),
  elapsedSeconds: z.number().int().nonnegative(),
  scorePercent: z.number().min(0).max(100),
  answers: z.record(z.string(), z.string()),
  results: z.array(z.any()),
  questionWork: z.array(z.any()),
  antiCheatFlags: z.array(z.any()),
  oralVerificationPrompts: z.array(z.string()),
  integrityReview: z.any().optional(),
  errorAnalyses: z.array(z.any()).optional(),
  eocPrediction: z.any().optional(),
  proctorEvents: z
    .array(
      z.object({
        id: z.string().min(1),
        type: z.string().min(1),
        severity: z.enum(["low", "medium", "high"]),
        timestamp: z.string().min(1),
        quizId: z.string().optional(),
        detail: z.string().max(500).optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .optional(),
})

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
    key: `attempts-read:${ip}`,
    limit: 120,
    windowMs: 15 * 60 * 1000,
  })
  if (!rate.allowed) {
    return NextResponse.json({ message: "Too many requests." }, { status: 429 })
  }

  const attempts =
    session.role === "teacher" || session.role === "school_admin"
      ? await listDistrictAttempts(session.districtId)
      : await listUserAttempts(session.districtId, session.userId)
  return NextResponse.json({ attempts })
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
    key: `attempts-write:${ip}`,
    limit: 80,
    windowMs: 15 * 60 * 1000,
  })
  if (!rate.allowed) {
    return NextResponse.json({ message: "Too many writes." }, { status: 429 })
  }

  try {
    const body = (await request.json()) as { attempt: QuizAttempt }
    const attempt = MinimalAttemptSchema.parse(body.attempt)
    await upsertAttempt(
      session.districtId,
      session.userId,
      session.role,
      attempt as QuizAttempt
    )
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: "Invalid attempt payload." }, { status: 400 })
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  if (!(session.role === "teacher" || session.role === "school_admin")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 })
  }

  try {
    const payload = ReviewPatchSchema.parse(await request.json())
    await updateAttemptReview(payload.attemptId, {
      status: payload.status,
      notes: payload.notes,
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: "Invalid review payload." }, { status: 400 })
  }
}

export async function DELETE() {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }
  await deleteUserAttempts(session.districtId, session.userId)
  return NextResponse.json({ ok: true })
}
