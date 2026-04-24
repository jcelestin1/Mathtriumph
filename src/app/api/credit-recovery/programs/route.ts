import { NextResponse } from "next/server"
import { z } from "zod"

import { checkRateLimit } from "@/lib/security/rate-limit"
import { getServerSession } from "@/lib/security/auth-server"
import { listCreditRecoveryPrograms } from "@/lib/server/credit-recovery"

const QuerySchema = z.object({
  includeCatalog: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value !== "false"),
  recoveryType: z
    .enum(["course_recovery", "eoc_remediation", "bridge_readiness"])
    .optional(),
  gradeLevel: z.coerce.number().int().min(6).max(12).optional(),
  eocCourse: z.enum(["Algebra 1", "Geometry"]).optional(),
})

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
    key: `credit-recovery-programs-read:${ip}`,
    limit: 120,
    windowMs: 15 * 60 * 1000,
  })
  if (!rate.allowed) {
    return NextResponse.json({ message: "Too many requests." }, { status: 429 })
  }

  const url = new URL(request.url)
  const parsed = QuerySchema.safeParse({
    includeCatalog: url.searchParams.get("includeCatalog") ?? undefined,
    recoveryType: url.searchParams.get("recoveryType") ?? undefined,
    gradeLevel: url.searchParams.get("gradeLevel") ?? undefined,
    eocCourse: url.searchParams.get("eocCourse") ?? undefined,
  })
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid query parameters." }, { status: 400 })
  }

  const programs = await listCreditRecoveryPrograms({
    districtId: session.districtId,
    includeCatalog: parsed.data.includeCatalog,
    recoveryType: parsed.data.recoveryType,
    gradeLevel: parsed.data.gradeLevel,
    eocCourse: parsed.data.eocCourse,
    includeModules: true,
  })

  return NextResponse.json({ programs })
}
