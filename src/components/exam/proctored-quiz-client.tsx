"use client"

import { useEffect, useState } from "react"

import { ExamMonitorShell } from "@/components/exam/exam-monitor-shell"
import { QuizEngineClient } from "@/components/quiz/quiz-engine-client"
import type { QuizDefinition } from "@/lib/quiz-engine"

type Props = {
  quiz: QuizDefinition
  enableCameraSnapshots?: boolean
}

export function ProctoredQuizClient({ quiz, enableCameraSnapshots = false }: Props) {
  // Stable attempt id for the lifetime of this proctored window. The quiz
  // engine itself stamps a final attempt id on submit; this is purely for
  // grouping monitoring events. Computed in an effect so we don't call
  // impure functions (`Date.now`, `Math.random`) during render.
  const [attemptId, setAttemptId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.resolve().then(() => {
      if (cancelled) return
      setAttemptId(
        `${quiz.id}-monitor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      )
    })
    return () => {
      cancelled = true
    }
  }, [quiz.id])

  if (!attemptId) {
    return <QuizEngineClient quiz={quiz} />
  }

  return (
    <ExamMonitorShell
      attemptId={attemptId}
      quizId={quiz.id}
      quizTitle={quiz.title}
      enableCameraSnapshots={enableCameraSnapshots}
    >
      <QuizEngineClient quiz={quiz} />
    </ExamMonitorShell>
  )
}
