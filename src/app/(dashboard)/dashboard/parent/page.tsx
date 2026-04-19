import type { Metadata } from "next"
import { HeartHandshake } from "lucide-react"

import { DashboardRoleGreeting } from "@/components/dashboard/dashboard-role-greeting"
import { ParentDashboardCharts } from "@/components/dashboard/parent-dashboard-charts"
import { ProgressCelebration } from "@/components/dashboard/progress-celebration"
import { QuickWinCards } from "@/components/dashboard/quick-win-cards"

export const metadata: Metadata = {
  title: "Parent Dashboard",
  description:
    "Parent view for MathTriumph showing child progress, assessment trends, recommendations, and actionable insights.",
}

export default function ParentDashboardPage() {
  return (
    <section className="space-y-4">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <HeartHandshake className="size-4 text-teal-600" />
          Parent Workspace
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Parent Progress Dashboard
        </h2>
        <DashboardRoleGreeting variant="parent" />
      </div>
      <ProgressCelebration
        title="Great progress this week!"
        percent={83}
        message="Your child is trending upward. Keep consistency and teacher communication for strong end-of-term outcomes."
      />
      <QuickWinCards role="parent" />
      <ParentDashboardCharts />
    </section>
  )
}
