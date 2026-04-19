import type { Metadata } from "next"

import { DashboardRoleGreeting } from "@/components/dashboard/dashboard-role-greeting"
import { RoleCommandCenter } from "@/components/dashboard/role-command-center"

export const metadata: Metadata = {
  title: "Support Admin",
  description:
    "Read-only support workspace for assisted troubleshooting with audit-safe visibility controls.",
}

export default function SupportDashboardPage() {
  return (
    <section className="space-y-4">
      <DashboardRoleGreeting variant="support" />
      <RoleCommandCenter
        role="support_admin"
        title="MathTriumph Support Admin Dashboard"
        description="Temporary assisted support context with FERPA-aligned read-only operational access."
      />
    </section>
  )
}
