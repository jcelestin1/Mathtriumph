"use client"

import { PartyPopper, TrendingUp } from "lucide-react"

import { ProgressRing } from "@/components/ui/progress-ring"

export function ProgressCelebration({
  title,
  percent,
  message,
}: {
  title: string
  percent: number
  message: string
}) {
  const remaining = Math.max(0, 100 - percent)

  return (
    <div className="premium-surface flex flex-wrap items-center justify-between gap-4 rounded-2xl p-4">
      <div className="space-y-1">
        <p className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 dark:text-teal-300">
          <PartyPopper className="size-4" />
          {title}
        </p>
        <p className="text-sm text-muted-foreground">{message}</p>
        <p className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="size-3.5" />
          {remaining === 0
            ? "Target reached. Keep compounding your consistency."
            : `${remaining}% to next mastery milestone.`}
        </p>
      </div>
      <ProgressRing value={percent} label="mastery" />
    </div>
  )
}
