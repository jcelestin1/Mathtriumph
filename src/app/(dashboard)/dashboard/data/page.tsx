import type { Metadata } from "next"

import { DashboardRoleGreeting } from "@/components/dashboard/dashboard-role-greeting"
import { RoleCommandCenter } from "@/components/dashboard/role-command-center"

export const metadata: Metadata = {
  title: "Data and Assessment Intelligence",
  description:
    "Assessment coordinator workspace for benchmarking, EOC predictor analytics, and district exports.",
}

export default function DataDashboardPage() {
  return (
    <section className="space-y-4">
      <DashboardRoleGreeting variant="data" />
      <RoleCommandCenter
        role="data_analyst"
        title="Data Analyst / Assessment Coordinator Dashboard"
        description="Analyze benchmark fidelity, prediction confidence, and export-ready district intelligence."
      />
    </section>
  )
}
