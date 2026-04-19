"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { Download, ShieldCheck } from "lucide-react"

import { ChartWrapper } from "@/components/charts"
import { Card, CardContent } from "@/components/ui/card"
import { ProgressRing } from "@/components/ui/progress-ring"
import { Skeleton } from "@/components/ui/skeleton"
import {
  masteryDistributionData,
  topicMasteryData,
  weeklyActivityData,
} from "@/data/charts"

const TopicMasteryChart = dynamic(
  () => import("@/components/charts/topic-mastery-chart").then((m) => m.TopicMasteryChart),
  { ssr: false }
)
const MasteryPieChart = dynamic(
  () => import("@/components/charts/mastery-pie-chart").then((m) => m.MasteryPieChart),
  { ssr: false }
)
const WeeklyActivityChart = dynamic(
  () =>
    import("@/components/charts/weekly-activity-chart").then(
      (m) => m.WeeklyActivityChart
    ),
  { ssr: false }
)

function ChartLoadingSkeleton() {
  return <Skeleton className="h-[320px] w-full rounded-xl" />
}

export function ManagerDashboardCharts() {
  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="premium-surface">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-xs text-muted-foreground">Cohort readiness</p>
              <p className="text-2xl font-semibold">74%</p>
            </div>
            <ProgressRing value={74} size={70} stroke={8} />
          </CardContent>
        </Card>
        <Card className="premium-surface">
          <CardContent className="p-4">
            <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-teal-500" />
              Trust and integrity
            </p>
            <p className="text-sm font-medium">
              Flag review workflow active with school audit trail support.
            </p>
          </CardContent>
        </Card>
        <Card className="premium-surface">
          <CardContent className="p-4">
            <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Download className="size-3.5 text-sky-500" />
              Report readiness
            </p>
            <p className="text-2xl font-semibold">3 exports</p>
            <p className="text-xs text-muted-foreground">CSV, PDF, benchmark</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
      <ChartWrapper
        title="Class Topic Mastery"
        description="Stacked view of mastered vs needs-work percentages by topic."
      >
        <Suspense fallback={<ChartLoadingSkeleton />}>
          <TopicMasteryChart
            data={topicMasteryData.map((item) => ({
              topic: item.topic,
              mastered: item.masteredPercentage,
              needsWork: item.needsWorkPercentage,
            }))}
          />
        </Suspense>
      </ChartWrapper>

      <ChartWrapper
        title="Overall Mastery Distribution"
        description="Class-wide distribution of mastered, proficient, and developing learners."
      >
        <Suspense fallback={<ChartLoadingSkeleton />}>
          <MasteryPieChart data={masteryDistributionData} />
        </Suspense>
      </ChartWrapper>

      <ChartWrapper
        title="Weekly Class Activity"
        description="Practice time trend over the last seven days."
        className="xl:col-span-2"
      >
        <Suspense fallback={<ChartLoadingSkeleton />}>
          <WeeklyActivityChart
            data={weeklyActivityData.map((item) => ({
              day: item.dayOfWeek,
              minutes: item.practiceMinutes,
            }))}
          />
        </Suspense>
      </ChartWrapper>
      </div>
    </section>
  )
}
