"use client"

import { AlertTriangle, Camera, ShieldAlert } from "lucide-react"

import type { ProctoringSeverity } from "@/lib/exam-security"
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
  isLocked: boolean
  lockState: {
    status: "focus-lost" | "cooldown"
    severity: ProctoringSeverity
    message: string
  } | null
  reentryJustification: string
  setReentryJustification: (value: string) => void
  canSubmitReentry: boolean
  cooldownLabel: string
  onSubmitReentry: () => void
  hardwareWarningOpen: boolean
  setHardwareWarningOpen: (open: boolean) => void
  hardwareWarningReasons: string[]
  totalEventCount: number
  cameraStatus: "idle" | "ready" | "blocked"
}

export function QuizProctoringOverlay({
  isLocked,
  lockState,
  reentryJustification,
  setReentryJustification,
  canSubmitReentry,
  cooldownLabel,
  onSubmitReentry,
  hardwareWarningOpen,
  setHardwareWarningOpen,
  hardwareWarningReasons,
  totalEventCount,
  cameraStatus,
}: Props) {
  return (
    <>
      <div className="rounded-xl border border-sky-300/60 bg-sky-50/60 p-3 text-sm dark:bg-sky-500/10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-1">
            <p className="inline-flex items-center gap-2 font-medium text-sky-900 dark:text-sky-200">
              <ShieldAlert className="size-4" />
              Secure session active
            </p>
            <p className="text-muted-foreground">
              Worker heartbeat runs every 2 seconds, hardware checks every 30 seconds, and
              camera snapshots stay low-res.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border/70 px-2 py-1">
              Events logged: {totalEventCount}
            </span>
            <span className="rounded-full border border-border/70 px-2 py-1">
              <Camera className="mr-1 inline size-3.5" />
              Camera: {cameraStatus}
            </span>
          </div>
        </div>
      </div>

      {isLocked && lockState ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-rose-300/70 bg-background p-6 shadow-2xl">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-rose-700 dark:text-rose-300">
              <AlertTriangle className="size-4" />
              Exam locked
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Session focus was interrupted.</h2>
            <p className="mt-2 text-sm text-muted-foreground">{lockState.message}</p>
            <div className="mt-4 rounded-lg border border-border/70 bg-muted/40 p-3 text-sm">
              <p>
                Severity: <strong>{lockState.severity}</strong>
              </p>
              {lockState.status === "cooldown" ? (
                <p>
                  Re-entry unlocks in <strong>{cooldownLabel}</strong>.
                </p>
              ) : (
                <p>Return to the exam window to begin the penalty timer.</p>
              )}
            </div>
            <div className="mt-4 space-y-2">
              <label htmlFor="reentry-justification" className="text-sm font-medium">
                Re-entry justification
              </label>
              <textarea
                id="reentry-justification"
                rows={4}
                value={reentryJustification}
                onChange={(event) => setReentryJustification(event.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="Explain why you left the secure exam window."
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Submit stays disabled until the penalty timer expires and the explanation is
                provided.
              </p>
              <Button
                type="button"
                onClick={onSubmitReentry}
                disabled={!canSubmitReentry || reentryJustification.trim().length < 12}
              >
                Submit Re-entry
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Dialog open={hardwareWarningOpen} onOpenChange={setHardwareWarningOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>You aren&apos;t slick.</DialogTitle>
            <DialogDescription>
              Secure mode detected a display profile that looks like HDMI mirroring, a TV, or
              another oversized panel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-lg border border-amber-300/70 bg-amber-50/70 p-3 text-sm text-amber-900 dark:bg-amber-500/10 dark:text-amber-100">
            {hardwareWarningReasons.map((reason) => (
              <p key={reason}>• {reason}</p>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHardwareWarningOpen(false)}>
              Continue under warning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
