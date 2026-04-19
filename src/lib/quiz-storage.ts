import type { IntegrityReviewStatus, QuizAttempt } from "@/lib/quiz-engine"

let cachedAttempts: QuizAttempt[] = []

export function getAllQuizAttempts() {
  return cachedAttempts
}

export function getQuizAttemptsByQuizId(quizId: string) {
  return cachedAttempts.filter((attempt) => attempt.quizId === quizId)
}

export async function syncQuizAttempts() {
  if (typeof window === "undefined") return []
  try {
    const response = await fetch("/api/student-records/attempts", {
      method: "GET",
      cache: "no-store",
    })
    if (!response.ok) return cachedAttempts
    const json = (await response.json()) as { attempts?: QuizAttempt[] }
    cachedAttempts = Array.isArray(json.attempts) ? json.attempts : []
    return cachedAttempts
  } catch {
    return cachedAttempts
  }
}

export async function saveQuizAttempt(attempt: QuizAttempt) {
  if (typeof window === "undefined") return
  await fetch("/api/student-records/attempts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ attempt }),
  })
  await syncQuizAttempts()
}

export async function updateAttemptIntegrityReview(
  attemptId: string,
  payload: { status?: IntegrityReviewStatus; notes?: string }
) {
  if (typeof window === "undefined") return
  await fetch("/api/student-records/attempts", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      attemptId,
      status: payload.status,
      notes: payload.notes,
    }),
  })
  await syncQuizAttempts()
}
