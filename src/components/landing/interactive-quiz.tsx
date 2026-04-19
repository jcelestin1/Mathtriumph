"use client"

import confetti from "canvas-confetti"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle2, RotateCcw, Sparkles, Trophy, XCircle } from "lucide-react"
import { useMemo, useState } from "react"
import { BlockMath } from "react-katex"

import "katex/dist/katex.min.css"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress"
import { quizQuestions } from "@/lib/mathtriumph-content"

type AnswerState = Record<string, string>
type ValidationState = Record<string, boolean>

const SCORE_MESSAGES = [
  { minScore: 90, message: "Elite momentum. You are in full Triumph mode." },
  { minScore: 70, message: "Strong foundation. A few targeted drills and you will surge." },
  { minScore: 0, message: "Great start. Keep practicing and your Triumph score will climb fast." },
]

export function InteractiveQuiz() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState("")
  const [answers, setAnswers] = useState<AnswerState>({})
  const [validated, setValidated] = useState<ValidationState>({})
  const [checkingAnswer, setCheckingAnswer] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)
  const [retryMode, setRetryMode] = useState(false)

  const currentQuestion = quizQuestions[currentIndex]
  const answeredCount = Object.keys(validated).length
  const progressPercent = (answeredCount / quizQuestions.length) * 100

  const wrongQuestionIds = useMemo(
    () =>
      quizQuestions
        .filter((question) => validated[question.id] === false)
        .map((question) => question.id),
    [validated]
  )

  const score = useMemo(() => {
    const correctCount = Object.values(validated).filter(Boolean).length
    return Math.round((correctCount / quizQuestions.length) * 100)
  }, [validated])

  const scoreMessage =
    SCORE_MESSAGES.find((entry) => score >= entry.minScore)?.message ??
    SCORE_MESSAGES[SCORE_MESSAGES.length - 1].message

  const onCheckAnswer = async () => {
    if (!selectedAnswer || !currentQuestion) return
    setCheckingAnswer(true)

    await new Promise((resolve) => setTimeout(resolve, 550))

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer
    const nextAnswers = { ...answers, [currentQuestion.id]: selectedAnswer }
    const nextValidated = { ...validated, [currentQuestion.id]: isCorrect }

    setAnswers(nextAnswers)
    setValidated(nextValidated)
    setCheckingAnswer(false)

    if (currentIndex < quizQuestions.length - 1) {
      const nextIndex = currentIndex + 1
      setCurrentIndex(nextIndex)
      const nextQuestion = quizQuestions[nextIndex]
      setSelectedAnswer(nextAnswers[nextQuestion.id] ?? "")
      return
    }

    setQuizComplete(true)
    void confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.65 },
      colors: ["#0F766E", "#F59E0B", "#22D3EE"],
    })
  }

  const onRetryWrongOnes = () => {
    if (!wrongQuestionIds.length) return

    const wrongSet = new Set(wrongQuestionIds)
    const nextAnswers: AnswerState = {}

    quizQuestions.forEach((question) => {
      if (!wrongSet.has(question.id) && answers[question.id]) {
        nextAnswers[question.id] = answers[question.id]
      }
    })

    setAnswers(nextAnswers)
    setValidated((current) => {
      const updated: ValidationState = {}
      quizQuestions.forEach((question) => {
        if (!wrongSet.has(question.id) && typeof current[question.id] === "boolean") {
          updated[question.id] = current[question.id]
        }
      })
      return updated
    })
    const firstWrongQuestionIndex = quizQuestions.findIndex((question) =>
      wrongSet.has(question.id)
    )
    setCurrentIndex(firstWrongQuestionIndex)
    setSelectedAnswer("")
    setQuizComplete(false)
    setRetryMode(true)
  }

  const onResetQuiz = () => {
    setAnswers({})
    setValidated({})
    setCurrentIndex(0)
    setSelectedAnswer("")
    setQuizComplete(false)
    setRetryMode(false)
  }

  return (
    <Card className="border-teal-400/40 bg-background/95 shadow-lg">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-xl md:text-2xl">
            Interactive Triumph Assessment Demo
          </CardTitle>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">
            <Sparkles className="size-3.5" />
            {retryMode ? "Retry Mode" : "Live Demo"}
          </span>
        </div>
        <Progress value={progressPercent}>
          <ProgressLabel>Progress</ProgressLabel>
          <ProgressValue>
            {(_, value) => `${Math.round(value ?? progressPercent)}%`}
          </ProgressValue>
        </Progress>
      </CardHeader>

      <CardContent className="space-y-6">
        <AnimatePresence mode="wait">
          {!quizComplete ? (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="rounded-full bg-teal-100 px-2.5 py-1 text-teal-800 dark:bg-teal-500/20 dark:text-teal-200">
                  {currentQuestion.topic}
                </span>
                <span>
                  Question {currentIndex + 1} of {quizQuestions.length}
                </span>
              </div>

              <h3 className="text-lg font-semibold leading-relaxed">
                {currentQuestion.prompt}
              </h3>
              {currentQuestion.formula ? (
                <div className="rounded-lg border border-dashed border-border bg-muted/50 p-3">
                  <BlockMath>{currentQuestion.formula}</BlockMath>
                </div>
              ) : null}

              <div className="grid gap-2">
                {currentQuestion.options.map((option) => {
                  const isActive = selectedAnswer === option
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedAnswer(option)}
                      className={`rounded-lg border p-3 text-left transition ${
                        isActive
                          ? "border-teal-500 bg-teal-50 text-teal-900 dark:bg-teal-500/10 dark:text-teal-100"
                          : "border-border bg-background hover:bg-muted/60"
                      }`}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>

              {typeof validated[currentQuestion.id] === "boolean" ? (
                <div
                  className={`rounded-lg border p-3 text-sm ${
                    validated[currentQuestion.id]
                      ? "border-emerald-400/50 bg-emerald-500/10"
                      : "border-rose-400/50 bg-rose-500/10"
                  }`}
                >
                  <p className="mb-1 inline-flex items-center gap-1 font-semibold">
                    {validated[currentQuestion.id] ? (
                      <>
                        <CheckCircle2 className="size-4" /> Correct
                      </>
                    ) : (
                      <>
                        <XCircle className="size-4" /> Not yet
                      </>
                    )}
                  </p>
                  <p>{currentQuestion.explanation}</p>
                </div>
              ) : null}

              <Button
                onClick={onCheckAnswer}
                disabled={!selectedAnswer || checkingAnswer}
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                {checkingAnswer ? "Scoring..." : "Check & Continue"}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-5 rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-100/60 via-background to-teal-100/50 p-5 dark:from-amber-400/10 dark:to-teal-400/10"
            >
              <div className="inline-flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Trophy className="size-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">
                  Triumph Score Report
                </span>
              </div>
              <h3 className="text-3xl font-bold">{score}%</h3>
              <p className="text-muted-foreground">{scoreMessage}</p>

              <div className="grid gap-2 text-sm">
                {quizQuestions.map((question) => {
                  const wasCorrect = validated[question.id]
                  return (
                    <div
                      key={question.id}
                      className="flex items-center justify-between rounded-md border border-border/70 bg-background/80 p-2"
                    >
                      <span className="truncate pr-4">{question.topic}</span>
                      <span
                        className={`inline-flex items-center gap-1 ${
                          wasCorrect ? "text-emerald-600" : "text-rose-500"
                        }`}
                      >
                        {wasCorrect ? (
                          <>
                            <CheckCircle2 className="size-4" /> Correct
                          </>
                        ) : (
                          <>
                            <XCircle className="size-4" /> Retry
                          </>
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={onRetryWrongOnes}
                  variant="outline"
                  disabled={!wrongQuestionIds.length}
                >
                  Retry Wrong Ones
                </Button>
                <Button onClick={onResetQuiz} variant="secondary">
                  <RotateCcw className="mr-1 size-4" />
                  Start Fresh
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
