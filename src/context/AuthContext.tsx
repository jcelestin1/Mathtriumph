"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import {
  type DemoRole,
} from "@/lib/demo-auth"
import { type AppPermission } from "@/lib/rbac"

type AuthContextValue = {
  isAuthenticated: boolean
  role: DemoRole
  districtId: string
  permissions: string[]
  isHydrated: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  loginAs: (
    role: DemoRole,
    rememberMe?: boolean,
    email?: string,
    password?: string
  ) => Promise<void>
  switchRole: (role: DemoRole) => Promise<void>
  logout: () => Promise<void>
  can: (permission: AppPermission) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

type AuthState = {
  isAuthenticated: boolean
  role: DemoRole
  districtId: string
  permissions: string[]
}

const FALLBACK_AUTH_STATE: AuthState = {
  isAuthenticated: false,
  role: "student",
  districtId: "fl-demo-district",
  permissions: [],
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [{ isAuthenticated, role, districtId, permissions }, setAuthState] = useState<AuthState>(() => ({
    isAuthenticated: false,
    role: "student" as DemoRole,
    districtId: "fl-demo-district",
    permissions: [],
  }))
  const [isHydrated, setIsHydrated] = useState(false)

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        headers: { "content-type": "application/json" },
        cache: "no-store",
      })
      if (!response.ok) {
        setAuthState(FALLBACK_AUTH_STATE)
        return
      }
      const json = (await response.json()) as Partial<AuthState>
      setAuthState({
        isAuthenticated: Boolean(json.isAuthenticated),
        role: (json.role as DemoRole | undefined) ?? "student",
        districtId: json.districtId ?? "fl-demo-district",
        permissions: Array.isArray(json.permissions) ? json.permissions : [],
      })
    } catch {
      setAuthState(FALLBACK_AUTH_STATE)
    }
  }, [])

  useEffect(() => {
    let active = true
    void (async () => {
      await refreshSession()
      if (active) setIsHydrated(true)
    })()
    return () => {
      active = false
    }
  }, [refreshSession])

  const login = useCallback(async (email: string, password: string, rememberMe = true) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        rememberMe,
      }),
    })
    if (!response.ok) {
      throw new Error("Login failed.")
    }
    await refreshSession()
  }, [refreshSession])

  const loginAs = useCallback(async (
    nextRole: DemoRole,
    rememberMe = true,
    email?: string,
    password?: string
  ) => {
    await login(
      email ?? `${nextRole}@demo.mathtriumph.local`,
      password ?? "MathTriumph2026!",
      rememberMe
    )
  }, [login])

  const switchRole = useCallback(async (nextRole: DemoRole) => {
    const response = await fetch("/api/auth/switch-role", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    })
    if (!response.ok) {
      throw new Error("Role switch is not authorized for this account.")
    }
    await refreshSession()
  }, [refreshSession])

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    })
    await refreshSession()
  }, [refreshSession])

  const value = useMemo(
    () => ({
      isAuthenticated,
      role,
      districtId,
      permissions,
      isHydrated,
      login,
      loginAs,
      switchRole,
      logout,
      can: (permission: AppPermission) => permissions.includes(permission),
    }),
    [districtId, isAuthenticated, isHydrated, login, loginAs, logout, permissions, role, switchRole]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
