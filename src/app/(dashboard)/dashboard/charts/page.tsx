import type { Metadata } from "next"
import { BarChart2 } from "lucide-react"

import { ChartsDemoClient } from "@/components/charts/charts-demo-client"

export const metadata: Metadata = {
  title: "Charts Demo",
  description:
    "MathTriumph reusable chart gallery showing student, manager, and parent chart components.",
}

export default function DashboardChartsPage() {
  return (
    <section className="space-y-4">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <BarChart2 className="size-4 text-teal-600" />
          Reusable Charts Playground
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Chart Components Demo
        </h2>
        <p className="text-sm text-muted-foreground">
          Production-ready reusable chart components for Student, Manager, and
          Parent dashboards.
        </p>
      </div>
      <ChartsDemoClient />
    </section>
  )
}
