"use client"

import { Flame, Medal, Sparkles, Trophy } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

type GamificationBarProps = {
  streakDays: number
  xpThisWeek: number
  badgesEarned: number
  achievementLabel: string
}

export function GamificationBar({
  streakDays,
  xpThisWeek,
  badgesEarned,
  achievementLabel,
}: GamificationBarProps) {
  return (
    <Card className="premium-surface overflow-hidden">
      <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-teal-200/70 bg-teal-50/70 p-3 dark:border-teal-500/30 dark:bg-teal-500/10">
          <p className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Flame className="size-3.5 text-orange-500" />
            Current streak
          </p>
          <p className="text-xl font-semibold">{streakDays} days</p>
        </div>
        <div className="rounded-xl border border-sky-200/70 bg-sky-50/70 p-3 dark:border-sky-500/30 dark:bg-sky-500/10">
          <p className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-sky-500" />
            XP this week
          </p>
          <p className="text-xl font-semibold">{xpThisWeek}</p>
        </div>
        <div className="rounded-xl border border-amber-200/70 bg-amber-50/70 p-3 dark:border-amber-500/30 dark:bg-amber-500/10">
          <p className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Medal className="size-3.5 text-amber-500" />
            Badges unlocked
          </p>
          <p className="text-xl font-semibold">{badgesEarned}</p>
        </div>
        <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/70 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
          <p className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Trophy className="size-3.5 text-emerald-500" />
            Latest achievement
          </p>
          <Badge className="bg-emerald-600 text-white dark:bg-emerald-500">
            {achievementLabel}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
