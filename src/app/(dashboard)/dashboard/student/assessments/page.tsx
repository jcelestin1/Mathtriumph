import type { Metadata } from "next"
import { ClipboardCheck } from "lucide-react"

import { StudentAssessmentHistoryClient } from "@/components/dashboard/student-assessment-history-client"

export const metadata: Metadata = {
  title: "Student Assessments",
  description:
    "Track quiz history, identify weak topics, and follow smart recommendations.",
}

export default function StudentAssessmentsPage() {
  return (
    <section className="space-y-4">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ClipboardCheck className="size-4 text-teal-600" />
          Student Assessments
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Assessments History & Recommendations
        </h2>
      </div>
      <StudentAssessmentHistoryClient />
    </section>
  )
}
