"use client"

import { AlertTriangle, BookCheck, Lightbulb, SplitSquareVertical, Target } from "lucide-react"

import type { ErrorAnalysisEntry } from "@/lib/quiz-engine"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function DualStreamErrorAnalysis({
  analyses,
}: {
  analyses: ErrorAnalysisEntry[]
}) {
  if (!analyses.length) {
    return (
      <Card className="border-emerald-300/70 bg-emerald-50/30 dark:bg-emerald-500/10">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-base">
            <BookCheck className="size-4 text-emerald-600" />
            Dual-Stream Error Analysis
          </CardTitle>
          <CardDescription>
            Excellent work. No misconception flags on this attempt.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border-sky-300/60 bg-sky-50/30 dark:bg-sky-500/10">
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2 text-base">
          <SplitSquareVertical className="size-4 text-sky-700 dark:text-sky-300" />
          Dual-Stream Error Analysis
        </CardTitle>
        <CardDescription>
          Stream 1 captures neutral student reasoning. Stream 2 diagnoses benchmark-linked misconceptions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {analyses.map((analysis) => (
          <div
            key={analysis.questionId}
            className="rounded-lg border border-border/70 bg-background/80 p-3"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{analysis.topic}</Badge>
              <Badge variant="outline">{analysis.stream2Diagnostic.errorType}</Badge>
              <Badge variant="outline">{analysis.stream2Diagnostic.misconceptionTag}</Badge>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="rounded-md border border-border/70 bg-muted/40 p-2 text-xs">
                <p className="mb-1 inline-flex items-center gap-1 font-medium">
                  <Target className="size-3.5 text-teal-600" />
                  Stream 1 - Draft Analyzer (Neutral)
                </p>
                <p>
                  <strong>Submitted:</strong> {analysis.stream1Draft.submittedAnswer}
                </p>
                <ul className="ml-4 mt-1 list-disc text-muted-foreground">
                  {analysis.stream1Draft.neutralSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md border border-border/70 bg-muted/40 p-2 text-xs">
                <p className="mb-1 inline-flex items-center gap-1 font-medium">
                  <AlertTriangle className="size-3.5 text-sky-600" />
                  Stream 2 - Diagnostic Analyzer
                </p>
                <p>
                  <strong>Divergence:</strong> {analysis.stream2Diagnostic.divergencePoint}
                </p>
                <p className="text-muted-foreground">
                  <strong>Benchmark:</strong> {analysis.stream2Diagnostic.benchmark} (
                  {analysis.stream2Diagnostic.reportingCategory})
                </p>
              </div>
            </div>

            <p className="mt-2 text-sm">
              <strong>Error Diagnosis:</strong> {analysis.divergencePoint} Root cause:{" "}
              {analysis.rootCause}
            </p>
            <p className="mt-1 text-sm">
              <strong>Why This Matters for Florida EOC:</strong> {analysis.whyThisMatters}
            </p>
            <div className="mt-2 rounded-md border border-border/70 bg-muted/40 p-2 text-sm">
              <p className="inline-flex items-center gap-1 font-medium">
                <Lightbulb className="size-4 text-amber-500" />
                Targeted Feedback & Remediation
              </p>
              <p className="mt-1 text-muted-foreground">Quick hint: {analysis.quickHint}</p>
              <ul className="ml-4 mt-1 list-disc text-muted-foreground">
                {analysis.guidedFix.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-1 text-muted-foreground">
                Similar EOC-style example: {analysis.conceptualExample}
              </p>
            </div>
            <p className="mt-2 inline-flex items-center gap-1 text-sm text-teal-700 dark:text-teal-300">
              <Target className="size-4" />
              <strong>Next Recommended Practice:</strong> {analysis.nextPractice}
            </p>
            <div className="mt-2 rounded-md border border-dashed border-border/70 p-2 text-xs text-muted-foreground">
              <p className="font-medium">Socratic prompts</p>
              <ul className="ml-4 mt-1 list-disc">
                {analysis.stream2Diagnostic.socraticPrompts.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
