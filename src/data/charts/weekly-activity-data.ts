/**
 * Weekly activity points for area charts.
 * These values simulate student activity over a 7-day cycle.
 */
export type WeeklyActivityData = {
  dayOfWeek: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"
  practiceMinutes: number
  assessmentsCompleted: number
  averageScore: number
}

export const weeklyActivityData: WeeklyActivityData[] = [
  { dayOfWeek: "Mon", practiceMinutes: 34, assessmentsCompleted: 1, averageScore: 74 },
  { dayOfWeek: "Tue", practiceMinutes: 42, assessmentsCompleted: 2, averageScore: 76 },
  { dayOfWeek: "Wed", practiceMinutes: 39, assessmentsCompleted: 1, averageScore: 77 },
  { dayOfWeek: "Thu", practiceMinutes: 48, assessmentsCompleted: 2, averageScore: 80 },
  { dayOfWeek: "Fri", practiceMinutes: 44, assessmentsCompleted: 2, averageScore: 81 },
  { dayOfWeek: "Sat", practiceMinutes: 30, assessmentsCompleted: 1, averageScore: 79 },
  { dayOfWeek: "Sun", practiceMinutes: 26, assessmentsCompleted: 1, averageScore: 78 },
]
