"use client"

import { createContext, useContext } from "react"
import type { DemoRole } from "@/lib/demo-auth"

export type DashboardRole = DemoRole

type DashboardRoleContextValue = {
  role: DashboardRole
  setRole: (role: DashboardRole) => void
}

const DashboardRoleContext = createContext<DashboardRoleContextValue | null>(null)

export function DashboardRoleProvider({
  value,
  children,
}: {
  value: DashboardRoleContextValue
  children: React.ReactNode
}) {
  return (
    <DashboardRoleContext.Provider value={value}>
      {children}
    </DashboardRoleContext.Provider>
  )
}

export function useDashboardRole() {
  const context = useContext(DashboardRoleContext)
  if (!context) {
    throw new Error("useDashboardRole must be used within DashboardRoleProvider")
  }
  return context
}
