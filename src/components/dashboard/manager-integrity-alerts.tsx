"use client"

import { ShieldAlert } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import {
  getAllQuizAttempts,
  syncQuizAttempts,
  updateAttemptIntegrityReview,
} from "@/lib/quiz-storage"
import { escapeCsvCell } from "@/lib/security/csv"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { QuizAttempt } from "@/lib/quiz-engine"

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown"
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function ManagerIntegrityAlerts() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>(() => getAllQuizAttempts())
  const [filter, setFilter] = useState<"all" | "high" | "escalated">("all")
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({})

  function reload() {
    void syncQuizAttempts().then((latest) => {
      setAttempts(latest)
    })
  }

  useEffect(() => {
    reload()
  }, [])

  const flaggedAttempts = useMemo(
    () =>
      attempts
        .filter((attempt) => (attempt.antiCheatFlags?.length ?? 0) > 0)
        .slice(0, 30),
    [attempts]
  )

  const highSeverityCount = flaggedAttempts.filter((attempt) =>
    (attempt.antiCheatFlags ?? []).some((flag) => flag.severity === "high")
  ).length

  const escalatedCount = flaggedAttempts.filter(
    (attempt) => attempt.integrityReview?.status === "escalated"
  ).length

  const visibleAttempts = useMemo(() => {
    if (filter === "high") {
      return flaggedAttempts.filter((attempt) =>
        (attempt.antiCheatFlags ?? []).some((flag) => flag.severity === "high")
      )
    }
    if (filter === "escalated") {
      return flaggedAttempts.filter(
        (attempt) => attempt.integrityReview?.status === "escalated"
      )
    }
    return flaggedAttempts
  }, [filter, flaggedAttempts])

  function onSetReviewStatus(
    attemptId: string,
    status: "acknowledged" | "escalated"
  ) {
    void updateAttemptIntegrityReview(attemptId, { status }).then(() => {
      reload()
    })
  }

  function onSaveReviewNotes(attemptId: string) {
    const notes = noteDrafts[attemptId] ?? ""
    void updateAttemptIntegrityReview(attemptId, { notes }).then(() => {
      reload()
    })
  }

  function convertRowsToCsv(
    rows: {
      attemptId: string
      quizId: string
      role: string
      submittedAt: string
      scorePercent: number
      reviewStatus: string
      reviewedAt: string
      reviewNotes: string
      flags: string
    }[]
  ) {
    if (!rows.length) return
    const headers = Object.keys(rows[0])
    const csvLines = [
      headers.map((header) => escapeCsvCell(header)).join(","),
      ...rows.map((row) =>
        headers
          .map((header) => escapeCsvCell(row[header as keyof typeof row]))
          .join(",")
      ),
    ]
    const blob = new Blob([csvLines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    return { link, url }
  }

  function onExportCsv(mode: "all" | "high" | "escalated") {
    const baseRows = attempts
      .filter((attempt) => (attempt.antiCheatFlags?.length ?? 0) > 0)
      .filter((attempt) => {
        if (mode === "high") {
          return (attempt.antiCheatFlags ?? []).some((flag) => flag.severity === "high")
        }
        if (mode === "escalated") {
          return attempt.integrityReview?.status === "escalated"
        }
        return true
      })
      .map((attempt) => ({
        attemptId: attempt.attemptId,
        quizId: attempt.quizId,
        role: attempt.role,
        submittedAt: attempt.completedAt,
        scorePercent: attempt.scorePercent,
        reviewStatus: attempt.integrityReview?.status ?? "pending",
        reviewedAt: attempt.integrityReview?.reviewedAt ?? "",
        reviewNotes: attempt.integrityReview?.notes ?? "",
        flags: (attempt.antiCheatFlags ?? []).map((flag) => flag.label).join(" | "),
      }))

    const exportable = convertRowsToCsv(baseRows)
    if (!exportable) return

    exportable.link.download = `integrity-alerts-${mode}-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`
    exportable.link.click()
    URL.revokeObjectURL(exportable.url)
  }

  return (
    <Card className="border-amber-200/70">
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2">
          <ShieldAlert className="size-4 text-amber-600" />
          Integrity Alerts
        </CardTitle>
        <CardDescription>
          Anti-cheat flags from recent quiz submissions for teacher review.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{flaggedAttempts.length} flagged attempts</Badge>
            <Badge variant="outline">{highSeverityCount} high-severity</Badge>
            <Badge variant="outline">{escalatedCount} escalated</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "high" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("high")}
            >
              High Severity
            </Button>
            <Button
              variant={filter === "escalated" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("escalated")}
            >
              Escalated
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => onExportCsv("all")} disabled={!flaggedAttempts.length}>
            Export All CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExportCsv("high")} disabled={!highSeverityCount}>
            Export High Severity
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExportCsv("escalated")} disabled={!escalatedCount}>
            Export Escalated
          </Button>
        </div>
        {visibleAttempts.length ? (
          <div className="space-y-2">
            {visibleAttempts.map((attempt) => (
              <div
                key={attempt.attemptId}
                className="rounded-md border border-border/70 p-2 text-sm"
              >
                <p className="font-medium">
                  {attempt.quizId} • {attempt.scorePercent}%
                </p>
                <p className="text-xs text-muted-foreground">
                  Submitted {formatDate(attempt.completedAt)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {(attempt.antiCheatFlags ?? []).map((flag) => flag.label).join(" | ")}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">
                    Review: {attempt.integrityReview?.status ?? "pending"}
                  </Badge>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => onSetReviewStatus(attempt.attemptId, "acknowledged")}
                  >
                    Acknowledge
                  </Button>
                  <Button
                    size="xs"
                    variant="destructive"
                    onClick={() => onSetReviewStatus(attempt.attemptId, "escalated")}
                  >
                    Escalate
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Input
                    value={noteDrafts[attempt.attemptId] ?? attempt.integrityReview?.notes ?? ""}
                    onChange={(event) =>
                      setNoteDrafts((prev) => ({
                        ...prev,
                        [attempt.attemptId]: event.target.value,
                      }))
                    }
                    placeholder="Review notes (e.g., oral check requested, guardian notified)"
                    className="max-w-lg"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSaveReviewNotes(attempt.attemptId)}
                  >
                    Save Notes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
            No integrity alerts yet. Flags will appear after students submit quizzes.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
