"use client"

import { Brain, TrendingUp } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { useAuth } from "@/context/AuthContext"
import type { QuizAttempt } from "@/lib/quiz-engine"
import { syncQuizAttempts } from "@/lib/quiz-storage"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function StudentErrorInsights() {
  const { role } = useAuth()
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])

  useEffect(() => {
    void syncQuizAttempts().then((allAttempts) => {
      setAttempts(allAttempts.filter((attempt) => attempt.role === role).slice(0, 6))
    })
  }, [role])

  const latestAttempt = attempts[0]
  const latestAnalyses = latestAttempt?.errorAnalyses ?? []
  const prediction = latestAttempt?.eocPrediction
  const misconceptionPattern = useMemo(() => {
    const entries = attempts.flatMap((attempt) => attempt.errorAnalyses ?? [])
    const counts = new Map<string, number>()
    entries.forEach((entry) => {
      counts.set(entry.misconceptionTag, (counts.get(entry.misconceptionTag) ?? 0) + 1)
    })
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
  }, [attempts])

  return (
    <Card className="premium-surface">
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2">
          <Brain className="size-4 text-teal-600" />
          Recent Error Insights
        </CardTitle>
        <CardDescription>
          Turn each mistake into a benchmark-aligned gain plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {latestAttempt ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Latest score {latestAttempt.scorePercent}%</Badge>
              {prediction ? (
                <Badge variant="outline">
                  Projected EOC scale: {prediction.projectedScaleScore} (L
                  {prediction.achievementLevel})
                </Badge>
              ) : null}
            </div>
            {latestAnalyses.length ? (
              latestAnalyses.slice(0, 3).map((item) => (
                <div
                  key={`${latestAttempt.attemptId}-${item.questionId}`}
                  className="rounded-md border border-border/70 p-2 text-sm"
                >
                  <p className="font-medium">
                    {item.topic} - {item.errorType}
                  </p>
                  <p className="text-muted-foreground">{item.quickHint}</p>
                  <p className="inline-flex items-center gap-1 text-xs text-teal-700 dark:text-teal-300">
                    <TrendingUp className="size-3.5" />
                    Next: {item.nextPractice}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
                No active misconceptions detected in your latest attempt. Keep pushing your mastery.
              </p>
            )}
            {misconceptionPattern.length ? (
              <div className="rounded-md border border-border/70 bg-muted/30 p-2 text-xs">
                <p className="mb-1 font-medium">Recurring misconception pattern</p>
                <div className="flex flex-wrap gap-1.5">
                  {misconceptionPattern.map(([tag, count]) => (
                    <Badge key={tag} variant="outline">
                      {tag} ({count})
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
            Complete a quiz to unlock your benchmark-linked error insights.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
