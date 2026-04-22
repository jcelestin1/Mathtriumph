import { NextResponse } from "next/server"
import { z } from "zod"

import { checkRateLimit } from "@/lib/security/rate-limit"
import { getServerSession } from "@/lib/security/auth-server"
import { listDistrictAttempts, listUserAttempts } from "@/lib/server/student-records"

const QuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(8),
})

type MisconceptionSummary = {
  reportingCategory: string
  misconceptionTag: string
  errorType: string
  count: number
}

export const runtime = "nodejs"

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
    key: `attempts-misconceptions:${ip}`,
    limit: 80,
    windowMs: 15 * 60 * 1000,
  })
  if (!rate.allowed) {
    return NextResponse.json({ message: "Too many requests." }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const parsed = QuerySchema.safeParse({
    limit: searchParams.get("limit") ?? undefined,
  })
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid query parameters." }, { status: 400 })
  }

  const attempts =
    session.role === "teacher" || session.role === "school_admin"
      ? await listDistrictAttempts(session.districtId)
      : await listUserAttempts(session.districtId, session.userId)

  // Aggregate only de-identified misconception signals for data minimization.
  const bucket = new Map<string, MisconceptionSummary>()
  for (const attempt of attempts) {
    const analyses = Array.isArray(attempt.errorAnalyses) ? attempt.errorAnalyses : []
    for (const entry of analyses) {
      if (!entry) continue
      const reportingCategory =
        typeof entry.reportingCategory === "string" ? entry.reportingCategory : "unknown"
      const misconceptionTag =
        typeof entry.misconceptionTag === "string" ? entry.misconceptionTag : "unknown"
      const errorType = typeof entry.errorType === "string" ? entry.errorType : "unknown"
      const key = `${reportingCategory}|${misconceptionTag}|${errorType}`
      const current = bucket.get(key) ?? {
        reportingCategory,
        misconceptionTag,
        errorType,
        count: 0,
      }
      current.count += 1
      bucket.set(key, current)
    }
  }

  const patterns = Array.from(bucket.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, parsed.data.limit)

  return NextResponse.json({ patterns })
}
