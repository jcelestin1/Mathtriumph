"use client"

import dynamic from "next/dynamic"

import { ChartWrapper } from "@/components/charts"

const ScoreTrendChart = dynamic(
  () => import("@/components/charts").then((module) => module.ScoreTrendChart),
  { ssr: false }
)
const TopicMasteryChart = dynamic(
  () => import("@/components/charts").then((module) => module.TopicMasteryChart),
  { ssr: false }
)
const MasteryPieChart = dynamic(
  () => import("@/components/charts").then((module) => module.MasteryPieChart),
  { ssr: false }
)
const WeeklyActivityChart = dynamic(
  () => import("@/components/charts").then((module) => module.WeeklyActivityChart),
  { ssr: false }
)
const SkillRadarChart = dynamic(
  () => import("@/components/charts").then((module) => module.SkillRadarChart),
  { ssr: false }
)
const ProgressComposedChart = dynamic(
  () =>
    import("@/components/charts").then((module) => module.ProgressComposedChart),
  { ssr: false }
)

export function ChartsDemoClient() {
  return (
    <section className="space-y-5">
      <div className="rounded-lg border border-border/70 bg-muted/40 p-3 text-sm">
        <p className="mb-2 font-medium">Developer usage example</p>
        <pre className="overflow-x-auto text-xs leading-relaxed text-muted-foreground">
{`import { ScoreTrendChart, ChartWrapper } from "@/components/charts"

<ChartWrapper title="Student Scores" description="Actual vs predicted performance">
  <ScoreTrendChart />
</ChartWrapper>`}
        </pre>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartWrapper
          title="Student: Skill Radar"
          description="Current mastery compared against 90% goal."
        >
          <SkillRadarChart />
        </ChartWrapper>

        <ChartWrapper
          title="Student: Progress Composed"
          description="Weekly progress bars with goal and cumulative trend."
        >
          <ProgressComposedChart />
        </ChartWrapper>

        <ChartWrapper
          title="Manager: Topic Mastery"
          description="Stacked topic performance across mastery vs needs work."
        >
          <TopicMasteryChart />
        </ChartWrapper>

        <ChartWrapper
          title="Manager: Weekly Activity"
          description="Practice activity trend across the week."
        >
          <WeeklyActivityChart />
        </ChartWrapper>

        <ChartWrapper
          title="Parent: Score Trend"
          description="Actual and predicted score trajectory."
        >
          <ScoreTrendChart />
        </ChartWrapper>

        <ChartWrapper
          title="Parent: Mastery Distribution"
          description="Donut view of mastery levels."
        >
          <MasteryPieChart />
        </ChartWrapper>
      </div>
    </section>
  )
}
