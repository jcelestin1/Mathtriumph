"use client"

import Link from "next/link"
import { ShieldAlert } from "lucide-react"

import { clearSecureExamSession } from "@/lib/secure-exam-session"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SessionActivePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-10">
      <Card className="w-full border-teal-200/70">
        <CardHeader className="space-y-3">
          <p className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 dark:text-teal-300">
            <ShieldAlert className="size-4" />
            Session Active
          </p>
          <CardTitle>Secure exam window launched.</CardTitle>
          <CardDescription>
            Keep only the focused exam window open. This tab should remain inactive during the
            assessment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            If the secure exam window did not open, return to the quiz library and launch it again
            after allowing pop-ups.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                clearSecureExamSession()
                window.close()
              }}
            >
              Close This Tab
            </Button>
            <Button render={<Link href="/practice/quiz" />}>Return to Quiz Library</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
