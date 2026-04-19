"use client"

import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpenCheck,
  Cpu,
  Database,
  GraduationCap,
  School,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react"

import {
  APP_PERMISSIONS,
  APP_ROLES,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  type AppRole,
} from "@/lib/rbac"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const roleKpiCopy: Record<
  AppRole,
  Array<{ label: string; value: string; icon: React.ComponentType<{ className?: string }> }>
> = {
  district_admin: [
    { label: "Schools On Track", value: "31 / 34", icon: School },
    { label: "District EOC Readiness", value: "78%", icon: BarChart3 },
    { label: "Delegated Elevations", value: "9 active", icon: Users },
  ],
  school_admin: [
    { label: "Teachers Active Today", value: "42", icon: GraduationCap },
    { label: "Roster Sync Freshness", value: "99.2%", icon: Activity },
    { label: "School Growth Velocity", value: "+14%", icon: Target },
  ],
  tech_admin: [
    { label: "SSO Health", value: "Operational", icon: ShieldCheck },
    { label: "Clever Sync Jobs", value: "12/12 healthy", icon: Cpu },
    { label: "Security Incidents", value: "0 critical", icon: AlertTriangle },
  ],
  interventionist: [
    { label: "At-Risk Students", value: "83", icon: AlertTriangle },
    { label: "Active RTI Groups", value: "18", icon: Users },
    { label: "Intervention Completion", value: "74%", icon: BookOpenCheck },
  ],
  instructional_coach: [
    { label: "Shared Skill Plans", value: "27", icon: BookOpenCheck },
    { label: "Teachers Coached", value: "34", icon: Users },
    { label: "Plan Adoption", value: "82%", icon: Target },
  ],
  data_analyst: [
    { label: "Custom Exports (30d)", value: "126", icon: Database },
    { label: "Predictor Confidence", value: "High", icon: BarChart3 },
    { label: "Benchmark Signals", value: "6 watch areas", icon: Activity },
  ],
  teacher: [
    { label: "Class Completion", value: "79%", icon: GraduationCap },
    { label: "Students Needing Reteach", value: "14", icon: AlertTriangle },
    { label: "Assignment Response", value: "91%", icon: BookOpenCheck },
  ],
  student: [
    { label: "Weekly Mastery Gain", value: "+6.2%", icon: Target },
    { label: "Current Streak", value: "8 days", icon: Activity },
    { label: "EOC Projection", value: "Level 4", icon: BarChart3 },
  ],
  parent: [
    { label: "Children On Track", value: "2 / 2", icon: Users },
    { label: "Shareable Reports", value: "4 this month", icon: BookOpenCheck },
    { label: "Projected Growth", value: "+11%", icon: Target },
  ],
  support_admin: [
    { label: "Assisted Sessions", value: "7 today", icon: Users },
    { label: "Read-Only Scope", value: "Enforced", icon: ShieldCheck },
    { label: "Escalations", value: "2 open", icon: AlertTriangle },
  ],
}

const riskHeatMap = [
  ["high", "high", "medium", "low", "low"],
  ["high", "medium", "medium", "low", "low"],
  ["medium", "medium", "medium", "low", "low"],
  ["medium", "medium", "low", "low", "low"],
]

const heatClass: Record<string, string> = {
  high: "bg-rose-500/80",
  medium: "bg-amber-400/80",
  low: "bg-emerald-500/70",
}

export function RoleCommandCenter({
  role,
  title,
  description,
}: {
  role: AppRole
  title: string
  description: string
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {roleKpiCopy[role].map((kpi) => (
          <Card key={`${role}-${kpi.label}`}>
            <CardHeader className="pb-2">
              <CardDescription>{kpi.label}</CardDescription>
              <CardTitle className="text-xl">{kpi.value}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <kpi.icon className="size-4 text-teal-600" />
            </CardContent>
          </Card>
        ))}
      </div>

      {role === "interventionist" ? (
        <Card>
          <CardHeader>
            <CardTitle>At-Risk Students Heat Map</CardTitle>
            <CardDescription>
              Immediate prioritization by reporting category and readiness level.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {riskHeatMap.map((row, rowIdx) => (
              <div key={`row-${rowIdx}`} className="grid grid-cols-5 gap-1.5">
                {row.map((cell, cellIdx) => (
                  <div
                    key={`${rowIdx}-${cellIdx}`}
                    className={`h-9 rounded ${heatClass[cell]}`}
                    title={`Risk: ${cell}`}
                  />
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {(role === "district_admin" || role === "school_admin" || role === "data_analyst") ? (
        <Card>
          <CardHeader>
            <CardTitle>Permission Matrix Snapshot</CardTitle>
            <CardDescription>
              RBAC visibility across all MathTriumph operational roles.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 text-left">
                  <th className="px-2 py-2 font-medium">Role</th>
                  <th className="px-2 py-2 font-medium">Permission Count</th>
                  <th className="px-2 py-2 font-medium">High-Value Scope</th>
                </tr>
              </thead>
              <tbody>
                {APP_ROLES.map((itemRole) => (
                  <tr key={itemRole} className="border-b border-border/50">
                    <td className="px-2 py-2">{ROLE_LABELS[itemRole]}</td>
                    <td className="px-2 py-2">{ROLE_PERMISSIONS[itemRole].length}</td>
                    <td className="px-2 py-2">
                      {APP_PERMISSIONS.filter((permission) =>
                        ROLE_PERMISSIONS[itemRole].includes(permission)
                      )
                        .slice(0, 3)
                        .join(", ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}
    </section>
  )
}
