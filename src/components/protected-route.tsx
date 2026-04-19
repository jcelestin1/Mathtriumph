"use client"

import { Loader2 } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

import { useAuth } from "@/context/AuthContext"
import {
  type DemoRole,
  getDashboardPathByRole,
} from "@/lib/demo-auth"
import { getAllowedRolesForPath } from "@/lib/rbac"

type ProtectedRouteProps = {
  children: React.ReactNode
  allowedRoles?: DemoRole[]
}

function getAllowedRoles(pathname: string, allowedRoles?: DemoRole[]) {
  if (allowedRoles?.length) {
    return allowedRoles
  }
  return getAllowedRolesForPath(pathname) as DemoRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, role, isHydrated } = useAuth()

  const routeAllowedRoles = getAllowedRoles(pathname, allowedRoles)
  const hasRoleAccess = routeAllowedRoles.includes(role)

  const redirectTarget = !isAuthenticated
    ? `/login?from=${encodeURIComponent(pathname)}`
    : !hasRoleAccess
      ? getDashboardPathByRole(role)
      : null

  useEffect(() => {
    if (redirectTarget) {
      router.replace(redirectTarget)
    }
  }, [redirectTarget, router])

  if (!isHydrated || redirectTarget) {
    return (
      <section className="flex min-h-[50vh] items-center justify-center">
        <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-teal-600" />
          Checking access...
        </div>
      </section>
    )
  }

  return <>{children}</>
}
