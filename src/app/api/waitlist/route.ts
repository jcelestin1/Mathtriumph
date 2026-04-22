import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/server/prisma"

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

    await prisma.waitlistEntry.upsert({
      where: { email },
      update: { fullName: fullName || null },
      create: { email, fullName: fullName || null },
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
