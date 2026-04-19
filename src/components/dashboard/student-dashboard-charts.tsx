"use client"

import dynamic from "next/dynamic"
import { Suspense, useEffect, useMemo, useState } from "react"
import { Flame, Sparkles } from "lucide-react"

import { useAuth } from "@/context/AuthContext"
import { ChartWrapper } from "@/components/charts"
import { Card, CardContent } from "@/components/ui/card"
import { ProgressRing } from "@/components/ui/progress-ring"
import { Skeleton } from "@/components/ui/skeleton"
import { progressComposedData, scoreTrendData, skillRadarData } from "@/data/charts"
import type { QuizAttempt } from "@/lib/quiz-engine"
import { syncQuizAttempts } from "@/lib/quiz-storage"

const SkillRadarChart = dynamic(
  () => import("@/components/charts/skill-radar-chart").then((m) => m.SkillRadarChart),
  { ssr: false }
)
const ScoreTrendChart = dynamic(
  () => import("@/components/charts/score-trend-chart").then((m) => m.ScoreTrendChart),
  { ssr: false }
)
const ProgressComposedChart = dynamic(
  () =>
    import("@/components/charts/progress-composed-chart").then(
      (m) => m.ProgressComposedChart
    ),
  { ssr: false }
)

function ChartLoadingSkeleton() {
  return <Skeleton className="h-[320px] w-full rounded-xl" />
}

export function StudentDashboardCharts() {
  const { role } = useAuth()
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])

  useEffect(() => {
    void syncQuizAttempts().then((allAttempts) => {
      setAttempts(allAttempts.filter((attempt) => attempt.role === role))
    })
  }, [role])

  const derived = useMemo(() => {
    const recentAttempts = attempts.slice(0, 8).reverse()

    if (!recentAttempts.length) {
      return {
        scoreData: scoreTrendData.map((item) => ({
          week: item.date,
          actual: item.actualScore,
          predicted: item.predictedScore,
        })),
        progressData: progressComposedData.map((item) => ({
          week: item.week,
          actual: item.actualScore,
          goal: item.goalScore,
          cumulative: item.cumulativeProgress,
        })),
        radarData: skillRadarData.map((item) => ({
          topic: item.topic,
          current: item.currentMastery,
        })),
      }
    }

    const scoreData = recentAttempts.map((attempt, index) => {
      const previous = index > 0 ? recentAttempts[index - 1].scorePercent : attempt.scorePercent
      const predicted = Math.min(100, Math.round(previous + (attempt.scorePercent - previous) * 1.2))
      return {
        week: `A${index + 1}`,
        actual: attempt.scorePercent,
        predicted,
      }
    })

    const cumulativeBase: number[] = []
    recentAttempts.forEach((attempt, index) => {
      const prev = index === 0 ? attempt.scorePercent : cumulativeBase[index - 1]
      const cumulative = Math.round((prev + attempt.scorePercent) / 2)
      cumulativeBase.push(cumulative)
    })

    const progressData = recentAttempts.map((attempt, index) => ({
      week: `A${index + 1}`,
      actual: attempt.scorePercent,
      goal: Math.min(100, Math.round(attempt.scorePercent + 6)),
      cumulative: cumulativeBase[index],
    }))

    const topicMap = new Map<string, { total: number; correct: number }>()
    recentAttempts.forEach((attempt) => {
      attempt.results.forEach((result) => {
        const current = topicMap.get(result.topic) ?? { total: 0, correct: 0 }
        current.total += 1
        if (result.isCorrect) {
          current.correct += 1
        }
        topicMap.set(result.topic, current)
      })
    })

    const radarData = Array.from(topicMap.entries()).map(([topic, stats]) => ({
      topic,
      current: Math.round((stats.correct / stats.total) * 100),
    }))

    return {
      scoreData,
      progressData,
      radarData: radarData.length
        ? radarData
        : skillRadarData.map((item) => ({
            topic: item.topic,
            current: item.currentMastery,
          })),
    }
  }, [attempts])

  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="premium-surface">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="size-3.5 text-teal-500" />
                Predicted next score
              </p>
              <p className="text-2xl font-semibold">
                {Math.max(
                  derived.scoreData[derived.scoreData.length - 1]?.predicted ?? 84,
                  derived.scoreData[derived.scoreData.length - 1]?.actual ?? 82
                )}
                %
              </p>
            </div>
            <ProgressRing value={88} size={72} stroke={8} label="target" />
          </CardContent>
        </Card>
        <Card className="premium-surface">
          <CardContent className="p-4">
            <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Flame className="size-3.5 text-orange-500" />
              Momentum streak
            </p>
            <p className="text-2xl font-semibold">7 days</p>
            <p className="text-xs text-muted-foreground">
              Keep this streak for bonus mastery XP.
            </p>
          </CardContent>
        </Card>
        <Card className="premium-surface">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Quick encouragement</p>
            <p className="text-sm font-medium">
              You&apos;re closer than you think. One focused practice set can push you into the next tier.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
      <ChartWrapper
        title="My Skill Radar"
        description="Current mastery across core math domains compared to your 90% target."
      >
        <Suspense fallback={<ChartLoadingSkeleton />}>
          <SkillRadarChart data={derived.radarData} targetScore={90} />
        </Suspense>
      </ChartWrapper>

      <ChartWrapper
        title="Score Trend"
        description="Actual assessment performance vs model-predicted trajectory over time."
      >
        <Suspense fallback={<ChartLoadingSkeleton />}>
          <ScoreTrendChart data={derived.scoreData} />
        </Suspense>
      </ChartWrapper>

      <ChartWrapper
        title="Weekly Progress vs Goal"
        description="Track actual score gains against your weekly target and cumulative growth."
        className="xl:col-span-2"
      >
        <Suspense fallback={<ChartLoadingSkeleton />}>
          <ProgressComposedChart data={derived.progressData} />
        </Suspense>
      </ChartWrapper>
      </div>
    </section>
  )
}
