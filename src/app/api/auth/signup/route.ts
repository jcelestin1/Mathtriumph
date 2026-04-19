import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { z } from "zod"

import { getDashboardPathByRole } from "@/lib/demo-auth"
import { getDefaultDistrictId } from "@/lib/security/ai-governance"
import { logSecurityEvent } from "@/lib/security/audit-log"
import { getEffectivePermissions } from "@/lib/security/permission-policy"
import { hashPassword } from "@/lib/security/password"
import { checkRateLimit } from "@/lib/security/rate-limit"
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/security/session"
import { prisma } from "@/lib/server/prisma"

const IS_PROD = process.env.NODE_ENV === "production"

const SignupSchema = z
  .object({
    fullName: z.string().min(2).max(120),
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[0-9]/),
    confirmPassword: z.string(),
    role: z.enum(["student", "teacher", "parent"]).default("student"),
    rememberMe: z.boolean().optional().default(true),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export async function POST(request: Request) {
  const ipKey =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "unknown"
  const rate = checkRateLimit({
    key: `auth-signup:${ipKey}`,
    limit: 20,
    windowMs: 15 * 60 * 1000,
  })
  if (!rate.allowed) {
    return NextResponse.json(
      { message: "Too many signup attempts. Please wait and retry." },
      { status: 429 }
    )
  }

  try {
    const body = SignupSchema.parse(await request.json())
    const email = body.email.trim().toLowerCase()
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })
    if (existing) {
      await logSecurityEvent({
        eventType: "auth_signup_failed",
        reason: "email_exists",
        email,
      })
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(body.password)
    const user = await prisma.user.create({
      data: {
        fullName: body.fullName.trim(),
        email,
        passwordHash,
        role: body.role,
        districtId: getDefaultDistrictId(),
      },
      select: {
        id: true,
        role: true,
        districtId: true,
      },
    })

    const session = createSessionToken({
      userId: user.id,
      districtId: user.districtId,
      role: user.role,
      rememberMe: body.rememberMe,
    })
    const permissions = await getEffectivePermissions(user.districtId, user.role)
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, session.token, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "lax",
      path: "/",
      maxAge: session.maxAge,
    })

    return NextResponse.json({
      isAuthenticated: true,
      role: user.role,
      districtId: user.districtId,
      permissions,
      redirectTo: getDashboardPathByRole(user.role),
    })
  } catch {
    await logSecurityEvent({
      eventType: "auth_signup_error",
    })
    return NextResponse.json({ message: "Invalid signup payload." }, { status: 400 })
  }
}
