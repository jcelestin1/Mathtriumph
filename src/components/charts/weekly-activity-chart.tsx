"use client"

import { CalendarDays } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

type WeeklyActivityPoint = {
  day: string
  minutes: number
}

const defaultData: WeeklyActivityPoint[] = [
  { day: "Mon", minutes: 34 },
  { day: "Tue", minutes: 41 },
  { day: "Wed", minutes: 38 },
  { day: "Thu", minutes: 47 },
  { day: "Fri", minutes: 44 },
  { day: "Sat", minutes: 29 },
  { day: "Sun", minutes: 26 },
]

type WeeklyActivityChartProps = {
  title?: string
  data?: WeeklyActivityPoint[]
  className?: string
}

export function WeeklyActivityChart({
  title = "Weekly Activity",
  data = defaultData,
  className,
}: WeeklyActivityChartProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm font-medium">{title}</p>
      <ChartContainer
        className="h-[300px]"
        config={{
          minutes: { label: "Practice Minutes", color: "#0EA5E9", icon: CalendarDays },
        }}
      >
        <AreaChart data={data}>
          <defs>
            <linearGradient id="weeklyActivityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.75} />
              <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Area
            type="natural"
            dataKey="minutes"
            stroke="var(--color-minutes)"
            fill="url(#weeklyActivityFill)"
            strokeWidth={2.5}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
