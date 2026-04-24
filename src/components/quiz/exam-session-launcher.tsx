"use client"

import { AlertTriangle, MonitorCog, ShieldAlert } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import { detectHardwareRisk } from "@/lib/exam-security"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Props = {
  quizId: string
}

export function ExamSessionLauncher({ quizId }: Props) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(false)
  const [canStart, setCanStart] = useState(false)
  const [blockReason, setBlockReason] = useState("")
  const [warningOpen, setWarningOpen] = useState(false)
  const [warningReasons, setWarningReasons] = useState<string[]>([])

  const examUrl = useMemo(() => `/practice/quiz/${quizId}?mode=secure`, [quizId])

  useEffect(() => {
    let active = true

    const runHardwareCheck = async () => {
      const assessment = await detectHardwareRisk(window)
      if (!active) return

      setWarningReasons(assessment.reasons)
      setBlockReason(
        assessment.shouldBlockStart
          ? "Multiple displays are active. Disconnect extra monitors before starting the secure exam."
          : ""
      )
      setCanStart(!assessment.shouldBlockStart)
    }

    void runHardwareCheck()
    const timer = window.setInterval(() => {
      void runHardwareCheck()
    }, 30_000)

    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [])

  const launchExam = async () => {
    setIsChecking(true)
    try {
      const assessment = await detectHardwareRisk(window)

      if (assessment.shouldWarn) {
        setWarningReasons(assessment.reasons)
        setWarningOpen(true)
      }

      if (assessment.shouldBlockStart) {
        setCanStart(false)
        setBlockReason(
          "Secure exam mode blocks launch while multiple displays are connected."
        )
        return
      }

      setCanStart(true)
      router.push(examUrl)
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <>
      <div className="rounded-xl border border-teal-200/70 bg-teal-50/50 p-4 dark:border-teal-500/30 dark:bg-teal-500/10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-teal-800 dark:text-teal-200">
              <ShieldAlert className="size-4" />
              Secure exam launch
            </p>
            <p className="text-sm text-muted-foreground">
              Start opens the focused exam session and keeps device checks lightweight.
            </p>
            {blockReason ? (
              <p className="inline-flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                <AlertTriangle className="size-4" />
                {blockReason}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            className="bg-teal-600 text-white hover:bg-teal-700"
            onClick={launchExam}
            disabled={isChecking || !canStart}
          >
            <MonitorCog className="mr-1 size-4" />
            {isChecking ? "Checking hardware..." : "Start Secure Exam"}
          </Button>
        </div>
      </div>

      <Dialog open={warningOpen} onOpenChange={setWarningOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>You aren&apos;t slick.</DialogTitle>
            <DialogDescription>
              Secure mode noticed a display setup that looks like a mirrored TV, HDMI panel,
              or oversized monitor. Disconnect it before continuing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-lg border border-amber-300/70 bg-amber-50/70 p-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">
            {warningReasons.length ? (
              warningReasons.map((reason) => <p key={reason}>• {reason}</p>)
            ) : (
              <p>• Hardware heuristics flagged a suspicious display profile.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWarningOpen(false)}>
              Acknowledge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
