import { cookies } from "next/headers"

import { getDashboardPathByRole } from "@/lib/demo-auth"
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/security/session"

export async function getServerSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  return verifySessionToken(token)
}

export async function getServerDashboardPath() {
  const session = await getServerSession()
  return session ? getDashboardPathByRole(session.role) : "/login"
}
