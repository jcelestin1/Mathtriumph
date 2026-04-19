import type { Metadata } from "next"
import { UserRoundCheck } from "lucide-react"

import { DashboardRoleGreeting } from "@/components/dashboard/dashboard-role-greeting"
import { GamificationBar } from "@/components/dashboard/gamification-bar"
import { ProgressCelebration } from "@/components/dashboard/progress-celebration"
import { QuickWinCards } from "@/components/dashboard/quick-win-cards"
import { StudentErrorInsights } from "@/components/dashboard/student-error-insights"
import { StudentPracticeInsights } from "@/components/dashboard/student-practice-insights"
import { StudentDashboardCharts } from "@/components/dashboard/student-dashboard-charts"

export const metadata: Metadata = {
  title: "Student Dashboard",
  description:
    "Personal MathTriumph student dashboard with mastery progress, recommendations, achievements, and score trends.",
}

export default function StudentDashboardPage() {
  return (
    <section className="space-y-4">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <UserRoundCheck className="size-4 text-teal-600" />
          Student Workspace
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Daily Triumph Dashboard
        </h2>
        <DashboardRoleGreeting variant="student" />
      </div>
      <GamificationBar
        streakDays={7}
        xpThisWeek={1240}
        badgesEarned={12}
        achievementLabel="Algebra Ace"
      />
      <ProgressCelebration
        title="You are making real progress!"
        percent={87}
        message="You are 87% to your next mastery tier. One more focused session can push you above 90%."
      />
      <QuickWinCards role="student" />
      <StudentErrorInsights />
      <StudentPracticeInsights />
      <StudentDashboardCharts />
    </section>
  )
}
