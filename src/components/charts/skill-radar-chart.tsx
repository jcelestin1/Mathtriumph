"use client"

import { Crosshair, Goal } from "lucide-react"
import {
  LabelList,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

type SkillRadarPoint = {
  topic: string
  current: number
}

const defaultData: SkillRadarPoint[] = [
  { topic: "Algebra", current: 88 },
  { topic: "Geometry", current: 76 },
  { topic: "Trigonometry", current: 69 },
  { topic: "Probability", current: 84 },
  { topic: "Statistics", current: 79 },
  { topic: "Calculus", current: 73 },
]

type SkillRadarChartProps = {
  title?: string
  data?: SkillRadarPoint[]
  targetScore?: number
  className?: string
}

export function SkillRadarChart({
  title = "Skill Radar",
  data = defaultData,
  targetScore = 90,
  className,
}: SkillRadarChartProps) {
  const chartData = data.map((item) => ({ ...item, target: targetScore }))
  const averageMastery = Math.round(
    chartData.reduce((sum, item) => sum + item.current, 0) / chartData.length
  )

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-end justify-between gap-3">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">
          Avg mastery: <span className="font-semibold text-teal-700 dark:text-teal-300">{averageMastery}%</span>{" "}
          • Target: <span className="font-semibold text-sky-700 dark:text-sky-300">{targetScore}%</span>
        </p>
      </div>
      <ChartContainer
        className="h-[360px]"
        config={{
          current: { label: "Current Mastery", color: "#0F766E", icon: Crosshair },
          target: { label: "Target Mastery", color: "#0EA5E9", icon: Goal },
        }}
      >
        <RadarChart data={chartData} outerRadius="72%">
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis
            dataKey="topic"
            tickLine={false}
            className="fill-muted-foreground text-xs"
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tickCount={6}
            className="fill-muted-foreground text-[10px]"
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Radar
            name="Current Mastery"
            dataKey="current"
            stroke="var(--color-current)"
            fill="var(--color-current)"
            fillOpacity={0.35}
            strokeWidth={2.5}
            dot={{ r: 3, fill: "var(--color-current)" }}
          >
            <LabelList
              dataKey="current"
              position="top"
              className="fill-teal-700 text-[10px] dark:fill-teal-300"
            />
          </Radar>
          <Radar
            name="Target Mastery"
            dataKey="target"
            stroke="var(--color-target)"
            fill="transparent"
            strokeDasharray="5 4"
            strokeWidth={2}
            dot={{ r: 2, fill: "var(--color-target)" }}
          />
        </RadarChart>
      </ChartContainer>
    </div>
  )
}
