"use client"

/**
 * ExamMonitorShell
 *
 * Wraps the quiz surface with the full security monitoring layer:
 *
 * ┌─────────────────────────────────────────────┐
 * │  (active)   → quiz content, no overlay      │
 * │  (penalty)  → blurred content + lock panel  │
 * │  (hw_warn)  → hardware warning modal        │
 * │  (idle)     → pass-through (pre-start)      │
 * └─────────────────────────────────────────────┘
 *
 * CSS-only blur is GPU-accelerated; no DOM removal/re-insertion.
 * Camera snapshots are captured at 30-second intervals and sent as
 * small Base64 strings via the batched monitor event API.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { AlertTriangle, Camera, EyeOff, Lock, MonitorOff, ShieldAlert } from "lucide-react"

import { useExamMonitor, type MonitorEvent } from "@/hooks/use-exam-monitor"
import { Button } from "@/components/ui/button"

// ─── Camera helpers ────────────────────────────────────────────────────────────

const CAMERA_SNAPSHOT_INTERVAL_MS = 30_000
const SNAPSHOT_WIDTH = 320   // low-res to keep payload tiny
const SNAPSHOT_HEIGHT = 240

async function captureSnapshot(
  videoEl: HTMLVideoElement,
  canvas: HTMLCanvasElement
): Promise<string | null> {
  try {
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    ctx.drawImage(videoEl, 0, 0, SNAPSHOT_WIDTH, SNAPSHOT_HEIGHT)
    return canvas.toDataURL("image/jpeg", 0.5)
  } catch {
    return null
  }
}

// ─── Penalty countdown display ─────────────────────────────────────────────────

function formatCountdown(endsAt: number): string {
  const remainingMs = Math.max(0, endsAt - Date.now())
  const totalSec = Math.ceil(remainingMs / 1000)
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
}

// ─── Props ────────────────────────────────────────────────────────────────────

type ExamMonitorShellProps = {
  children: React.ReactNode
  /** True once the exam session is active (e.g. student clicked "Start"). */
  active: boolean
  quizId: string
  userId?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ExamMonitorShell({
  children,
  active,
  quizId,
  userId,
}: ExamMonitorShellProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)
  const cameraIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [cameraError, setCameraError] = useState(false)
  const [tickMs, setTickMs] = useState(0)

  // ── Batch API logger ──────────────────────────────────────────────────────────

  const handleBatchLog = useCallback(
    async (events: MonitorEvent[]) => {
      try {
        await fetch("/api/exam/monitor-events", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ quizId, userId, events }),
        })
      } catch {
        // Intentionally silent; integrity events are best-effort client side.
      }
    },
    [quizId, userId]
  )

  const { state, startMonitoring, stopMonitoring, submitReentry, setJustification, dismissHwWarning } =
    useExamMonitor({ onBatchLog: handleBatchLog })

  // ── Start / stop monitoring in lock-step with exam activity ──────────────────

  useEffect(() => {
    if (active) {
      startMonitoring()
    } else {
      stopMonitoring()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  // ── Camera: request once when exam goes active ────────────────────────────────

  useEffect(() => {
    if (!active) {
      cameraStreamRef.current?.getTracks().forEach((t) => t.stop())
      cameraStreamRef.current = null
      if (cameraIntervalRef.current) clearInterval(cameraIntervalRef.current)
      return
    }

    navigator.mediaDevices
      ?.getUserMedia({ video: { width: SNAPSHOT_WIDTH, height: SNAPSHOT_HEIGHT }, audio: false })
      .then((stream) => {
        cameraStreamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => undefined)
        }
        setCameraError(false)

        const canvas = canvasRef.current ?? document.createElement("canvas")
        canvas.width = SNAPSHOT_WIDTH
        canvas.height = SNAPSHOT_HEIGHT
        canvasRef.current = canvas

        cameraIntervalRef.current = setInterval(async () => {
          if (!videoRef.current) return
          const dataUrl = await captureSnapshot(videoRef.current, canvas)
          if (!dataUrl) return
          // Send snapshot as a lightweight batch-appended event.
          try {
            await fetch("/api/exam/monitor-events", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                quizId,
                userId,
                events: [{ kind: "camera_snapshot", ts: Date.now(), dataUrl }],
              }),
            })
          } catch {
            // best-effort
          }
        }, CAMERA_SNAPSHOT_INTERVAL_MS)
      })
      .catch(() => {
        setCameraError(true)
      })

    return () => {
      cameraStreamRef.current?.getTracks().forEach((t) => t.stop())
      cameraStreamRef.current = null
      if (cameraIntervalRef.current) clearInterval(cameraIntervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  // ── Countdown ticker ─────────────────────────────────────────────────────────
  // Tick every 500 ms to re-derive the countdown string from penaltyEndsAt.
  // Using a numeric tick avoids calling setState inside an effect body.

  useEffect(() => {
    if (state.phase !== "penalty" || state.penaltyEndsAt === null) return
    const id = setInterval(() => setTickMs(Date.now()), 500)
    return () => clearInterval(id)
  }, [state.phase, state.penaltyEndsAt])

  // tickMs is read here so the component re-renders on each 500 ms tick.
  const countdown =
    state.phase === "penalty" && state.penaltyEndsAt !== null && tickMs >= 0
      ? formatCountdown(state.penaltyEndsAt)
      : ""

  // ── Derived flags ─────────────────────────────────────────────────────────────

  const isBlurred = state.phase === "penalty"
  const showHwModal = Boolean(state.hwWarning) && state.phase === "hw_warning"

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="exam-monitor-root relative">
      {/* Hidden video element for camera snapshot capture; no captions needed */}
      <video ref={videoRef} className="hidden" playsInline muted aria-hidden="true" />

      {/* Quiz content – CSS blur keeps GPU compositing on a single layer */}
      <div className={isBlurred ? "exam-content-blurred" : undefined}>
        {children}
      </div>

      {/* ── Penalty Lock Screen ─────────────────────────────────────────────── */}
      {isBlurred && (
        <div
          className="exam-lockscreen"
          role="dialog"
          aria-modal="true"
          aria-label="Exam session suspended"
        >
          <div className="exam-lockscreen-panel">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <Lock className="size-8" aria-hidden />
              <div>
                <p className="text-xl font-semibold">Session Suspended</p>
                <p className="text-sm text-muted-foreground">
                  Focus was lost during the exam. The test content is hidden.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-1 text-sm text-muted-foreground">
              <p className="inline-flex items-center gap-2">
                <EyeOff className="size-4" aria-hidden />
                Tab-out #{state.focusLossCount} detected
              </p>
              {countdown ? (
                <p className="text-center text-3xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
                  {countdown}
                </p>
              ) : null}
              <p className="text-center text-xs text-muted-foreground">
                Time remaining before re-entry is allowed
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <label htmlFor="em-justification" className="block text-sm font-medium">
                Explain why you left the exam tab:
              </label>
              <textarea
                id="em-justification"
                rows={4}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="Describe what happened (minimum 10 characters required)…"
                value={state.reentry.justification}
                onChange={(e) => setJustification(e.target.value)}
              />
            </div>

            <Button
              className="mt-4 w-full"
              variant="destructive"
              disabled={
                !state.reentry.submitAllowed ||
                state.reentry.justification.trim().length < 10
              }
              onClick={submitReentry}
            >
              {state.reentry.submitAllowed
                ? "Submit Justification & Resume"
                : `Wait ${countdown || "…"} before resuming`}
            </Button>

            <p className="mt-2 text-center text-xs text-muted-foreground">
              This event has been logged. Multiple violations will be escalated to your teacher.
            </p>
          </div>
        </div>
      )}

      {/* ── Hardware Warning Modal ──────────────────────────────────────────── */}
      {showHwModal && (
        <div
          className="exam-lockscreen"
          role="dialog"
          aria-modal="true"
          aria-label="Hardware warning"
        >
          <div className="exam-lockscreen-panel">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <MonitorOff className="size-8" aria-hidden />
              <div>
                <p className="text-xl font-semibold">You aren&apos;t slick.</p>
                <p className="text-sm text-muted-foreground">
                  {state.hwWarning === "tv_hdmi"
                    ? "A large-screen or HDMI output was detected."
                    : "A secondary or unusually wide display was detected."}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Exams must be taken on your primary monitor without external displays. Please unplug
              any HDMI cables, TVs, or secondary monitors and then continue.
            </p>

            <div className="mt-4 rounded-md border border-amber-300/60 bg-amber-50/60 p-3 text-sm dark:bg-amber-500/10">
              <p className="font-medium text-amber-800 dark:text-amber-300">
                <AlertTriangle className="mr-1 inline size-4" aria-hidden />
                This event has been logged.
              </p>
              <p className="mt-1 text-muted-foreground">
                Detected: screen width {window.screen.width}px, DPR{" "}
                {window.devicePixelRatio.toFixed(2)}
              </p>
            </div>

            <Button
              className="mt-4 w-full"
              variant="outline"
              onClick={dismissHwWarning}
            >
              I&apos;ve unplugged the secondary display — continue
            </Button>
          </div>
        </div>
      )}

      {/* ── Camera status badge ─────────────────────────────────────────────── */}
      {active && (
        <div
          className="exam-camera-badge"
          title={cameraError ? "Camera unavailable" : "Camera active"}
          aria-label={cameraError ? "Camera unavailable" : "Camera monitoring active"}
        >
          {cameraError ? (
            <ShieldAlert className="size-3 text-rose-500" aria-hidden />
          ) : (
            <Camera className="size-3 text-emerald-500" aria-hidden />
          )}
          <span className="text-[10px] font-medium">
            {cameraError ? "No cam" : "Monitored"}
          </span>
        </div>
      )}

      {/* ── Active session badge ─────────────────────────────────────────────── */}
      {active && state.phase === "active" && (
        <div className="exam-session-badge" aria-label="Session active">
          <ShieldAlert className="size-3 text-teal-600" aria-hidden />
          <span className="text-[10px] font-medium text-teal-700 dark:text-teal-400">
            Session Active
          </span>
        </div>
      )}
    </div>
  )
}
