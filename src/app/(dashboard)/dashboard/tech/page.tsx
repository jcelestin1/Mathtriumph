import type { Metadata } from "next"

import { DashboardRoleGreeting } from "@/components/dashboard/dashboard-role-greeting"
import { RoleCommandCenter } from "@/components/dashboard/role-command-center"

export const metadata: Metadata = {
  title: "Tech and Security",
  description:
    "Tech/IT command center for SSO reliability, integration health, and FERPA-conscious controls.",
}

export default function TechDashboardPage() {
  return (
    <section className="space-y-4">
      <DashboardRoleGreeting variant="tech" />
      <RoleCommandCenter
        role="tech_admin"
        title="Tech / IT Admin Dashboard"
        description="SSO connectivity, security posture, audit readiness, and system reliability."
      />
    </section>
  )
}
