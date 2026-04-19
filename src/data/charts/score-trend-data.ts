/**
 * Score trend points for line charts.
 * Replace this array with API data from your assessments endpoint.
 */
export type ScoreTrendData = {
  date: string
  actualScore: number
  predictedScore: number
  topic: "Algebra" | "Geometry" | "Trigonometry" | "Probability" | "Statistics" | "Calculus"
}

export const scoreTrendData: ScoreTrendData[] = [
  { date: "2026-01-12", actualScore: 62, predictedScore: 64, topic: "Algebra" },
  { date: "2026-01-19", actualScore: 65, predictedScore: 67, topic: "Geometry" },
  { date: "2026-01-26", actualScore: 67, predictedScore: 69, topic: "Trigonometry" },
  { date: "2026-02-02", actualScore: 70, predictedScore: 71, topic: "Probability" },
  { date: "2026-02-09", actualScore: 72, predictedScore: 74, topic: "Statistics" },
  { date: "2026-02-16", actualScore: 75, predictedScore: 76, topic: "Calculus" },
  { date: "2026-02-23", actualScore: 77, predictedScore: 79, topic: "Algebra" },
  { date: "2026-03-02", actualScore: 80, predictedScore: 81, topic: "Geometry" },
  { date: "2026-03-09", actualScore: 83, predictedScore: 84, topic: "Probability" },
  { date: "2026-03-16", actualScore: 86, predictedScore: 88, topic: "Calculus" },
]
