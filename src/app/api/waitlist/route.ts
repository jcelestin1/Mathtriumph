import { createHash } from "node:crypto"

import { NextResponse } from "next/server"
import { z } from "zod"

import { logSecurityEvent } from "@/lib/security/audit-log"
import { checkRateLimit } from "@/lib/security/rate-limit"
import {
  forwardToCrm,
  recordWaitlistEntry,
  type WaitlistEntry,
} from "@/lib/server/waitlist-store"

type WaitlistPayload = {
  fullName?: string
  email?: string
  source?: string
}

const WaitlistSchema = z.object({
  fullName: z.string().max(120).optional(),
  email: z.string().email(),
  source: z.string().max(80).optional(),
})

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16)
}

export async function POST(request: Request) {
  const ipKey =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "unknown"

  const rate = checkRateLimit({
    key: `waitlist:${ipKey}`,
    limit: 10,
    windowMs: 15 * 60 * 1000,
  })
  if (!rate.allowed) {
    return NextResponse.json(
      { message: "Too many waitlist attempts. Please wait and retry." },
      { status: 429 }
    )
  }

  try {
    const body = WaitlistSchema.parse((await request.json()) as WaitlistPayload)
    const fullName = body.fullName?.trim() ?? ""
    const email = body.email.trim().toLowerCase()
    const source = body.source?.trim() || "landing-page"

    const entry: WaitlistEntry = {
      email,
      fullName: fullName || undefined,
      submittedAt: new Date().toISOString(),
      source,
      ipHash: ipKey === "unknown" ? undefined : hashIp(ipKey),
    }

    const { stored, duplicate } = await recordWaitlistEntry(entry)

    if (duplicate) {
      await logSecurityEvent({
        eventType: "waitlist_duplicate",
        email,
        source,
      })
      return NextResponse.json({
        message:
          "You're already on the MathTriumph waitlist. We'll be in touch soon.",
      })
    }

    const forwardResult = await forwardToCrm(entry)

    await logSecurityEvent({
      eventType: "waitlist_submission",
      email,
      source,
      stored,
      crm: forwardResult,
    })

    return NextResponse.json({
      message:
        "Thanks! You're on the MathTriumph waitlist. We will email next steps soon.",
    })
  } catch (error) {
    await logSecurityEvent({
      eventType: "waitlist_error",
      error: error instanceof Error ? error.message : "unknown",
    })
    return NextResponse.json(
      { message: "Invalid request payload. Please try again." },
      { status: 400 }
    )
  }
}
