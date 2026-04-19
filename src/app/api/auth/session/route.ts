import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { getEffectivePermissions } from "@/lib/security/permission-policy"
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/security/session"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  const session = verifySessionToken(token)
  if (!session) {
    return NextResponse.json({
      isAuthenticated: false,
      role: "student",
      districtId: "fl-demo-district",
      permissions: [],
    })
  }

  const permissions = await getEffectivePermissions(session.districtId, session.role)

  return NextResponse.json({
    isAuthenticated: true,
    role: session.role,
    userId: session.userId,
    districtId: session.districtId,
    permissions,
  })
}
