import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ExamLauncherClient } from "@/components/exam/exam-launcher-client"
import { ProctoredQuizClient } from "@/components/exam/proctored-quiz-client"
import { getQuizById } from "@/lib/quiz-engine"

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ proctored?: string; cam?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const quiz = getQuizById(id)
  return {
    title: quiz ? `${quiz.title} | Proctored Exam` : "Proctored Exam",
    description: quiz?.subtitle ?? "Secured exam mode for MathTriumph quizzes.",
  }
}

export default async function ProctoredExamPage({ params, searchParams }: Props) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  const quiz = getQuizById(id)

  if (!quiz) {
    notFound()
  }

  if (query.proctored !== "1") {
    return <ExamLauncherClient quizId={id} quizTitle={quiz.title} subtitle={quiz.subtitle} />
  }

  return (
    <ProctoredQuizClient
      quiz={quiz}
      enableCameraSnapshots={query.cam === "1"}
    />
  )
}
