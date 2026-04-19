import type { QuizAttempt } from "@/lib/quiz-engine"

type WeakTopic = {
  topic: string
  missRate: number
  misses: number
  attempts: number
}

export type StudentRecommendation = {
  title: string
  detail: string
  confidence: "high" | "medium" | "low"
}

export function getWeakTopicsFromAttempts(attempts: QuizAttempt[]) {
  const topicStats = new Map<string, { misses: number; attempts: number }>()

  attempts.forEach((attempt) => {
    attempt.results.forEach((result) => {
      const current = topicStats.get(result.topic) ?? { misses: 0, attempts: 0 }
      current.attempts += 1
      if (!result.isCorrect) {
        current.misses += 1
      }
      topicStats.set(result.topic, current)
    })
  })

  const weakTopics: WeakTopic[] = Array.from(topicStats.entries())
    .map(([topic, stats]) => ({
      topic,
      misses: stats.misses,
      attempts: stats.attempts,
      missRate: Math.round((stats.misses / stats.attempts) * 100),
    }))
    .filter((topic) => topic.missRate >= 35)
    .sort((a, b) => b.missRate - a.missRate)

  return weakTopics
}

export function getRecentAverageScore(attempts: QuizAttempt[], count = 5) {
  if (!attempts.length) return null
  const slice = attempts.slice(0, count)
  const total = slice.reduce((sum, attempt) => sum + attempt.scorePercent, 0)
  return Math.round(total / slice.length)
}

export function buildStudentRecommendations(attempts: QuizAttempt[]) {
  if (!attempts.length) {
    return [
      {
        title: "Take your first mixed-topic quiz",
        detail:
          "Start with Algebra + Geometry Foundations to generate your baseline profile and targeted recommendations.",
        confidence: "high",
      },
    ] satisfies StudentRecommendation[]
  }

  const weakTopics = getWeakTopicsFromAttempts(attempts)
  const recentAvg = getRecentAverageScore(attempts, 4) ?? 0
  const recommendations: StudentRecommendation[] = []

  if (weakTopics[0]) {
    recommendations.push({
      title: `Focus ${weakTopics[0].topic} next`,
      detail: `${weakTopics[0].missRate}% miss rate recently. Run a targeted 10-15 minute drill before your next timed quiz.`,
      confidence: weakTopics[0].missRate >= 55 ? "high" : "medium",
    })
  }

  if (recentAvg < 70) {
    recommendations.push({
      title: "Use instant feedback mode for 3 attempts",
      detail:
        "Your recent score average is below 70%. Review each explanation before moving forward to rebuild accuracy.",
      confidence: "high",
    })
  } else if (recentAvg < 85) {
    recommendations.push({
      title: "Alternate timed and review attempts",
      detail:
        "Your recent average is stable. Alternate one timed run with one detailed review run to push into mastery range.",
      confidence: "medium",
    })
  } else {
    recommendations.push({
      title: "Increase challenge level",
      detail:
        "Strong recent performance. Move to more advanced mixed-topic quizzes to sustain growth.",
      confidence: "medium",
    })
  }

  recommendations.push({
    title: "Retake your latest quiz after 24 hours",
    detail:
      "Spaced retrieval improves long-term retention and lowers repeated error patterns.",
    confidence: "low",
  })

  return recommendations
}
