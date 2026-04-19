import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { logSecurityEvent } from "@/lib/security/audit-log"
import { SESSION_COOKIE_NAME } from "@/lib/security/session"

const IS_PROD = process.env.NODE_ENV === "production"

export async function POST() {
  const cookieStore = await cookies()
  await logSecurityEvent({
    eventType: "auth_logout",
  })
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })

  return NextResponse.json({ ok: true })
}
