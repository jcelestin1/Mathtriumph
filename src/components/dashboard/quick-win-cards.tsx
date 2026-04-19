import { ArrowRight, CalendarClock, FileDown, Target, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type QuickWinCard = {
  title: string
  description: string
  metric: string
  action: string
}

const roleCards: Record<"student" | "manager" | "parent", QuickWinCard[]> = {
  student: [
    {
      title: "Predicted Next Score",
      description: "Based on your recent attempt quality and pacing.",
      metric: "88%",
      action: "Take 12-min mixed quiz",
    },
    {
      title: "Quick Recovery Topic",
      description: "Fix this one skill for fastest score lift.",
      metric: "Geometry Proofs",
      action: "Practice now",
    },
  ],
  manager: [
    {
      title: "Cohort Readiness",
      description: "Students projected above benchmark this cycle.",
      metric: "74%",
      action: "Assign targeted review",
    },
    {
      title: "Export Ready",
      description: "Parent + district snapshots with intervention notes.",
      metric: "3 reports",
      action: "Export summary",
    },
  ],
  parent: [
    {
      title: "Predicted Family Outcome",
      description: "Estimated score trajectory this month.",
      metric: "83% avg",
      action: "Review growth plan",
    },
    {
      title: "Teacher Follow-up",
      description: "Suggested check-in to reinforce momentum.",
      metric: "Due this week",
      action: "Message teacher",
    },
  ],
}

export function QuickWinCards({ role }: { role: "student" | "manager" | "parent" }) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {roleCards[role].map((item, index) => (
        <Card key={item.title} className="premium-surface">
          <CardHeader className="pb-2">
            <div className="mb-1 inline-flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-teal-300/60 text-teal-700 dark:border-teal-500/30 dark:text-teal-200"
              >
                {index === 0 ? <TrendingUp className="mr-1 size-3.5" /> : <Target className="mr-1 size-3.5" />}
                Quick win
              </Badge>
            </div>
            <CardTitle className="text-base">{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-2">
            <div>
              <p className="text-lg font-semibold">{item.metric}</p>
              <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarClock className="size-3.5" />
                Actionable today
              </p>
            </div>
            <Button size="sm" variant="outline">
              {role === "manager" ? <FileDown className="mr-1 size-4" /> : null}
              {item.action}
              <ArrowRight className="ml-1 size-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
