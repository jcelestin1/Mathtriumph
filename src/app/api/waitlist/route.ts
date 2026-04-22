import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/server/prisma"

type WaitlistPayload = {
  fullName?: string
  email?: string
}

const WaitlistSchema = z.object({
  fullName: z.string().trim().max(120).optional(),
  email: z.string().trim().email(),
})

const WAITLIST_SUCCESS_MESSAGE =
  "Thanks! You're on the MathTriumph waitlist. We will email next steps soon."

export async function POST(request: Request) {
  try {
    const body = WaitlistSchema.parse((await request.json()) as WaitlistPayload)
    const fullName = body.fullName ?? ""
    const email = body.email.toLowerCase()

    await prisma.waitlistSubmission.upsert({
      where: { email },
      update: {
        fullName: fullName || null,
      },
      create: {
        fullName: fullName || null,
        email,
      },
    })

    return NextResponse.json({ message: WAITLIST_SUCCESS_MESSAGE })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid request payload. Please try again." },
        { status: 400 }
      )
    }

    console.error("[waitlist] failed to persist submission", error)

    return NextResponse.json(
      { message: "Unable to save your waitlist request right now. Please try again." },
      { status: 500 }
    )
  }
}
