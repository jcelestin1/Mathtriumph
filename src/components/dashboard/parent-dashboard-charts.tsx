"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { HeartHandshake, ShieldCheck } from "lucide-react"

import { ChartWrapper } from "@/components/charts"
import { Card, CardContent } from "@/components/ui/card"
import { ProgressRing } from "@/components/ui/progress-ring"
import { Skeleton } from "@/components/ui/skeleton"
import {
  masteryDistributionData,
  scoreTrendData,
  skillRadarData,
} from "@/data/charts"

const ScoreTrendChart = dynamic(
  () => import("@/components/charts/score-trend-chart").then((m) => m.ScoreTrendChart),
  { ssr: false }
)
const MasteryPieChart = dynamic(
  () => import("@/components/charts/mastery-pie-chart").then((m) => m.MasteryPieChart),
  { ssr: false }
)
const SkillRadarChart = dynamic(
  () => import("@/components/charts/skill-radar-chart").then((m) => m.SkillRadarChart),
  { ssr: false }
)

function ChartLoadingSkeleton() {
  return <Skeleton className="h-[320px] w-full rounded-xl" />
}

export function ParentDashboardCharts() {
  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="premium-surface">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-xs text-muted-foreground">Predicted exam readiness</p>
              <p className="text-2xl font-semibold">83%</p>
            </div>
            <ProgressRing value={83} size={70} stroke={8} />
          </CardContent>
        </Card>
        <Card className="premium-surface">
          <CardContent className="p-4">
            <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <HeartHandshake className="size-3.5 text-teal-500" />
              Parent coaching signal
            </p>
            <p className="text-sm font-medium">
              Focus on 2 weak topics this week to unlock a stronger growth curve.
            </p>
          </CardContent>
        </Card>
        <Card className="premium-surface">
          <CardContent className="p-4">
            <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-sky-500" />
              School-trusted reporting
            </p>
            <p className="text-sm font-medium">
              Clear trend history and predicted scores, easy to share with teachers.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
      <ChartWrapper
        title="Family Progress Trend"
        description="Assessment growth trajectory for your child over recent weeks."
      >
        <Suspense fallback={<ChartLoadingSkeleton />}>
          <ScoreTrendChart
            data={scoreTrendData.map((item) => ({
              week: item.date,
              actual: item.actualScore,
              predicted: item.predictedScore,
            }))}
          />
        </Suspense>
      </ChartWrapper>

      <ChartWrapper
        title="Family Mastery Overview"
        description="Current distribution of mastered, proficient, and developing performance."
      >
        <Suspense fallback={<ChartLoadingSkeleton />}>
          <MasteryPieChart data={masteryDistributionData} />
        </Suspense>
      </ChartWrapper>

      <ChartWrapper
        title="Selected Child Skill Radar"
        description="Skill-by-skill view of current mastery vs 90% readiness target."
        className="xl:col-span-2"
      >
        <Suspense fallback={<ChartLoadingSkeleton />}>
          <SkillRadarChart
            data={skillRadarData.map((item) => ({
              topic: item.topic,
              current: item.currentMastery,
            }))}
            targetScore={90}
          />
        </Suspense>
      </ChartWrapper>
      </div>
    </section>
  )
}
