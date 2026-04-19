import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { z } from "zod"

import { getDashboardPathByRole } from "@/lib/demo-auth"
import { canSwitchToRole } from "@/lib/rbac"
import { logSecurityEvent } from "@/lib/security/audit-log"
import { getEffectivePermissions, hasDistrictPermission } from "@/lib/security/permission-policy"
import { createSessionToken, SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/security/session"
import { prisma } from "@/lib/server/prisma"

const IS_PROD = process.env.NODE_ENV === "production"

const SwitchRoleSchema = z.object({
  role: z.enum([
    "district_admin",
    "school_admin",
    "tech_admin",
    "interventionist",
    "instructional_coach",
    "data_analyst",
    "teacher",
    "student",
    "parent",
    "support_admin",
  ]),
})

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const currentToken = cookieStore.get(SESSION_COOKIE_NAME)?.value
    const currentSession = verifySessionToken(currentToken)
    if (!currentSession) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 })
    }

    const body = SwitchRoleSchema.parse(await request.json())
    const canRoleSwitch = await hasDistrictPermission({
      districtId: currentSession.districtId,
      role: currentSession.role,
      permission: "role.switch.demo",
    })
    if (!canRoleSwitch) {
      return NextResponse.json(
        { message: "Role switching is disabled for this account policy." },
        { status: 403 }
      )
    }
    const canDirectSwitch = canSwitchToRole(currentSession.role, body.role)
    let canDelegatedSwitch = false
    if (!canDirectSwitch) {
      const now = new Date()
      const grant = await prisma.delegationGrant.findFirst({
        where: {
          granteeUserId: currentSession.userId,
          targetRole: body.role,
          revokedAt: null,
          startsAt: { lte: now },
          endsAt: { gt: now },
        },
        select: { id: true },
      })
      canDelegatedSwitch = Boolean(grant)
    }

    if (!canDirectSwitch && !canDelegatedSwitch) {
      await logSecurityEvent({
        eventType: "role_switch_denied",
        actorRole: currentSession.role,
        actorUserId: currentSession.userId,
        targetRole: body.role,
      })
      return NextResponse.json(
        { message: "Role switching is restricted to authorized admin actions." },
        { status: 403 }
      )
    }

    const newSession = createSessionToken({
      userId: currentSession.userId,
      districtId: currentSession.districtId,
      role: body.role,
      rememberMe: true,
    })
    cookieStore.set(SESSION_COOKIE_NAME, newSession.token, {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "lax",
      path: "/",
      maxAge: newSession.maxAge,
    })

    return NextResponse.json({
      ok: true,
      role: body.role,
      permissions: await getEffectivePermissions(currentSession.districtId, body.role),
      redirectTo: getDashboardPathByRole(body.role),
    })
  } catch {
    await logSecurityEvent({
      eventType: "role_switch_error",
    })
    return NextResponse.json({ message: "Invalid role switch payload." }, { status: 400 })
  }
}
