import type { Metadata } from "next"

import { DelegationManager } from "@/components/dashboard/delegation-manager"
import { DashboardRoleGreeting } from "@/components/dashboard/dashboard-role-greeting"
import { RoleCommandCenter } from "@/components/dashboard/role-command-center"

export const metadata: Metadata = {
  title: "School Operations",
  description:
    "School-level management for rostering, teacher usage, and campus readiness reporting.",
}

export default function SchoolDashboardPage() {
  return (
    <section className="space-y-4">
      <DashboardRoleGreeting variant="school" />
      <RoleCommandCenter
        role="school_admin"
        title="School Operations Dashboard"
        description="Rostering quality, teacher activity, and school-wide benchmark performance."
      />
      <DelegationManager />
    </section>
  )
}
