import type { Metadata } from "next"

import { DemoHomeClient } from "@/components/demo/demo-home-client"

export const metadata: Metadata = {
  title: "Demo Homepage",
  description:
    "Explore MathTriumph dashboards for Student, Teacher/Manager, and Parent roles in one click.",
}

export default function DemoPage() {
  return <DemoHomeClient />
}
