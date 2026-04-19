import type { Metadata } from "next"

import { DashboardRoleGreeting } from "@/components/dashboard/dashboard-role-greeting"
import { RoleCommandCenter } from "@/components/dashboard/role-command-center"

export const metadata: Metadata = {
  title: "Intervention Hub",
  description:
    "RTI specialist workspace for at-risk student heat maps, intervention groups, and remediation tracking.",
}

export default function InterventionDashboardPage() {
  return (
    <section className="space-y-4">
      <DashboardRoleGreeting variant="intervention" />
      <RoleCommandCenter
        role="interventionist"
        title="Interventionist / RTI Specialist Dashboard"
        description="Prioritize at-risk learners, launch focused groups, and monitor remediation fidelity."
      />
    </section>
  )
}
