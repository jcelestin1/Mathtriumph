"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import {
  type DemoRole,
  fetchDemoAuthSnapshot,
  getDefaultAuthSnapshot,
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [{ isAuthenticated, role, districtId, permissions }, setAuthState] = useState<AuthState>(() => ({
    isAuthenticated: false,
    role: "student" as DemoRole,
    districtId: "fl-demo-district",
    permissions: [],
  }))
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    let active = true
    void fetchDemoAuthSnapshot().then((snapshot) => {
      if (!active) return
      setAuthState({
        isAuthenticated: snapshot.isAuthenticated,
        role: snapshot.role,
        districtId: snapshot.districtId,
        permissions: snapshot.permissions,
      })
      setIsHydrated(true)
    })
    return () => {
      active = false
    }
  }, [])

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
    const json = (await response.json()) as {
      role?: DemoRole
      districtId?: string
      permissions?: string[]
    }
    setAuthState((previous) => ({
      isAuthenticated: true,
      role: json.role ?? previous.role,
      districtId: json.districtId ?? previous.districtId,
      permissions: Array.isArray(json.permissions) ? json.permissions : previous.permissions,
    }))
  }, [])

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
    setAuthState((previous) => ({
      isAuthenticated: true,
      role: nextRole,
      districtId: previous.districtId,
      permissions: previous.permissions,
    }))
  }, [])

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    })
    const fallback = getDefaultAuthSnapshot()
    setAuthState({
      isAuthenticated: fallback.isAuthenticated,
      role: fallback.role,
      districtId: fallback.districtId,
      permissions: fallback.permissions,
    })
  }, [])

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
