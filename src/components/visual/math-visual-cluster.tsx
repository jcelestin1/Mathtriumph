import { Activity, CircleDotDashed, Sigma, Triangle } from "lucide-react"

import { Badge } from "@/components/ui/badge"

export function MathVisualCluster({ compact = false }: { compact?: boolean }) {
  return (
    <div className="math-grid-bg relative overflow-hidden rounded-2xl border border-teal-200/70 bg-gradient-to-br from-teal-100/80 via-background to-sky-100/70 p-5 dark:border-teal-500/30 dark:from-teal-500/15 dark:to-sky-500/10">
      <div className="absolute -right-8 -top-8 size-28 rounded-full bg-sky-400/20 blur-2xl dark:bg-sky-500/20" />
      <div className="absolute -bottom-10 -left-10 size-28 rounded-full bg-teal-500/20 blur-2xl dark:bg-teal-400/20" />
      <div className="relative grid gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-teal-600 text-white dark:bg-teal-500">
            <Activity className="mr-1 size-3.5" />
            Predicted growth +12%
          </Badge>
          <Badge variant="secondary">
            <Sigma className="mr-1 size-3.5" />
            Adaptive pathways
          </Badge>
        </div>
        <div className={`grid gap-3 ${compact ? "grid-cols-2" : "grid-cols-3"}`}>
          <div className="rounded-xl border border-border/70 bg-background/80 p-3">
            <p className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Triangle className="size-3.5 text-sky-500" />
              Spatial reasoning
            </p>
            <p className="text-lg font-semibold">89%</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/80 p-3">
            <p className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CircleDotDashed className="size-3.5 text-teal-500" />
              Mastery ring
            </p>
            <p className="text-lg font-semibold">84%</p>
          </div>
          {!compact ? (
            <div className="rounded-xl border border-border/70 bg-background/80 p-3">
              <p className="mb-1 text-xs text-muted-foreground">Trust score</p>
              <p className="text-lg font-semibold">District-ready</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
