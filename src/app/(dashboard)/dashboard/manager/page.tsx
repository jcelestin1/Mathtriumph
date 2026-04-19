import type { Metadata } from "next"
import Link from "next/link"
import { Code2, ShieldCheck } from "lucide-react"

import { DashboardRoleGreeting } from "@/components/dashboard/dashboard-role-greeting"
import { ManagerIntegrityAlerts } from "@/components/dashboard/manager-integrity-alerts"
import { ManagerDashboardCharts } from "@/components/dashboard/manager-dashboard-charts"
import { ManagerInterventionQueue } from "@/components/dashboard/manager-intervention-queue"
import { ManagerPrivacyFerpaStatus } from "@/components/dashboard/manager-privacy-ferpa-status"
import { ManagerTrialRunUpload } from "@/components/dashboard/manager-trial-run-upload"
import { ManagerMisconceptionInsights } from "@/components/dashboard/manager-misconception-insights"
import { ProgressCelebration } from "@/components/dashboard/progress-celebration"
import { QuickWinCards } from "@/components/dashboard/quick-win-cards"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Manager Dashboard",
  description:
    "Enhanced teacher and school admin dashboard for interventions, analytics, reporting, and learning-gain trial runs.",
}

export default function ManagerDashboardPage() {
  return (
    <section className="space-y-4">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="size-4 text-teal-600" />
          Manager / Teacher Workspace
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Enhanced Manager Dashboard
          </h2>
          <Button
            render={
              <Link
                href="https://github.com/Jahmar3440/Jahmar3440"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            variant="outline"
            className="border-teal-200 text-teal-700 hover:bg-teal-50 dark:border-teal-500/40 dark:text-teal-200 dark:hover:bg-teal-500/10"
          >
            <Code2 className="mr-1 size-4" />
            Continue with GitHub
          </Button>
        </div>
        <DashboardRoleGreeting variant="manager" />
      </div>
      <ProgressCelebration
        title="District-ready momentum"
        percent={74}
        message="74% of learners are projected on-track this cycle. Focus interventions can move this toward 80%+."
      />
      <QuickWinCards role="manager" />
      <ManagerTrialRunUpload />
      <ManagerMisconceptionInsights />
      <ManagerPrivacyFerpaStatus />
      <ManagerInterventionQueue />
      <ManagerIntegrityAlerts />
      <ManagerDashboardCharts />
    </section>
  )
}
