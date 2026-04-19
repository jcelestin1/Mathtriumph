import type { Metadata } from "next"

import { DashboardRoleGreeting } from "@/components/dashboard/dashboard-role-greeting"
import { RoleCommandCenter } from "@/components/dashboard/role-command-center"

export const metadata: Metadata = {
  title: "Instructional Coaching",
  description:
    "Instructional coach workspace for shared skill plans, teacher feedback, and professional development insights.",
}

export default function CoachDashboardPage() {
  return (
    <section className="space-y-4">
      <DashboardRoleGreeting variant="coach" />
      <RoleCommandCenter
        role="instructional_coach"
        title="Instructional Coach Dashboard"
        description="Scale effective math instruction with shared plans and evidence-based coaching loops."
      />
    </section>
  )
}
