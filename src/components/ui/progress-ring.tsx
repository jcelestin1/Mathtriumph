"use client"

import { cn } from "@/lib/utils"

export function ProgressRing({
  value,
  size = 88,
  stroke = 10,
  className,
  label,
}: {
  value: number
  size?: number
  stroke?: number
  className?: string
  label?: string
}) {
  const clamped = Math.max(0, Math.min(100, value))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dashoffset = circumference * (1 - clamped / 100)

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/40"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-teal-500"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-lg font-semibold">{Math.round(clamped)}%</p>
        {label ? <p className="text-[11px] text-muted-foreground">{label}</p> : null}
      </div>
    </div>
  )
}
