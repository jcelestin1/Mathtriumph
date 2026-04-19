import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { z } from "zod"

import type { DemoRole } from "@/lib/demo-auth"
import { getDashboardPathByRole } from "@/lib/demo-auth"
import { getDefaultDistrictId } from "@/lib/security/ai-governance"
import { logSecurityEvent } from "@/lib/security/audit-log"
import { getEffectivePermissions } from "@/lib/security/permission-policy"
import { verifyPassword } from "@/lib/security/password"
import { checkRateLimit } from "@/lib/security/rate-limit"
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/security/session"
import { prisma } from "@/lib/server/prisma"

const IS_PROD = process.env.NODE_ENV === "production"

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  rememberMe: z.boolean().optional().default(true),
})

export async function POST(request: Request) {
  try {
    const ipKey =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      "unknown"
    const rate = checkRateLimit({
      key: `auth-login:${ipKey}`,
      limit: 20,
      windowMs: 15 * 60 * 1000,
    })
    if (!rate.allowed) {
      return NextResponse.json(
        { message: "Too many login attempts. Please wait and retry." },
        { status: 429 }
      )
    }

    const body = LoginSchema.parse(await request.json())
    const normalizedEmail = body.email.trim().toLowerCase()
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        passwordHash: true,
        role: true,
        districtId: true,
      },
    })
    if (!user) {
      await logSecurityEvent({
        eventType: "auth_login_failed",
        reason: "user_not_found",
        email: normalizedEmail,
      })
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 })
    }
    const passwordValid = await verifyPassword(body.password, user.passwordHash)
    if (!passwordValid) {
      await logSecurityEvent({
        eventType: "auth_login_failed",
        reason: "invalid_password",
        userId: user.id,
      })
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 })
    }

    const role = user.role as DemoRole
    const districtId = user.districtId || getDefaultDistrictId()
    const permissions = await getEffectivePermissions(districtId, role)
    const session = createSessionToken({
      userId: user.id,
      districtId,
      role,
      rememberMe: body.rememberMe,
    })

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
      role,
      districtId: session.payload.districtId,
      permissions,
      redirectTo: getDashboardPathByRole(role),
    })
  } catch {
    await logSecurityEvent({
      eventType: "auth_login_error",
    })
    return NextResponse.json(
      { message: "Invalid login request payload." },
      { status: 400 }
    )
  }
}
