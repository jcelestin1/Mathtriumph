import type { Metadata } from "next"

import { DelegationManager } from "@/components/dashboard/delegation-manager"
import { DashboardRoleGreeting } from "@/components/dashboard/dashboard-role-greeting"
import { DistrictPolicyEditor } from "@/components/dashboard/district-policy-editor"
import { RoleCommandCenter } from "@/components/dashboard/role-command-center"

export const metadata: Metadata = {
  title: "District Command",
  description:
    "District-wide oversight for EOC readiness, cross-school performance, delegation, and compliance.",
}

export default function DistrictDashboardPage() {
  return (
    <section className="space-y-4">
      <DashboardRoleGreeting variant="district" />
      <RoleCommandCenter
        role="district_admin"
        title="District Command Center"
        description="Cross-school mastery outcomes, intervention governance, and global settings."
      />
      <DistrictPolicyEditor />
      <DelegationManager />
    </section>
  )
}
