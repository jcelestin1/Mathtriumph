import type { Metadata } from "next"
import { BookOpenCheck, Clock3 } from "lucide-react"

import { getAllQuizzes } from "@/lib/quiz-engine"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SecureStartQuizButton } from "@/components/quiz/secure-start-quiz-button"

export const metadata: Metadata = {
  title: "Practice Quiz Library",
  description:
    "Browse and launch interactive MathTriumph quizzes with timer, scoring, and detailed explanations.",
}

export default function PracticeQuizLibraryPage() {
  const quizzes = getAllQuizzes()

  return (
    <section className="space-y-4">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <BookOpenCheck className="size-4 text-teal-600" />
          Practice Library
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Interactive Quiz Collection
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose a quiz, train under timed conditions, and review step-by-step
          feedback to improve faster.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="border-teal-200/60">
            <CardHeader className="space-y-2">
              <CardTitle>{quiz.title}</CardTitle>
              <CardDescription>{quiz.subtitle}</CardDescription>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  <Clock3 className="mr-1 size-3.5" />
                  {quiz.durationMinutes} min
                </Badge>
                <Badge variant="outline">{quiz.questions.length} questions</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {quiz.topics.map((topic) => (
                  <Badge key={topic} variant="outline">
                    {topic}
                  </Badge>
                ))}
              </div>
              <SecureStartQuizButton quizId={quiz.id} />
              <p className="text-xs text-muted-foreground">
                Launches in secure exam mode with hardware checks.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
