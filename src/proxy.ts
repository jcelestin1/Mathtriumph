import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { getDashboardPathByRole } from "@/lib/demo-auth"
import { canAccessPath } from "@/lib/rbac"
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/security/session"

const AUTH_PAGES = ["/login", "/signup", "/forgot-password"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const session = verifySessionToken(token)
  const dashboardPath = getDashboardPathByRole(session?.role ?? "student")
  const isProtectedPath =
    pathname.startsWith("/dashboard") || pathname.startsWith("/practice")

  if (isProtectedPath && !session) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (session && pathname.startsWith("/dashboard/")) {
    if (!canAccessPath(session.role, pathname)) {
      return NextResponse.redirect(new URL(dashboardPath, request.url))
    } 
  }

  if (session && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/practice/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/dev/users",
  ],
}
