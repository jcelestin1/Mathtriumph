import { createHash } from "node:crypto"

import { NextResponse } from "next/server"
import { z } from "zod"

import { hashPassword } from "@/lib/security/password"
import { checkRateLimit } from "@/lib/security/rate-limit"
import { prisma } from "@/lib/server/prisma"

const PasswordResetConfirmSchema = z
  .object({
    token: z.string().min(24),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[0-9]/),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
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
    key: `password-reset-confirm:${ipKey}`,
    limit: 25,
    windowMs: 15 * 60 * 1000,
  })
  if (!rate.allowed) {
    return NextResponse.json(
      { message: "Too many reset attempts. Please wait and retry." },
      { status: 429 }
    )
  }

  try {
    const body = PasswordResetConfirmSchema.parse(await request.json())
    const tokenHash = hashResetToken(body.token)
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        usedAt: true,
        expiresAt: true,
      },
    })
    if (!resetRecord) {
      return NextResponse.json({ message: "Invalid or expired reset token." }, { status: 400 })
    }
    if (resetRecord.usedAt || resetRecord.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ message: "Invalid or expired reset token." }, { status: 400 })
    }

    const nextPasswordHash = await hashPassword(body.password)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash: nextPasswordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { message: "Invalid password reset confirmation payload." },
      { status: 400 }
    )
  }
}
