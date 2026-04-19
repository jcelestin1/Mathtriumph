/**
 * Skill radar values for current and target mastery.
 * Use this shape to compare a student's profile against a fixed goal.
 */
export type SkillTopic =
  | "Algebra"
  | "Geometry"
  | "Trigonometry"
  | "Probability"
  | "Statistics"
  | "Calculus"

export type SkillRadarMasteryProfile = Record<SkillTopic, number>

export type SkillRadarDataPoint = {
  topic: SkillTopic
  currentMastery: number
  targetMastery: number
}

export const currentMastery: SkillRadarMasteryProfile = {
  Algebra: 87,
  Geometry: 75,
  Trigonometry: 68,
  Probability: 84,
  Statistics: 79,
  Calculus: 72,
}

export const targetMastery: SkillRadarMasteryProfile = {
  Algebra: 90,
  Geometry: 90,
  Trigonometry: 90,
  Probability: 90,
  Statistics: 90,
  Calculus: 90,
}

// Convenient chart-ready array format.
export const skillRadarData: SkillRadarDataPoint[] = [
  { topic: "Algebra", currentMastery: currentMastery.Algebra, targetMastery: targetMastery.Algebra },
  { topic: "Geometry", currentMastery: currentMastery.Geometry, targetMastery: targetMastery.Geometry },
  { topic: "Trigonometry", currentMastery: currentMastery.Trigonometry, targetMastery: targetMastery.Trigonometry },
  { topic: "Probability", currentMastery: currentMastery.Probability, targetMastery: targetMastery.Probability },
  { topic: "Statistics", currentMastery: currentMastery.Statistics, targetMastery: targetMastery.Statistics },
  { topic: "Calculus", currentMastery: currentMastery.Calculus, targetMastery: targetMastery.Calculus },
]
