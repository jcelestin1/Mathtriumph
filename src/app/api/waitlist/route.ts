import { NextResponse } from "next/server"
import { z } from "zod"

type WaitlistPayload = {
  fullName?: string
  email?: string
}

const WaitlistSchema = z.object({
  fullName: z.string().max(120).optional(),
  email: z.string().email(),
})

export async function POST(request: Request) {
  try {
    const body = WaitlistSchema.parse((await request.json()) as WaitlistPayload)
    const fullName = body.fullName?.trim() ?? ""
    const email = body.email.trim().toLowerCase()

    // Temporary endpoint: currently logs submissions to the server console.
    // TODO: Replace with workspace email or CRM integration when available.
    console.log("[waitlist] new submission", {
      fullName: fullName || undefined,
      email,
      submittedAt: new Date().toISOString(),
    })

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
