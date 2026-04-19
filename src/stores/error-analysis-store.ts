"use client"

import { create } from "zustand"

import type { EocPrediction, ErrorAnalysisEntry, QuizAttempt } from "@/lib/quiz-engine"

type ErrorAnalysisStore = {
  analysesByAttemptId: Record<string, ErrorAnalysisEntry[]>
  predictionByAttemptId: Record<string, EocPrediction | undefined>
  hydrateFromAttempts: (attempts: QuizAttempt[]) => void
  setAttemptAnalysis: (
    attemptId: string,
    analyses: ErrorAnalysisEntry[],
    prediction?: EocPrediction
  ) => void
}

export const useErrorAnalysisStore = create<ErrorAnalysisStore>((set) => ({
  analysesByAttemptId: {},
  predictionByAttemptId: {},
  hydrateFromAttempts: (attempts) => {
    const analysesByAttemptId: Record<string, ErrorAnalysisEntry[]> = {}
    const predictionByAttemptId: Record<string, EocPrediction | undefined> = {}

    attempts.forEach((attempt) => {
      analysesByAttemptId[attempt.attemptId] = attempt.errorAnalyses ?? []
      predictionByAttemptId[attempt.attemptId] = attempt.eocPrediction
    })

    set({
      analysesByAttemptId,
      predictionByAttemptId,
    })
  },
  setAttemptAnalysis: (attemptId, analyses, prediction) =>
    set((state) => ({
      analysesByAttemptId: {
        ...state.analysesByAttemptId,
        [attemptId]: analyses,
      },
      predictionByAttemptId: {
        ...state.predictionByAttemptId,
        [attemptId]: prediction,
      },
    })),
}))
