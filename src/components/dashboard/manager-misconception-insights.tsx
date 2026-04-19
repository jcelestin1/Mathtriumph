"use client"

import { BookOpenCheck, Sparkles, Target } from "lucide-react"
import { useMemo, useState } from "react"

import { getErrorPatternSummary } from "@/lib/error-pattern-logging"
import { addInterventionQueueItem } from "@/lib/intervention-queue"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ManagerMisconceptionInsights() {
  const [message, setMessage] = useState("")
  const patterns = useMemo(() => getErrorPatternSummary(8), [])

  return (
    <Card className="premium-surface">
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2">
          <Target className="size-4 text-teal-600" />
          Class Misconception Heatmap
        </CardTitle>
        <CardDescription>
          Frequent misconceptions by reporting category with intervention-ready actions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {patterns.length ? (
          patterns.map((pattern) => (
            <div
              key={`${pattern.reportingCategory}-${pattern.misconceptionTag}-${pattern.errorType}`}
              className="rounded-md border border-border/70 p-2 text-sm"
            >
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{pattern.reportingCategory}</Badge>
                <Badge variant="outline">{pattern.misconceptionTag}</Badge>
                <Badge variant="outline">{pattern.errorType}</Badge>
                <Badge>{pattern.count} students flagged</Badge>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  One-click assignment can target this misconception set.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    addInterventionQueueItem({
                      misconceptionTag: pattern.misconceptionTag,
                      reportingCategory: pattern.reportingCategory,
                      errorType: pattern.errorType,
                    })
                    setMessage(
                      `Intervention assigned (mock): ${pattern.misconceptionTag} - ${pattern.reportingCategory}`
                    )
                  }}
                >
                  <BookOpenCheck className="mr-1 size-4" />
                  Assign Intervention
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
            No misconception logs yet. Ask students to complete practice for class-level trends.
          </p>
        )}
        {message ? (
          <p className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-muted/40 p-2 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-teal-600" />
            {message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
