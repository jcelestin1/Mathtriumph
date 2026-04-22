"use client"

import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  XCircle,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { BlockMath } from "react-katex"

import "katex/dist/katex.min.css"

import { useAuth } from "@/context/AuthContext"
import {
  AI_COACH_MODELS,
  getCoachModelLabel,
  type AiCoachModel,
} from "@/lib/ai-coach"
import {
  createSessionQuiz,
  evaluateQuestion,
  getExpectedAnswerLabel,
  type AntiCheatFlag,
  type EocPrediction,
  type ErrorAnalysisEntry,
  type QuestionResult,
  type QuestionWorkEntry,
  type QuizAttempt,
  type QuizDefinition,
} from "@/lib/quiz-engine"
import { getDashboardPathByRole } from "@/lib/demo-auth"
import { saveQuizAttempt, syncQuizAttempts } from "@/lib/quiz-storage"
import { DualStreamErrorAnalysis } from "@/components/quiz/dual-stream-error-analysis"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"

type Props = {
  quiz: QuizDefinition
}

type AiStatusResponse = {
  models: Record<AiCoachModel, { connected: boolean; provider: string }>
  anyConnected: boolean
}

export function QuizEngineClient({ quiz }: Props) {
  const router = useRouter()
  const { role, districtId } = useAuth()
  const sessionSeed = useMemo(() => `${Date.now()}`, [])
  const sessionQuiz = useMemo(
    () => createSessionQuiz(quiz, sessionSeed),
    [quiz, sessionSeed]
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [workShown, setWorkShown] = useState<Record<string, string>>({})
  const [reasoningNotes, setReasoningNotes] = useState<Record<string, string>>({})
  const [confidenceByQuestion, setConfidenceByQuestion] = useState<
    Record<string, number>
  >({})
  const [answerChanges, setAnswerChanges] = useState<Record<string, number>>({})
  const [timeSpentByQuestion, setTimeSpentByQuestion] = useState<
    Record<string, number>
  >({})
  const [instantFeedback, setInstantFeedback] = useState(true)
  const [startedAt] = useState(() => new Date().toISOString())
  const [questionStartedAt, setQuestionStartedAt] = useState(() => Date.now())
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(quiz.durationMinutes * 60)
  const [submittedAttempt, setSubmittedAttempt] = useState<QuizAttempt | null>(null)
  const [coachModel, setCoachModel] = useState<AiCoachModel>("gpt-5.1")
  const [coachLoading, setCoachLoading] = useState(false)
  const [coachFeedback, setCoachFeedback] = useState("")
  const [coachError, setCoachError] = useState("")
  const [aiStatus, setAiStatus] = useState<AiStatusResponse | null>(null)
  const [analysisTeacherAction, setAnalysisTeacherAction] = useState("")
  const [recentAttempts, setRecentAttempts] = useState<QuizAttempt[]>([])

  const currentQuestion = sessionQuiz.questions[currentIndex]
  const isCompleted = Boolean(submittedAttempt)
  const progressPercent = ((currentIndex + 1) / sessionQuiz.questions.length) * 100

  useEffect(() => {
    if (isCompleted) return
    if (timeLeftSeconds <= 0) {
      void handleSubmitAttempt()
      return
    }

    const timer = window.setInterval(() => {
      setTimeLeftSeconds((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeftSeconds, isCompleted])

  useEffect(() => {
    void syncQuizAttempts().then((attempts) => {
      setRecentAttempts(attempts)
    })
  }, [])

  const formattedTime = useMemo(() => {
    const min = Math.floor(timeLeftSeconds / 60)
    const sec = timeLeftSeconds % 60
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
  }, [timeLeftSeconds])

  function updateAnswer(value: string) {
    setAnswers((prev) => {
      const previousAnswer = prev[currentQuestion.id] ?? ""
      if (previousAnswer !== value) {
        setAnswerChanges((current) => ({
          ...current,
          [currentQuestion.id]: (current[currentQuestion.id] ?? 0) + 1,
        }))
      }
      return { ...prev, [currentQuestion.id]: value }
    })
  }

  function runCheckForCurrent() {
    const answer = answers[currentQuestion.id] ?? ""
    const isCorrect = evaluateQuestion(currentQuestion, answer)
    setChecked((prev) => ({ ...prev, [currentQuestion.id]: isCorrect }))
    return isCorrect
  }

  function trackQuestionExitTime(questionId: string) {
    const spentSeconds = Math.max(
      0,
      Math.round((Date.now() - questionStartedAt) / 1000)
    )
    setTimeSpentByQuestion((prev) => ({
      ...prev,
      [questionId]: (prev[questionId] ?? 0) + spentSeconds,
    }))
  }

  function moveToQuestion(nextIndex: number) {
    trackQuestionExitTime(currentQuestion.id)
    setCurrentIndex(nextIndex)
    setQuestionStartedAt(Date.now())
  }

  function canProceedCurrent() {
    const answer = (answers[currentQuestion.id] ?? "").trim()
    const steps = (workShown[currentQuestion.id] ?? "").trim()
    const confidence = confidenceByQuestion[currentQuestion.id] ?? 0
    return answer.length > 0 && steps.length >= 12 && confidence > 0
  }

  function onCheckAndContinue() {
    runCheckForCurrent()
    if (currentIndex < sessionQuiz.questions.length - 1) {
      moveToQuestion(currentIndex + 1)
    }
  }

  function buildAntiCheatFlags(
    elapsedSeconds: number,
    scorePercent: number,
    results: QuestionResult[],
    questionWorkPayload: QuestionWorkEntry[]
  ) {
    const flags: AntiCheatFlag[] = []
    const questionCount = Math.max(1, sessionQuiz.questions.length)
    const avgSecondsPerQuestion = elapsedSeconds / questionCount

    if (avgSecondsPerQuestion < 20) {
      flags.push({
        id: "very-fast-completion",
        label: "Very fast completion pattern",
        detail:
          "Average time per question is below 20 seconds, which may indicate insufficient working.",
        severity: "medium",
      })
    }

    const lowWorkCount = questionWorkPayload.filter(
      (entry) => entry.workShown.trim().length < 12
    ).length
    if (lowWorkCount >= Math.ceil(questionCount * 0.4)) {
      flags.push({
        id: "limited-work-shown",
        label: "Limited work shown",
        detail:
          "A large portion of responses included minimal step-by-step work.",
        severity: "high",
      })
    }

    const overconfidenceWrong = results.filter((result) => {
      const confidence = result.confidenceLevel ?? 0
      return !result.isCorrect && confidence >= 4
    }).length
    if (overconfidenceWrong >= 2) {
      flags.push({
        id: "overconfidence-mismatch",
        label: "High confidence / low accuracy mismatch",
        detail:
          "Several incorrect responses were submitted with high confidence ratings.",
        severity: "low",
      })
    }

    if (scorePercent === 100 && elapsedSeconds < Math.round(quiz.durationMinutes * 60 * 0.25)) {
      flags.push({
        id: "perfect-very-fast",
        label: "Perfect score in unusually short time",
        detail:
          "Perfect score was achieved far faster than expected quiz duration.",
        severity: "high",
      })
    }

    return flags
  }

  function calculateTextSimilarity(a: string, b: string) {
    const norm = (value: string) =>
      value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter(Boolean)
    const aTokens = new Set(norm(a))
    const bTokens = new Set(norm(b))
    if (!aTokens.size || !bTokens.size) return 0

    let intersection = 0
    aTokens.forEach((token) => {
      if (bTokens.has(token)) intersection += 1
    })
    const union = new Set([...aTokens, ...bTokens]).size
    return union ? intersection / union : 0
  }

  function buildSimilarityFlag(questionWorkPayload: QuestionWorkEntry[]) {
    const previousAttempts = recentAttempts
      .filter((attempt) => attempt.quizId === sessionQuiz.id)
      .slice(0, 6)

    if (!previousAttempts.length) return null

    const currentAnswerString = sessionQuiz.questions
      .map((question) => answers[question.id] ?? "")
      .join(" | ")
    const currentWorkString = questionWorkPayload
      .map((entry) => entry.workShown)
      .join(" | ")

    let highestSimilarity = 0

    previousAttempts.forEach((attempt) => {
      const previousAnswerString = sessionQuiz.questions
        .map((question) => attempt.answers[question.id] ?? "")
        .join(" | ")
      const previousWorkString = (attempt.questionWork ?? [])
        .map((entry) => entry.workShown)
        .join(" | ")

      const answerSimilarity = calculateTextSimilarity(
        currentAnswerString,
        previousAnswerString
      )
      const workSimilarity = calculateTextSimilarity(currentWorkString, previousWorkString)
      const combined = (answerSimilarity * 0.6 + workSimilarity * 0.4) * 100
      if (combined > highestSimilarity) highestSimilarity = combined
    })

    if (highestSimilarity < 88) return null

    return {
      id: "high-answer-similarity",
      label: "High similarity to prior attempt",
      detail: `Answer/work pattern similarity is ${Math.round(
        highestSimilarity
      )}%, which may indicate copied response flow.`,
      severity: highestSimilarity >= 94 ? "high" : "medium",
    } satisfies AntiCheatFlag
  }

  async function handleSubmitAttempt() {
    trackQuestionExitTime(currentQuestion.id)
    const completedAt = new Date().toISOString()
    const elapsedSeconds = Math.max(
      0,
      sessionQuiz.durationMinutes * 60 - timeLeftSeconds
    )

    const results = sessionQuiz.questions.map((question) => {
      const userAnswer = answers[question.id] ?? ""
      const isCorrect = evaluateQuestion(question, userAnswer)
      return {
        questionId: question.id,
        topic: question.topic,
        course: question.course,
        bestBenchmark: question.bestBenchmark,
        reportingCategory: question.reportingCategory,
        isCorrect,
        userAnswer,
        expectedAnswer: getExpectedAnswerLabel(question),
        confidenceLevel: confidenceByQuestion[question.id] ?? 0,
      }
    })

    const questionWorkPayload = sessionQuiz.questions.map((question) => ({
      questionId: question.id,
      workShown: workShown[question.id] ?? "",
      reasoningNote: reasoningNotes[question.id] ?? "",
      confidenceLevel: confidenceByQuestion[question.id] ?? 0,
      answerChanges: answerChanges[question.id] ?? 0,
      timeSpentSeconds: timeSpentByQuestion[question.id] ?? 0,
    }))

    const correctCount = results.filter((item) => item.isCorrect).length
    const scorePercent = Math.round((correctCount / sessionQuiz.questions.length) * 100)
    const antiCheatFlags = buildAntiCheatFlags(
      elapsedSeconds,
      scorePercent,
      results,
      questionWorkPayload
    )
    const similarityFlag = buildSimilarityFlag(questionWorkPayload)
    if (similarityFlag) {
      antiCheatFlags.push(similarityFlag)
    }
    let errorAnalyses: ErrorAnalysisEntry[] = []
    let eocPrediction: EocPrediction | undefined
    let inferredTeacherAction = ""
    try {
      const pipelineResponse = await fetch("/api/ai/analysis-pipeline", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          purpose: "eoc_preparation",
          districtId,
          quiz: sessionQuiz,
          results,
          questionWork: questionWorkPayload,
          scorePercent,
        }),
      })
      if (pipelineResponse.ok) {
        const pipelineJson = (await pipelineResponse.json()) as {
          analyses?: ErrorAnalysisEntry[]
          prediction?: EocPrediction
          suggestedTeacherAction?: string
        }
        errorAnalyses = pipelineJson.analyses ?? []
        eocPrediction = pipelineJson.prediction
        inferredTeacherAction = pipelineJson.suggestedTeacherAction ?? ""
      }
    } catch {
      // Fall back to no AI analysis if secure pipeline is unavailable.
    }
    const oralVerificationPrompts = results
      .filter((result) => !result.isCorrect)
      .slice(0, 3)
      .map((result) => {
        const question = sessionQuiz.questions.find((item) => item.id === result.questionId)
        return `Explain your reasoning for ${result.topic}: "${question?.prompt ?? "question"}".`
      })

    const attempt: QuizAttempt = {
      attemptId: `${sessionQuiz.id}-${Date.now()}`,
      quizId: sessionQuiz.id,
      role,
      startedAt,
      completedAt,
      elapsedSeconds,
      scorePercent,
      answers,
      results,
      questionWork: questionWorkPayload,
      antiCheatFlags,
      oralVerificationPrompts,
      integrityReview: { status: "pending" },
      errorAnalyses,
      eocPrediction,
    }

    await saveQuizAttempt(attempt)
    const latestAttempts = await syncQuizAttempts()
    setRecentAttempts(latestAttempts)
    setSubmittedAttempt(attempt)
    setAnalysisTeacherAction(inferredTeacherAction)
  }

  function onRestartQuiz() {
    setCurrentIndex(0)
    setAnswers({})
    setChecked({})
    setWorkShown({})
    setReasoningNotes({})
    setConfidenceByQuestion({})
    setAnswerChanges({})
    setTimeSpentByQuestion({})
    setSubmittedAttempt(null)
    setCoachFeedback("")
    setCoachError("")
    setCoachLoading(false)
    setAiStatus(null)
    setAnalysisTeacherAction("")
    setTimeLeftSeconds(sessionQuiz.durationMinutes * 60)
    setQuestionStartedAt(Date.now())
  }

  useEffect(() => {
    if (!submittedAttempt) return
    fetch("/api/ai/coach")
      .then((response) => response.json())
      .then((json: AiStatusResponse) => {
        setAiStatus(json)
      })
      .catch(() => {
        setAiStatus({
          anyConnected: false,
          models: {
            "gpt-5.1": { connected: false, provider: "openai" },
            "claude-4": { connected: false, provider: "anthropic" },
          },
        })
      })
  }, [submittedAttempt])

  async function onGenerateAiCoachFeedback() {
    if (!submittedAttempt) return
    setCoachLoading(true)
    setCoachError("")

    try {
      const weakTopicCounts = new Map<string, number>()
      submittedAttempt.results.forEach((result) => {
        if (!result.isCorrect) {
          weakTopicCounts.set(result.topic, (weakTopicCounts.get(result.topic) ?? 0) + 1)
        }
      })
      const weakTopics = Array.from(weakTopicCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([topic]) => topic)
        .slice(0, 3)

      const response = await fetch("/api/ai/coach", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          purpose: "eoc_preparation",
          districtId,
          model: coachModel,
          scorePercent: submittedAttempt.scorePercent,
          elapsedSeconds: submittedAttempt.elapsedSeconds,
          weakTopics,
          results: submittedAttempt.results,
        }),
      })
      const json = (await response.json()) as { feedback?: string; message?: string }

      if (!response.ok || !json.feedback) {
        setCoachError(json.message ?? "Unable to generate AI feedback right now.")
        return
      }
      setCoachFeedback(json.feedback)
    } catch {
      setCoachError("AI coach request failed. Check your API key configuration and retry.")
    } finally {
      setCoachLoading(false)
    }
  }

  const checkedValue = checked[currentQuestion.id]
  const showFeedback =
    instantFeedback &&
    typeof checkedValue === "boolean" &&
    (answers[currentQuestion.id] ?? "").trim().length > 0

  return (
    <section className="mx-auto w-full max-w-4xl space-y-4">
      <Card className="border-teal-200/70">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle>{quiz.title}</CardTitle>
              <CardDescription>{quiz.subtitle}</CardDescription>
            </div>
            <Badge variant="secondary">
              <Clock3 className="mr-1 size-3.5" />
              {formattedTime}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {quiz.topics.map((topic) => (
              <Badge key={topic} variant="outline">
                {topic}
              </Badge>
            ))}
          </div>
          <Progress value={progressPercent}>
            <ProgressLabel>
              Question {currentIndex + 1} of {sessionQuiz.questions.length}
              {/* Session order is randomized per attempt for anti-cheat resilience. */}
            </ProgressLabel>
            <ProgressValue>
              {(_, value) => `${Math.round(value ?? progressPercent)}%`}
            </ProgressValue>
          </Progress>
        </CardHeader>
      </Card>

      {isCompleted && submittedAttempt ? (
        <Card className="border-emerald-300/70 bg-emerald-50/40 dark:bg-emerald-500/10">
          <CardHeader>
            <CardTitle>Attempt Complete</CardTitle>
            <CardDescription>
              Score: {submittedAttempt.scorePercent}% • Saved to your local progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {submittedAttempt.eocPrediction ? (
              <div className="rounded-lg border border-teal-300/60 bg-teal-50/50 p-3 text-sm dark:bg-teal-500/10">
                <p className="font-medium text-teal-800 dark:text-teal-300">
                  EOC Score Predictor
                </p>
                <p className="text-muted-foreground">
                  Projected scale score:{" "}
                  <strong>{submittedAttempt.eocPrediction.projectedScaleScore}</strong> (Level{" "}
                  {submittedAttempt.eocPrediction.achievementLevel})
                </p>
                <p className="text-xs text-muted-foreground">
                  {submittedAttempt.eocPrediction.rationale}
                </p>
              </div>
            ) : null}
            <DualStreamErrorAnalysis analyses={submittedAttempt.errorAnalyses ?? []} />
            {analysisTeacherAction ? (
              <p className="rounded-md border border-border/70 bg-muted/40 p-2 text-xs text-muted-foreground">
                Teacher intervention recommendation: {analysisTeacherAction}
              </p>
            ) : null}
            {submittedAttempt.antiCheatFlags.length ? (
              <div className="rounded-lg border border-amber-300/70 bg-amber-50/50 p-3 text-sm dark:bg-amber-500/10">
                <p className="mb-2 inline-flex items-center gap-1 font-medium text-amber-800 dark:text-amber-300">
                  <ShieldAlert className="size-4" />
                  Integrity flags detected
                </p>
                <div className="space-y-1 text-muted-foreground">
                  {submittedAttempt.antiCheatFlags.map((flag) => (
                    <p key={flag.id}>
                      • {flag.label} ({flag.severity}) - {flag.detail}
                    </p>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="grid gap-2 sm:grid-cols-2">
              {submittedAttempt.results.map((result) => (
                <div
                  key={result.questionId}
                  className="rounded-lg border border-border/70 bg-background/80 p-3 text-sm"
                >
                  <p className="font-medium">{result.topic}</p>
                  <p className="text-muted-foreground">
                    Your answer: {result.userAnswer || "No answer"}
                  </p>
                  <p className="text-muted-foreground">
                    Expected: {result.expectedAnswer}
                  </p>
                  <p
                    className={`mt-1 inline-flex items-center gap-1 ${
                      result.isCorrect ? "text-emerald-600" : "text-rose-500"
                    }`}
                  >
                    {result.isCorrect ? (
                      <>
                        <CheckCircle2 className="size-4" />
                        Correct
                      </>
                    ) : (
                      <>
                        <XCircle className="size-4" />
                        Needs Review
                      </>
                    )}
                  </p>
                </div>
              ))}
            </div>
            {submittedAttempt.oralVerificationPrompts.length ? (
              <div className="rounded-lg border border-sky-300/60 bg-sky-50/40 p-3 text-sm dark:bg-sky-500/10">
                <p className="mb-1 inline-flex items-center gap-1 font-medium text-sky-800 dark:text-sky-300">
                  <AlertTriangle className="size-4" />
                  Oral verification prompts
                </p>
                <ul className="ml-4 list-disc text-muted-foreground">
                  {submittedAttempt.oralVerificationPrompts.map((prompt) => (
                    <li key={prompt}>{prompt}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="rounded-lg border border-sky-300/60 bg-sky-50/40 p-3 text-sm dark:bg-sky-500/10">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-sky-800 dark:text-sky-300">
                  AI Coach (Claude 4 / GPT-5.1)
                </p>
                <div className="flex items-center gap-2">
                  {submittedAttempt ? (
                    <Badge
                      variant="outline"
                      className={
                        aiStatus === null
                          ? "border-muted text-muted-foreground"
                          : aiStatus?.models?.[coachModel]?.connected
                            ? "border-emerald-300 text-emerald-700 dark:border-emerald-500/40 dark:text-emerald-300"
                            : "border-rose-300 text-rose-700 dark:border-rose-500/40 dark:text-rose-300"
                      }
                    >
                      {aiStatus === null
                        ? "Checking..."
                        : aiStatus?.models?.[coachModel]?.connected
                          ? "Connected"
                          : "Missing key"}
                    </Badge>
                  ) : null}
                  <select
                    className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                    value={coachModel}
                    onChange={(event) => setCoachModel(event.target.value as AiCoachModel)}
                    disabled={coachLoading}
                  >
                    {AI_COACH_MODELS.map((model) => (
                      <option key={model} value={model}>
                        {getCoachModelLabel(model)}
                      </option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onGenerateAiCoachFeedback}
                    disabled={coachLoading}
                  >
                    {coachLoading ? (
                      <>
                        <Loader2 className="mr-1 size-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Coaching Plan"
                    )}
                  </Button>
                </div>
              </div>
              {aiStatus !== null && !aiStatus?.models?.[coachModel]?.connected ? (
                <p className="mb-2 text-xs text-muted-foreground">
                  Add the required API key in <code>.env.local</code> for{" "}
                  {getCoachModelLabel(coachModel)}.
                </p>
              ) : null}
              {coachError ? <p className="text-rose-600 dark:text-rose-400">{coachError}</p> : null}
              {coachFeedback ? (
                <div className="whitespace-pre-wrap rounded-md border border-border/70 bg-background/80 p-3 text-sm text-foreground">
                  {coachFeedback}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Generate personalized next-step guidance for students, parents, and teachers.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => router.push(getDashboardPathByRole(role))}>
                Back to Dashboard
              </Button>
              <Button variant="outline" onClick={onRestartQuiz}>
                <RotateCcw className="mr-1 size-4" />
                Retake Quiz
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Badge variant="secondary">{currentQuestion.topic}</Badge>
              <Button
                type="button"
                variant={instantFeedback ? "default" : "outline"}
                onClick={() => setInstantFeedback((prev) => !prev)}
                className="h-7"
              >
                <Sparkles className="mr-1 size-3.5" />
                Instant Feedback: {instantFeedback ? "On" : "Off"}
              </Button>
            </div>
            <CardTitle className="text-xl">{currentQuestion.prompt}</CardTitle>
            {currentQuestion.formula ? (
              <div className="rounded-md border border-dashed border-border bg-muted/40 p-3">
                <BlockMath>{currentQuestion.formula}</BlockMath>
              </div>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion.type === "multiple_choice" ? (
              <div className="grid gap-2">
                {currentQuestion.options.map((option) => {
                  const active = (answers[currentQuestion.id] ?? "") === option
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => updateAnswer(option)}
                      className={`rounded-md border p-2 text-left text-sm transition ${
                        active
                          ? "border-teal-500 bg-teal-50 text-teal-800 dark:bg-teal-500/10 dark:text-teal-200"
                          : "border-border bg-background hover:bg-muted/40"
                      }`}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
            ) : (
              <Input
                value={answers[currentQuestion.id] ?? ""}
                onChange={(event) => updateAnswer(event.target.value)}
                placeholder="Type your final answer..."
              />
            )}
            <textarea
              value={workShown[currentQuestion.id] ?? ""}
              onChange={(event) =>
                setWorkShown((prev) => ({
                  ...prev,
                  [currentQuestion.id]: event.target.value,
                }))
              }
              rows={3}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="Show your steps (required): write how you solved this question."
            />
            <Input
              value={reasoningNotes[currentQuestion.id] ?? ""}
              onChange={(event) =>
                setReasoningNotes((prev) => ({
                  ...prev,
                  [currentQuestion.id]: event.target.value,
                }))
              }
              placeholder="Reasoning check (optional): Why is your answer correct?"
            />
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Confidence:</span>
              <select
                className="rounded-md border border-border bg-background px-2 py-1"
                value={confidenceByQuestion[currentQuestion.id] ?? ""}
                onChange={(event) =>
                  setConfidenceByQuestion((prev) => ({
                    ...prev,
                    [currentQuestion.id]: Number(event.target.value),
                  }))
                }
              >
                <option value="">Select</option>
                <option value="1">1 - Guessing</option>
                <option value="2">2 - Low</option>
                <option value="3">3 - Medium</option>
                <option value="4">4 - High</option>
                <option value="5">5 - Very High</option>
              </select>
            </div>

            {showFeedback ? (
              <div
                className={`rounded-md border p-3 text-sm ${
                  checkedValue
                    ? "border-emerald-300/70 bg-emerald-100/40 dark:bg-emerald-500/10"
                    : "border-rose-300/70 bg-rose-100/40 dark:bg-rose-500/10"
                }`}
              >
                <p className="mb-1 inline-flex items-center gap-1 font-medium">
                  {checkedValue ? (
                    <>
                      <CheckCircle2 className="size-4" />
                      Correct
                    </>
                  ) : (
                    <>
                      <XCircle className="size-4" />
                      Not yet
                    </>
                  )}
                </p>
                <p className="text-muted-foreground">
                  <strong>Concept:</strong> {currentQuestion.explanation.concept}
                </p>
                <ol className="ml-4 mt-2 list-decimal space-y-1 text-muted-foreground">
                  {currentQuestion.explanation.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <p className="mt-2 text-muted-foreground">
                  <strong>Common mistake:</strong>{" "}
                  {currentQuestion.explanation.commonMistake}
                </p>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button
                variant="outline"
                onClick={() => moveToQuestion(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
              >
                Previous
              </Button>
              <div className="flex flex-wrap gap-2">
                {instantFeedback ? (
                  <Button
                    onClick={onCheckAndContinue}
                    disabled={!canProceedCurrent()}
                  >
                    {currentIndex === sessionQuiz.questions.length - 1
                      ? "Check Answer"
                      : "Check & Next"}
                  </Button>
                ) : (
                  <Button
                    onClick={() =>
                      moveToQuestion(
                        Math.min(sessionQuiz.questions.length - 1, currentIndex + 1)
                      )
                    }
                    disabled={
                      currentIndex === sessionQuiz.questions.length - 1 ||
                      !canProceedCurrent()
                    }
                  >
                    Next
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={handleSubmitAttempt}
                  disabled={Object.keys(answers).length === 0 || !canProceedCurrent()}
                >
                  Submit Attempt
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  )
}
