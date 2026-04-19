"use client"

import { ChartColumn, Goal } from "lucide-react"
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

type ProgressComposedPoint = {
  week: string
  actual: number
  goal: number
  cumulative: number
}

const defaultData: ProgressComposedPoint[] = [
  { week: "W1", actual: 63, goal: 70, cumulative: 63 },
  { week: "W2", actual: 68, goal: 72, cumulative: 66 },
  { week: "W3", actual: 71, goal: 74, cumulative: 67 },
  { week: "W4", actual: 74, goal: 76, cumulative: 69 },
  { week: "W5", actual: 77, goal: 78, cumulative: 71 },
  { week: "W6", actual: 81, goal: 80, cumulative: 73 },
]

type ProgressComposedChartProps = {
  title?: string
  data?: ProgressComposedPoint[]
  className?: string
}

export function ProgressComposedChart({
  title = "Progress vs Goal",
  data = defaultData,
  className,
}: ProgressComposedChartProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm font-medium">{title}</p>
      <ChartContainer
        className="h-[330px]"
        config={{
          actual: { label: "Actual Score", color: "#0F766E", icon: ChartColumn },
          goal: { label: "Goal", color: "#0EA5E9", icon: Goal },
          cumulative: { label: "Cumulative", color: "#10B981" },
        }}
      >
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="cumulativeProgressFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.06} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Area
            type="natural"
            dataKey="cumulative"
            stroke="var(--color-cumulative)"
            fill="url(#cumulativeProgressFill)"
            strokeWidth={2}
          />
          <Bar dataKey="actual" fill="var(--color-actual)" radius={[4, 4, 0, 0]} />
          <Line
            type="natural"
            dataKey="goal"
            stroke="var(--color-goal)"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  )
}
