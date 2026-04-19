"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ArrowRight, BookOpenCheck, Sparkles } from "lucide-react"

import { useAuth } from "@/context/AuthContext"
import { buildStudentRecommendations, getWeakTopicsFromAttempts } from "@/lib/recommendations"
import type { QuizAttempt } from "@/lib/quiz-engine"
import { syncQuizAttempts } from "@/lib/quiz-storage"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown"
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatDuration(seconds: number) {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}m ${String(sec).padStart(2, "0")}s`
}

export function StudentAssessmentHistoryClient() {
  const { role } = useAuth()
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])

  useEffect(() => {
    void syncQuizAttempts().then((allAttempts) => {
      setAttempts(allAttempts.filter((attempt) => attempt.role === role))
    })
  }, [role])

  const weakTopics = useMemo(() => getWeakTopicsFromAttempts(attempts), [attempts])
  const recommendations = useMemo(
    () => buildStudentRecommendations(attempts),
    [attempts]
  )

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <BookOpenCheck className="size-4 text-teal-600" />
            My Assessments History
          </CardTitle>
          <CardDescription>
            Review your saved quiz attempts, score trajectory, and targeted
            recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attempts.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Quiz</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map((attempt) => (
                  <TableRow key={attempt.attemptId}>
                    <TableCell>{formatDateTime(attempt.completedAt)}</TableCell>
                    <TableCell>{attempt.quizId}</TableCell>
                    <TableCell>{attempt.scorePercent}%</TableCell>
                    <TableCell>{formatDuration(attempt.elapsedSeconds)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={attempt.scorePercent >= 75 ? "secondary" : "outline"}
                      >
                        {attempt.scorePercent >= 75 ? "Strong" : "Needs Review"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="space-y-3 rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
              <p>No assessments completed yet.</p>
              <Button render={<Link href="/practice/quiz" />}>
                Start First Quiz
                <ArrowRight className="ml-1 size-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weak Topics</CardTitle>
            <CardDescription>
              Topic-level error patterns from your saved attempts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {weakTopics.length ? (
              weakTopics.slice(0, 5).map((topic) => (
                <div
                  key={topic.topic}
                  className="flex items-center justify-between rounded-md border border-border/70 p-2 text-sm"
                >
                  <p className="font-medium">{topic.topic}</p>
                  <Badge variant="outline">{topic.missRate}% miss rate</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No major weak-topic signals yet. Keep practicing mixed-topic sets.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Sparkles className="size-4 text-sky-600" />
              Smart Recommendations
            </CardTitle>
            <CardDescription>
              Personalized next steps generated from your recent performance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((recommendation) => (
              <div
                key={recommendation.title}
                className="rounded-md border border-border/70 p-3 text-sm"
              >
                <p className="font-medium">{recommendation.title}</p>
                <p className="mt-1 text-muted-foreground">{recommendation.detail}</p>
                <Badge variant="outline" className="mt-2">
                  Confidence: {recommendation.confidence}
                </Badge>
              </div>
            ))}
            <Button render={<Link href="/practice/quiz" />} className="w-full bg-teal-600 text-white hover:bg-teal-700">
              Continue Practice
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
