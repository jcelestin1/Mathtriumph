/**
 * Topic mastery data for stacked bar charts.
 * Values should total 100 per topic.
 */
export type TopicMasteryData = {
  topic: "Algebra" | "Geometry" | "Trigonometry" | "Probability" | "Statistics" | "Calculus"
  masteredPercentage: number
  needsWorkPercentage: number
}

export const topicMasteryData: TopicMasteryData[] = [
  { topic: "Algebra", masteredPercentage: 88, needsWorkPercentage: 12 },
  { topic: "Geometry", masteredPercentage: 76, needsWorkPercentage: 24 },
  { topic: "Trigonometry", masteredPercentage: 69, needsWorkPercentage: 31 },
  { topic: "Probability", masteredPercentage: 83, needsWorkPercentage: 17 },
  { topic: "Statistics", masteredPercentage: 79, needsWorkPercentage: 21 },
  { topic: "Calculus", masteredPercentage: 72, needsWorkPercentage: 28 },
]
