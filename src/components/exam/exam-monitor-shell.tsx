"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  AlertOctagon,
  EyeOff,
  Lock,
  ShieldCheck,
  ShieldX,
  Tv,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  classifyPenalty,
  createEventDispatcher,
  detectMultiMonitor,
  formatLockoutCountdown,
  inspectHardware,
  scheduleIdle,
  type ExamEvent,
  type HardwareCheckResult,
  type PenaltySeverity,
} from "@/lib/exam/monitor"
import { createCameraSession } from "@/lib/exam/camera"

type Props = {
  attemptId: string
  quizId: string
  quizTitle: string
  enableCameraSnapshots?: boolean
  cameraIntervalMs?: number
  hardwareRecheckMs?: number
  children: React.ReactNode
}

type WorkerTickPayload = {
  type: "tick"
  timestamp: number
  hasFocus: boolean
  visibilityState: "visible" | "hidden" | "prerender"
  consecutiveLostFocusTicks: number
  consecutiveHiddenTicks: number
}

type LockdownState = {
  active: boolean
  severity: PenaltySeverity
  lockoutMs: number
  lockedUntil: number
  reason: string
  remainingMs: number
  justification: string
  acknowledged: boolean
}

const INITIAL_LOCKDOWN: LockdownState = {
  active: false,
  severity: "low",
  lockoutMs: 0,
  lockedUntil: 0,
  reason: "",
  remainingMs: 0,
  justification: "",
  acknowledged: false,
}

const MIN_JUSTIFICATION_LEN = 25

