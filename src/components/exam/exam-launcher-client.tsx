"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  AlertOctagon,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Tv,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  detectMultiMonitor,
  inspectHardware,
  type HardwareCheckResult,
} from "@/lib/exam/monitor"

type Props = {
  quizId: string
  quizTitle: string
  subtitle: string
}

type PreflightState =
  | { status: "checking" }
  | { status: "ok"; hardware: HardwareCheckResult }
  | { status: "blocked"; hardware: HardwareCheckResult; reasons: string[] }

const PROCTORED_WINDOW_FEATURES = "toolbar=no,status=no,menubar=no,location=no"

export function ExamLauncherClient({ quizId, quizTitle, subtitle }: Props) {
  const [preflight, setPreflight] = useState<PreflightState>({ status: "checking" })
  const [enableCamera, setEnableCamera] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)
  const [launching, setLaunching] = useState(false)
  const [openedWindowOk, setOpenedWindowOk] = useState<boolean | null>(null)
  const launchedRef = useRef(false)

  const runHardwareCheck = useCallback(async () => {
    const hardware = inspectHardware()
    const multi = await detectMultiMonitor()
    const merged: HardwareCheckResult = {
      ...hardware,
      isMultiMonitor: multi.isMultiMonitor,
      totalScreens: multi.totalScreens,
      suspiciousReasons: [
        ...hardware.suspiciousReasons,
        ...(multi.isMultiMonitor
          ? [`Detected ${multi.totalScreens ?? 2} active displays.`]
          : []),
      ],
    }

    if (merged.isMultiMonitor) {
      setPreflight({
        status: "blocked",
        hardware: merged,
        reasons: merged.suspiciousReasons,
      })
      return
    }
    setPreflight({ status: "ok", hardware: merged })
  }, [])

  useEffect(() => {
    let cancelled = false
    Promise.resolve().then(() => {
      if (cancelled) return
      runHardwareCheck().catch(() => {})
    })
    return () => {
      cancelled = true
    }
  }, [runHardwareCheck])

  const launch = useCallback(() => {
    if (launchedRef.current) return
    if (preflight.status !== "ok") return
    if (!acknowledged) return
    launchedRef.current = true
    setLaunching(true)

    const examUrl = `/practice/exam/${quizId}?proctored=1${enableCamera ? "&cam=1" : ""}`

    // Try to open the exam in a focused, chromeless window. If the popup
    // blocker fires, fall back to a same-tab navigation. Either way, the
    // original tab self-destructs to enforce the single-tab requirement.
    let opened: Window | null = null
    try {
      opened = window.open(examUrl, "mathtriumph_exam", PROCTORED_WINDOW_FEATURES)
    } catch {
      opened = null
    }

    if (opened) {
      opened.focus()
      setOpenedWindowOk(true)
      window.setTimeout(() => {
        try {
          window.location.href = "about:blank"
        } catch {
          // Ignore: some browsers refuse to navigate to about:blank.
        }
        try {
          window.close()
        } catch {
          // Original window may not be script-closable in all browsers.
        }
      }, 600)
    } else {
      setOpenedWindowOk(false)
      // Fallback: navigate the current tab into proctored mode rather than
      // leaving the student staring at a dead launcher.
      window.location.href = examUrl
    }
  }, [acknowledged, enableCamera, preflight, quizId])

  return (
    <section className="mx-auto w-full max-w-2xl space-y-4">
      <Card className="border-teal-300/70">
        <CardHeader className="space-y-2">
          <div className="inline-flex w-fit items-center gap-2">
            <Badge className="bg-emerald-600 text-white">
              <ShieldCheck className="mr-1 size-3.5" />
              Proctored Exam Mode
            </Badge>
          </div>
          <CardTitle>{quizTitle}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PreflightSummary preflight={preflight} onRetry={runHardwareCheck} />

          <div className="rounded-lg border border-border/70 bg-muted/30 p-3 text-sm">
            <p className="mb-2 font-medium">Before you start, please confirm:</p>
            <ul className="ml-5 list-disc space-y-1 text-muted-foreground">
              <li>You are using a single primary monitor.</li>
              <li>All notes, second devices, and chat apps are closed.</li>
              <li>
                You understand the exam will lock and require a written
                justification if you switch tabs or windows for more than ~4
                seconds.
              </li>
              <li>
                Lockouts last 3, 4, or 5 minutes depending on severity and
                history.
              </li>
            </ul>
            <label className="mt-3 flex items-start gap-2">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(event) => setAcknowledged(event.target.checked)}
                className="mt-1"
              />
              <span>I acknowledge the proctoring policy.</span>
            </label>
            <label className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={enableCamera}
                onChange={(event) => setEnableCamera(event.target.checked)}
                className="mt-1"
              />
              <span>
                Allow low-resolution camera snapshots (~1 every 45s, ~4KB
                each). Used only for integrity review.
              </span>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant="outline" className="border-border">
              Tab will redirect to a focused exam window
            </Badge>
            <Button
              onClick={launch}
              disabled={preflight.status !== "ok" || !acknowledged || launching}
            >
              {launching ? (
                <>
                  <Loader2 className="mr-1 size-4 animate-spin" />
                  Opening exam window…
                </>
              ) : (
                "Start Exam"
              )}
            </Button>
          </div>

          {openedWindowOk === false ? (
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Popup blocker prevented opening a chromeless window. Continuing
              in this tab — please ignore browser chrome during the exam.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </section>
  )
}

function PreflightSummary({
  preflight,
  onRetry,
}: {
  preflight: PreflightState
  onRetry: () => void
}) {
  if (preflight.status === "checking") {
    return (
      <div className="flex items-center gap-2 rounded-md border border-border/60 bg-background/70 p-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Running pre-flight hardware checks…
      </div>
    )
  }

  if (preflight.status === "blocked") {
    return (
      <div className="rounded-md border border-rose-300/70 bg-rose-50/60 p-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
        <p className="mb-1 inline-flex items-center gap-1 font-medium">
          <Tv className="size-4" />
          Multi-monitor / extended display detected
        </p>
        <ul className="ml-5 list-disc text-rose-700/90 dark:text-rose-300/90">
          {preflight.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">
          Please disconnect any external displays and re-run the check.
        </p>
        <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
          Re-run check
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2 rounded-md border border-emerald-300/70 bg-emerald-50/60 p-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
      <p className="inline-flex items-center gap-1 font-medium">
        <CheckCircle2 className="size-4" />
        Hardware checks passed
      </p>
      <p className="text-xs text-muted-foreground">
        Screen {preflight.hardware.screenWidth}×{preflight.hardware.screenHeight}{" "}
        ({preflight.hardware.devicePixelRatio.toFixed(2)}x)
        {preflight.hardware.totalScreens
          ? ` • ${preflight.hardware.totalScreens} display${preflight.hardware.totalScreens === 1 ? "" : "s"}`
          : ""}
      </p>
      {preflight.hardware.suspiciousReasons.length ? (
        <p className="inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-300">
          <ShieldAlert className="size-3.5" />
          Soft warnings: {preflight.hardware.suspiciousReasons.join(" ")}
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        <AlertOctagon className="mr-1 inline size-3.5" />
        Note: browsers cannot detect every HDMI mirror — final integrity
        responsibility rests with the proctor.
      </p>
    </div>
  )
}
