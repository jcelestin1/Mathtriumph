"use client"

import { CheckCircle2, CircleGauge, TrendingUp } from "lucide-react"
import { Cell, Pie, PieChart } from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

type MasteryDistributionPoint = {
  name: string
  value: number
  fill: string
}

const defaultData: MasteryDistributionPoint[] = [
  { name: "Mastered", value: 68, fill: "#0F766E" },
  { name: "Proficient", value: 22, fill: "#0EA5E9" },
  { name: "Developing", value: 10, fill: "#F59E0B" },
]

type MasteryPieChartProps = {
  title?: string
  data?: MasteryDistributionPoint[]
  className?: string
}

export function MasteryPieChart({
  title = "Mastery Distribution",
  data = defaultData,
  className,
}: MasteryPieChartProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm font-medium">{title}</p>
      <ChartContainer
        config={{
          Mastered: { label: "Mastered", color: "#0F766E", icon: CheckCircle2 },
          Proficient: { label: "Proficient", color: "#0EA5E9", icon: TrendingUp },
          Developing: { label: "Developing", color: "#F59E0B", icon: CircleGauge },
        }}
        className="h-[280px]"
      >
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
        </PieChart>
      </ChartContainer>
    </div>
  )
}
