"use client"

import { BookOpenCheck, TriangleAlert } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
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

type TopicMasteryPoint = {
  topic: string
  mastered: number
  needsWork: number
}

const defaultData: TopicMasteryPoint[] = [
  { topic: "Algebra", mastered: 92, needsWork: 8 },
  { topic: "Geometry", mastered: 78, needsWork: 22 },
  { topic: "Trigonometry", mastered: 65, needsWork: 35 },
  { topic: "Probability", mastered: 88, needsWork: 12 },
  { topic: "Statistics", mastered: 81, needsWork: 19 },
  { topic: "Calculus", mastered: 71, needsWork: 29 },
]

type TopicMasteryChartProps = {
  title?: string
  data?: TopicMasteryPoint[]
  className?: string
}

export function TopicMasteryChart({
  title = "Topic Mastery",
  data = defaultData,
  className,
}: TopicMasteryChartProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm font-medium">{title}</p>
      <ChartContainer
        config={{
          mastered: { label: "Mastered %", color: "#0F766E", icon: BookOpenCheck },
          needsWork: { label: "Needs Work %", color: "#F43F5E", icon: TriangleAlert },
        }}
        className="h-[320px]"
      >
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="topic" tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="mastered" stackId="topic" fill="var(--color-mastered)" radius={4}>
            <LabelList dataKey="mastered" position="insideTop" className="fill-white text-[10px]" />
          </Bar>
          <Bar dataKey="needsWork" stackId="topic" fill="var(--color-needsWork)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
