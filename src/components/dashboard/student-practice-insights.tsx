"use client"

import Link from "next/link"
import { AlertTriangle, ArrowRight, BookOpenCheck } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { useAuth } from "@/context/AuthContext"
import { buildStudentRecommendations, getWeakTopicsFromAttempts } from "@/lib/recommendations"
import type { QuizAttempt } from "@/lib/quiz-engine"
import { syncQuizAttempts } from "@/lib/quiz-storage"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function formatAttemptDate(dateValue: string) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return "Unknown date"
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function StudentPracticeInsights() {
  const { role } = useAuth()
  const [allAttempts, setAllAttempts] = useState<QuizAttempt[]>([])

  useEffect(() => {
    void syncQuizAttempts().then((attempts) => setAllAttempts(attempts))
  }, [role])

  const recentAttempts = useMemo(() => {
    return allAttempts
      .filter((attempt) => attempt.role === role)
      .slice(0, 5)
  }, [allAttempts, role])

  const weakTopics = useMemo(() => {
    return getWeakTopicsFromAttempts(recentAttempts).slice(0, 3)
  }, [recentAttempts])

  const recommendations = useMemo(
    () => buildStudentRecommendations(recentAttempts).slice(0, 2),
    [recentAttempts]
  )

  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <Card className="premium-surface">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <BookOpenCheck className="size-4 text-teal-600" />
            My Recent Attempts
          </CardTitle>
          <CardDescription>
            Last quiz submissions saved locally for your progress tracking.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentAttempts.length ? (
            recentAttempts.map((attempt) => (
              <div
                key={attempt.attemptId}
                className="flex items-center justify-between rounded-md border border-border/70 p-2 text-sm"
              >
                <div>
                  <p className="font-medium">{attempt.quizId}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatAttemptDate(attempt.completedAt)}
                  </p>
                </div>
                <Badge variant="secondary">{attempt.scorePercent}%</Badge>
              </div>
            ))
          ) : (
            <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
              No saved attempts yet. Start your first timed quiz to generate
              your trend and recommendations.
            </p>
          )}
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            Keep going - consistency beats cramming.
          </p>
          <Button
            render={<Link href="/practice/quiz" />}
            className="w-full bg-teal-600 text-white hover:bg-teal-700"
          >
            Open Quiz Library
            <ArrowRight className="ml-1 size-4" />
          </Button>
          <Button render={<Link href="/dashboard/student/assessments" />} variant="outline" className="w-full">
            View Full History
          </Button>
        </CardContent>
      </Card>

      <Card className="premium-surface">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-500" />
            Weak Topic Recommendations
          </CardTitle>
          <CardDescription>
            Topics with high miss rates in your recent attempts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {weakTopics.length ? (
            weakTopics.map((item) => (
              <div
                key={item.topic}
                className="flex items-center justify-between rounded-md border border-border/70 p-2 text-sm"
              >
                <p className="font-medium">{item.topic}</p>
                <Badge variant="outline">{item.missRate}% miss rate</Badge>
              </div>
            ))
          ) : (
            <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
              Great consistency. Keep taking mixed-topic quizzes to uncover the
              next improvement opportunity.
            </p>
          )}
          <Button render={<Link href="/practice/quiz/algebra-geometry-foundations" />} variant="outline" className="w-full">
            Start Recommended Quiz
          </Button>
          <div className="space-y-1 pt-1">
            {recommendations.map((recommendation) => (
              <p key={recommendation.title} className="text-xs text-muted-foreground">
                • {recommendation.title}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
