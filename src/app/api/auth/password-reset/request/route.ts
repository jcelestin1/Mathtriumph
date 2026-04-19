import { createHash, randomBytes } from "node:crypto"

import { NextResponse } from "next/server"
import { z } from "zod"

import { checkRateLimit } from "@/lib/security/rate-limit"
import { prisma } from "@/lib/server/prisma"

const PasswordResetRequestSchema = z.object({
  email: z.string().email(),
})

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export async function POST(request: Request) {
  const ipKey =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "unknown"
  const rate = checkRateLimit({
    key: `password-reset-request:${ipKey}`,
    limit: 20,
    windowMs: 15 * 60 * 1000,
  })
  if (!rate.allowed) {
    return NextResponse.json(
      { message: "Too many reset requests. Please wait and retry." },
      { status: 429 }
    )
  }

  try {
    const body = PasswordResetRequestSchema.parse(await request.json())
    const email = body.email.trim().toLowerCase()
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    // Always return a generic success message to avoid account enumeration.
    if (!user) {
      return NextResponse.json({
        message: "If this email exists, a reset link has been sent.",
      })
    }

    const rawToken = randomBytes(32).toString("hex")
    const tokenHash = hashResetToken(rawToken)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30)

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    })

    return NextResponse.json({
      message: "If this email exists, a reset link has been sent.",
      resetToken: process.env.NODE_ENV === "development" ? rawToken : undefined,
    })
  } catch {
    return NextResponse.json(
      { message: "Invalid password reset request payload." },
      { status: 400 }
    )
  }
}
