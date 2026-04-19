"use client"

import { Target, TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

type ScoreTrendPoint = {
  week?: string
  day?: string
  actual: number
  predicted: number
}

const defaultData: ScoreTrendPoint[] = [
  { week: "W1", actual: 62, predicted: 64 },
  { week: "W2", actual: 66, predicted: 68 },
  { week: "W3", actual: 69, predicted: 70 },
  { week: "W4", actual: 72, predicted: 73 },
  { week: "W5", actual: 75, predicted: 77 },
  { week: "W6", actual: 78, predicted: 80 },
]

type ScoreTrendChartProps = {
  title?: string
  data?: ScoreTrendPoint[]
  xKey?: "week" | "day"
  className?: string
}

export function ScoreTrendChart({
  title = "Score Trend",
  data = defaultData,
  xKey = "week",
  className,
}: ScoreTrendChartProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm font-medium">{title}</p>
      <ChartContainer
        className="h-[320px]"
        config={{
          actual: { label: "Actual Score", color: "#0F766E", icon: TrendingUp },
          predicted: { label: "Predicted Score", color: "#0EA5E9", icon: Target },
        }}
      >
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            dataKey="actual"
            type="natural"
            stroke="var(--color-actual)"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            dataKey="predicted"
            type="natural"
            stroke="var(--color-predicted)"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={{ r: 0 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
}
