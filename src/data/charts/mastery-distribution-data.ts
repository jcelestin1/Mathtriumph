/**
 * Overall distribution for donut/pie charts.
 * Fill values align with MathTriumph brand tones.
 */
export type MasteryDistributionData = {
  name: "Mastered" | "Proficient" | "Developing"
  value: number
  fill: string
}

export const masteryDistributionData: MasteryDistributionData[] = [
  { name: "Mastered", value: 66, fill: "#0F766E" },
  { name: "Proficient", value: 24, fill: "#0EA5E9" },
  { name: "Developing", value: 10, fill: "#F59E0B" },
]
