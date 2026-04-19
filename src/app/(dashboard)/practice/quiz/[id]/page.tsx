import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { QuizEngineClient } from "@/components/quiz/quiz-engine-client"
import { getQuizById } from "@/lib/quiz-engine"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const quiz = getQuizById(id)

  if (!quiz) {
    return {
      title: "Quiz Not Found",
      description: "Requested practice quiz could not be found.",
    }
  }

  return {
    title: `${quiz.title} | Practice Quiz`,
    description: quiz.subtitle,
  }
}

export default async function PracticeQuizPage({ params }: Props) {
  const { id } = await params
  const quiz = getQuizById(id)

  if (!quiz) {
    notFound()
  }

  return <QuizEngineClient quiz={quiz} />
}
