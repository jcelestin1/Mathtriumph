import { type AppRole, getDashboardPathByRole as getRoleDashboardPath } from "@/lib/rbac"

export type DemoRole = AppRole

export type DemoAuthSnapshot = {
  isAuthenticated: boolean
  role: DemoRole
  districtId: string
  permissions: string[]
}

export function getDefaultAuthSnapshot(): DemoAuthSnapshot {
  return {
    isAuthenticated: false,
    role: "student",
    districtId: "fl-demo-district",
    permissions: [],
  }
}

export async function fetchDemoAuthSnapshot(): Promise<DemoAuthSnapshot> {
  try {
    const response = await fetch("/api/auth/session", {
      method: "GET",
      headers: { "content-type": "application/json" },
      cache: "no-store",
    })
    if (!response.ok) {
      return getDefaultAuthSnapshot()
    }
    const json = (await response.json()) as DemoAuthSnapshot
    return {
      isAuthenticated: Boolean(json.isAuthenticated),
      role: json.role ?? "student",
      districtId: json.districtId ?? "fl-demo-district",
      permissions: Array.isArray(json.permissions) ? json.permissions : [],
    }
  } catch {
    return getDefaultAuthSnapshot()
  }
}

export function getDashboardPathByRole(role: DemoRole): string {
  return getRoleDashboardPath(role)
}