export function ExamMonitorShell({
  attemptId,
  quizId,
  quizTitle,
  enableCameraSnapshots = false,
  cameraIntervalMs = 45_000,
  hardwareRecheckMs = 30_000,
  children,
}: Props) {
  const [lockdown, setLockdown] = useState<LockdownState>(INITIAL_LOCKDOWN)
  const [hardwareWarning, setHardwareWarning] = useState<HardwareCheckResult | null>(null)
  const [showHardwareModal, setShowHardwareModal] = useState(false)
  const [penaltyCount, setPenaltyCount] = useState(0)
  const [focusLost, setFocusLost] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)

  const workerRef = useRef<Worker | null>(null)
  const dispatcherRef = useRef<ReturnType<typeof createEventDispatcher> | null>(null)
  const cameraRef = useRef<ReturnType<typeof createCameraSession> | null>(null)
  const penaltyCountRef = useRef(0)
  const lockdownRef = useRef<LockdownState>(INITIAL_LOCKDOWN)
  const focusLostRef = useRef(false)

  useEffect(() => {
    lockdownRef.current = lockdown
  }, [lockdown])

  const dispatch = useCallback((event: Omit<ExamEvent, "attemptId" | "quizId" | "timestamp">) => {
    dispatcherRef.current?.enqueue({
      ...event,
      attemptId,
      quizId,
      timestamp: Date.now(),
    })
  }, [attemptId, quizId])

  const sendConfigToWorker = useCallback(() => {
    if (typeof document === "undefined") return
    workerRef.current?.postMessage({
      type: "config",
      hasFocus: document.hasFocus(),
      visibilityState: document.visibilityState,
      examActive: !lockdownRef.current.active,
    })
  }, [])

  useEffect(() => {
    dispatcherRef.current = createEventDispatcher({})
    return () => {
      dispatcherRef.current?.flush()
      dispatcherRef.current?.destroy()
      dispatcherRef.current = null
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    let worker: Worker
    try {
      worker = new Worker(
        new URL("../../lib/exam/heartbeat.worker.ts", import.meta.url),
        { type: "module" }
      )
    } catch {
      return
    }
    workerRef.current = worker

    worker.onmessage = (event: MessageEvent<WorkerTickPayload>) => {
      const data = event.data
      if (data.type !== "tick") return
      // Heartbeat samples are intentionally low-severity and dropped from
      // the security audit log unless aggregated upstream.
      dispatch({
        type: "heartbeat",
        severity: "low",
        metadata: {
          hasFocus: data.hasFocus,
          visibilityState: data.visibilityState,
          consecutiveLostFocusTicks: data.consecutiveLostFocusTicks,
          consecutiveHiddenTicks: data.consecutiveHiddenTicks,
        },
      })

      if ((!data.hasFocus || data.visibilityState !== "visible") && !lockdownRef.current.active) {
        const worstTicks = Math.max(
          data.consecutiveLostFocusTicks,
          data.consecutiveHiddenTicks
        )
        if (worstTicks >= 2) {
          const penalty = classifyPenalty({
            consecutiveLostFocusTicks: data.consecutiveLostFocusTicks,
            consecutiveHiddenTicks: data.consecutiveHiddenTicks,
            priorPenaltyCount: penaltyCountRef.current,
          })
          const next: LockdownState = {
            active: true,
            severity: penalty.severity,
            lockoutMs: penalty.lockoutMs,
            lockedUntil: Date.now() + penalty.lockoutMs,
            remainingMs: penalty.lockoutMs,
            reason: penalty.reason,
            justification: "",
            acknowledged: false,
          }
          setLockdown(next)
          lockdownRef.current = next
          penaltyCountRef.current += 1
          setPenaltyCount(penaltyCountRef.current)
          dispatch({
            type: "lockdown_engaged",
            severity: penalty.severity,
            detail: penalty.reason,
            metadata: { lockoutMs: penalty.lockoutMs, penaltyCount: penaltyCountRef.current },
          })
          worker.postMessage({ type: "config", hasFocus: false, visibilityState: data.visibilityState, examActive: false })
        }
      }
    }

    worker.postMessage({ type: "start", intervalMs: 2000 })
    sendConfigToWorker()
    dispatch({ type: "exam_started", severity: "low" })

    return () => {
      worker.postMessage({ type: "stop" })
      worker.terminate()
      workerRef.current = null
    }
  }, [dispatch, sendConfigToWorker])

  // Wire up native focus/visibility listeners so the worker has fresh state
  // immediately rather than waiting up to 2s for its next tick.
  useEffect(() => {
    if (typeof window === "undefined") return
    function onFocusChange() {
      const hasFocus = document.hasFocus()
      focusLostRef.current = !hasFocus
      setFocusLost(!hasFocus)
      dispatch({
        type: hasFocus ? "focus_restored" : "focus_lost",
        severity: hasFocus ? "low" : "medium",
      })
      sendConfigToWorker()
    }
    function onVisibility() {
      const visible = document.visibilityState === "visible"
      dispatch({
        type: visible ? "visibility_visible" : "visibility_hidden",
        severity: visible ? "low" : "medium",
      })
      sendConfigToWorker()
    }
    window.addEventListener("focus", onFocusChange)
    window.addEventListener("blur", onFocusChange)
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      window.removeEventListener("focus", onFocusChange)
      window.removeEventListener("blur", onFocusChange)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [dispatch, sendConfigToWorker])

  // Single hardware check at mount, then a low-frequency idle re-check.
  useEffect(() => {
    if (typeof window === "undefined") return

    let cancelled = false
    let intervalId: number | null = null
    let cancelIdle: () => void = () => {}

    function runHardwareCheck() {
      cancelIdle = scheduleIdle(async () => {
        const hardware = inspectHardware()
        const multi = await detectMultiMonitor()
        if (cancelled) return
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
        if (merged.suspiciousReasons.length || merged.isMultiMonitor) {
          setHardwareWarning(merged)
          setShowHardwareModal(true)
          dispatch({
            type: "hardware_warning",
            severity: merged.isMultiMonitor ? "high" : "medium",
            detail: merged.suspiciousReasons.join(" "),
            metadata: {
              screenWidth: merged.screenWidth,
              screenHeight: merged.screenHeight,
              dpr: merged.devicePixelRatio,
              totalScreens: merged.totalScreens,
            },
          })
        }
      }, 1500)
    }

    runHardwareCheck()
    intervalId = window.setInterval(runHardwareCheck, hardwareRecheckMs)

    return () => {
      cancelled = true
      cancelIdle()
      if (intervalId !== null) window.clearInterval(intervalId)
    }
  }, [dispatch, hardwareRecheckMs])

  // Optional camera snapshot loop: a single low-res JPEG every interval.
  useEffect(() => {
    if (!enableCameraSnapshots || typeof window === "undefined") return

    let cancelled = false
    const session = createCameraSession()
    cameraRef.current = session

    let intervalId: number | null = null

    void session.start().then((stream) => {
      if (cancelled) {
        session.stop()
        return
      }
      if (!stream) return
      setCameraReady(true)
      intervalId = window.setInterval(async () => {
        const snapshot = await session.capture(240)
        if (snapshot) {
          dispatch({
            type: "camera_snapshot",
            severity: "low",
            metadata: { sizeChars: snapshot.length, mime: "image/jpeg" },
          })
        }
      }, cameraIntervalMs)
    })

    return () => {
      cancelled = true
      if (intervalId !== null) window.clearInterval(intervalId)
      session.stop()
      cameraRef.current = null
      setCameraReady(false)
    }
  }, [cameraIntervalMs, dispatch, enableCameraSnapshots])

  // Lockdown countdown ticker. We update once a second only — the actual
  // re-entry button is gated by a setTimeout below, this is purely for UI.
  useEffect(() => {
    if (!lockdown.active) return
    const interval = window.setInterval(() => {
      setLockdown((prev) => {
        if (!prev.active) return prev
        const remainingMs = Math.max(0, prev.lockedUntil - Date.now())
        return { ...prev, remainingMs }
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [lockdown.active])

  // setTimeout fallback that flips `acknowledged` once the lockout window
  // elapses. The button is then enabled by both states being true.
  useEffect(() => {
    if (!lockdown.active) return
    const timeoutId = window.setTimeout(() => {
      setLockdown((prev) => (prev.active ? { ...prev, acknowledged: true } : prev))
    }, lockdown.lockoutMs)
    return () => window.clearTimeout(timeoutId)
  }, [lockdown.active, lockdown.lockoutMs])

  const canSubmitReentry =
    lockdown.active &&
    lockdown.acknowledged &&
    lockdown.remainingMs <= 0 &&
    lockdown.justification.trim().length >= MIN_JUSTIFICATION_LEN

  function onSubmitReentry() {
    if (!canSubmitReentry) return
    dispatch({
      type: "penalty_acknowledged",
      severity: lockdown.severity === "high" ? "high" : "medium",
      detail: lockdown.justification.trim().slice(0, 480),
      metadata: { severity: lockdown.severity, lockoutMs: lockdown.lockoutMs },
    })
    dispatch({
      type: "lockdown_lifted",
      severity: "low",
      detail: lockdown.reason,
    })
    setLockdown(INITIAL_LOCKDOWN)
    lockdownRef.current = INITIAL_LOCKDOWN
    sendConfigToWorker()
  }

  const lockdownClass = useMemo(() => {
    if (!lockdown.active) return ""
    return "exam-lockdown"
  }, [lockdown.active])

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge className="bg-emerald-600 text-white">
          <ShieldCheck className="mr-1 size-3.5" />
          Proctored Exam Mode
        </Badge>
        <Badge variant="outline" className="border-teal-300/70 text-teal-700 dark:text-teal-300">
          {quizTitle}
        </Badge>
        {focusLost ? (
          <Badge variant="outline" className="border-amber-400/70 text-amber-700 dark:text-amber-300">
            <EyeOff className="mr-1 size-3.5" />
            Focus lost
          </Badge>
        ) : null}
        {cameraReady ? (
          <Badge variant="outline" className="border-sky-400/70 text-sky-700 dark:text-sky-300">
            Camera snapshots active
          </Badge>
        ) : null}
        {penaltyCount > 0 ? (
          <Badge variant="outline" className="border-rose-400/70 text-rose-700 dark:text-rose-300">
            <ShieldX className="mr-1 size-3.5" />
            Penalties: {penaltyCount}
          </Badge>
        ) : null}
      </div>

      {/*
        We toggle a single CSS class on the wrapper (not on the body) so the
        blur is GPU-accelerated and we never have to remove/re-add the quiz
        DOM. `aria-hidden` and `inert` (where supported) prevent keyboard
        access while the lockdown is active.
      */}
      <div
        className={`relative ${lockdownClass}`}
        aria-hidden={lockdown.active || undefined}
        inert={lockdown.active}
      >
        {children}
      </div>

      {lockdown.active ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-sm p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="exam-penalty-title"
        >
          <div className="w-full max-w-lg rounded-xl border border-rose-300/70 bg-card p-5 shadow-xl">
            <div className="mb-3 flex items-center gap-2">
              <Lock className="size-5 text-rose-600" />
              <h2 id="exam-penalty-title" className="text-lg font-semibold">
                Exam Locked — Re-entry Required
              </h2>
            </div>
            <p className="mb-2 text-sm text-muted-foreground">
              {lockdown.reason} This was logged as a{" "}
              <strong>{lockdown.severity}</strong> severity event.
            </p>
            <p className="mb-3 text-sm">
              The Submit Re-entry button will unlock in{" "}
              <span className="font-mono text-base font-semibold text-rose-600">
                {formatLockoutCountdown(lockdown.remainingMs)}
              </span>
              .
            </p>
            <label className="mb-1 block text-sm font-medium" htmlFor="exam-justification">
              Justification (required, {MIN_JUSTIFICATION_LEN}+ characters)
            </label>
            <textarea
              id="exam-justification"
              value={lockdown.justification}
              onChange={(event) =>
                setLockdown((prev) => ({ ...prev, justification: event.target.value }))
              }
              rows={4}
              className="mb-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="Briefly explain what happened (e.g. notification popup, accidental tab switch). Your proctor will review this."
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                {lockdown.justification.trim().length}/{MIN_JUSTIFICATION_LEN}+ characters
              </span>
              <Button
                onClick={onSubmitReentry}
                disabled={!canSubmitReentry}
                variant={canSubmitReentry ? "default" : "outline"}
              >
                Submit Re-entry
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Dialog open={showHardwareModal} onOpenChange={setShowHardwareModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="inline-flex items-center gap-2 text-rose-600">
              <Tv className="size-5" />
              You aren&apos;t slick
            </DialogTitle>
            <DialogDescription>
              We detected hardware that&apos;s often used to mirror or extend the
              exam to a secondary screen. Please disconnect the additional
              display and continue on a single monitor.
            </DialogDescription>
          </DialogHeader>
          {hardwareWarning ? (
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              {hardwareWarning.suspiciousReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
              <li>
                Screen: {hardwareWarning.screenWidth}×{hardwareWarning.screenHeight}
                {" "}({hardwareWarning.devicePixelRatio.toFixed(2)}x DPR)
              </li>
            </ul>
          ) : null}
          <DialogFooter>
            <Button onClick={() => setShowHardwareModal(false)}>
              <AlertOctagon className="mr-1 size-4" />
              I understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
