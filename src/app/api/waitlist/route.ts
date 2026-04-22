import { NextResponse } from "next/server"
import { z } from "zod"

import { deliverWaitlistSubmission } from "@/lib/server/waitlist"

type WaitlistPayload = {
  fullName?: string
  email?: string
}

const WaitlistSchema = z.object({
  fullName: z.string().max(120).optional(),
  email: z.string().email(),
})

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = WaitlistSchema.parse((await request.json()) as WaitlistPayload)
    const fullName = body.fullName?.trim() ?? ""
    const email = body.email.trim().toLowerCase()
    const submission = {
      fullName: fullName || undefined,
      email,
      submittedAt: new Date().toISOString(),
    }
    const result = await deliverWaitlistSubmission(submission)

    if (result.destination === "local_queue") {
      console.info("[waitlist] queued submission locally (CRM webhook not configured)", {
        email,
      })
    }

    return NextResponse.json({
      message:
        "Thanks! You're on the MathTriumph waitlist. We will email next steps soon.",
    })
  } catch {
    return NextResponse.json(
      { message: "Invalid request payload. Please try again." },
      { status: 400 }
    )
  }
}
