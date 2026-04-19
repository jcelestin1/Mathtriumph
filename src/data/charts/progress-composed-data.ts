/**
 * Progress composed-chart points.
 * Use for Bar (actual), Line (goal), and Area (cumulative progress) overlays.
 */
export type ProgressComposedData = {
  week: string
  actualScore: number
  goalScore: number
  cumulativeProgress: number
}

export const progressComposedData: ProgressComposedData[] = [
  { week: "W1", actualScore: 63, goalScore: 70, cumulativeProgress: 63 },
  { week: "W2", actualScore: 67, goalScore: 72, cumulativeProgress: 65 },
  { week: "W3", actualScore: 71, goalScore: 74, cumulativeProgress: 67 },
  { week: "W4", actualScore: 74, goalScore: 76, cumulativeProgress: 69 },
  { week: "W5", actualScore: 77, goalScore: 78, cumulativeProgress: 71 },
  { week: "W6", actualScore: 80, goalScore: 80, cumulativeProgress: 73 },
  { week: "W7", actualScore: 83, goalScore: 82, cumulativeProgress: 75 },
  { week: "W8", actualScore: 86, goalScore: 84, cumulativeProgress: 78 },
]
