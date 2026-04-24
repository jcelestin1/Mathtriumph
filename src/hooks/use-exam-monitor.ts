"use client"

/**
 * useExamMonitor
 *
 * Manages the full lifecycle of the high-security exam-monitoring layer:
 *
 *  - Spawns a Web Worker that posts a 2-second heartbeat off the main thread.
 *  - Bridges document.hasFocus() / visibilityState changes into the worker.
 *  - Derives a `MonitorState` that drives the UI lock-screen, penalty timer,
 *    hardware-warning modal, and batched API logging.
 *  - Runs a hardware-detection check at start and every 30 seconds thereafter
 *    (triggered by worker "hw_check_requested" events).
 *  - Debounces / batches all API event writes so we never fire more than one
 *    request per 10-second window.
 *
 * Designed to be drop-in: wrap <QuizEngineClient> with <ExamMonitorShell>,
 * which calls this hook and renders the appropriate overlay.
 */

import { useCallback, useEffect, useRef, useState } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

export type MonitorPhase =
  | "idle"           // exam has not started yet
  | "active"         // exam is running, student has focus
  | "penalty"        // student tabbed out – exam is blurred, penalty running
  | "hw_warning"     // hardware anomaly detected during active phase

export type HardwareWarning =
  | "secondary_display"   // screen wider than 2560 or pixelRatio < 1
  | "tv_hdmi"             // very wide display (≥ 3840) or very low DPR
  | null

export type MonitorEvent =
  | { kind: "focus_lost";       ts: number }
  | { kind: "focus_restored";   ts: number; durationMs: number }
  | { kind: "visibility_hidden"; ts: number }
  | { kind: "hw_warning";       ts: number; warning: HardwareWarning }
  | { kind: "heartbeat";        ts: number; count: number }

export type ReentryState = {
  justification: string
  cooldownEndsAt: number  // epoch ms when Submit becomes enabled
  submitAllowed: boolean
}

export type MonitorState = {
  phase: MonitorPhase
  hwWarning: HardwareWarning
  penaltyEndsAt: number | null   // epoch ms
  reentry: ReentryState
  events: MonitorEvent[]
  heartbeatCount: number
  focusLossCount: number
}

type UseExamMonitorOptions = {
  /** Called once per batched batch of events for persistence. */
  onBatchLog?: (events: MonitorEvent[]) => void
  /** How long (ms) the blur penalty window lasts – variable per severity. */
  penaltyDurationMs?: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BATCH_FLUSH_MS = 10_000   // debounce API writes to once per 10 s
const MIN_PENALTY_MS = 3 * 60 * 1000  // 3 minutes
const MAX_PENALTY_MS = 5 * 60 * 1000  // 5 minutes

// ─── Hardware detection (runs on main thread only) ────────────────────────────

function detectHardwareWarning(): HardwareWarning {
  if (typeof window === "undefined") return null
  const { screen, devicePixelRatio } = window

  // Very large display (4K+ or TV/projector) or subunit pixel ratio hints at a
  // mirrored HDMI output rendered at the source resolution.
  if (screen.width >= 3840 || devicePixelRatio < 0.9) return "tv_hdmi"

  // Wide-gamut monitor, dual-monitor span, or ultrawide past 2560 px.
  if (screen.width > 2560 || devicePixelRatio < 1) return "secondary_display"

  return null
}

// ─── Penalty duration heuristic ──────────────────────────────────────────────

function calcPenaltyMs(focusLossCount: number, absenceDurationMs: number): number {
  // Heavier absence or repeat offenders get closer to 5-minute max.
  const severityScore =
    Math.min(1, absenceDurationMs / 60_000) * 0.6 +
    Math.min(1, (focusLossCount - 1) / 4) * 0.4

  return Math.round(
    MIN_PENALTY_MS + severityScore * (MAX_PENALTY_MS - MIN_PENALTY_MS)
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useExamMonitor(options: UseExamMonitorOptions = {}) {
  const { onBatchLog } = options

  const workerRef = useRef<Worker | null>(null)
  const batchRef = useRef<MonitorEvent[]>([])
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hwCheckPendingRef = useRef(false)

  const [state, setState] = useState<MonitorState>({
    phase: "idle",
    hwWarning: null,
    penaltyEndsAt: null,
    reentry: { justification: "", cooldownEndsAt: 0, submitAllowed: false },
    events: [],
    heartbeatCount: 0,
    focusLossCount: 0,
  })

  // ── Batch / debounce API writes ─────────────────────────────────────────────

  const queueEvent = useCallback(
    (event: MonitorEvent) => {
      batchRef.current.push(event)

      if (batchTimerRef.current) return  // already scheduled

      batchTimerRef.current = setTimeout(() => {
        const batch = [...batchRef.current]
        batchRef.current = []
        batchTimerRef.current = null
        onBatchLog?.(batch)
      }, BATCH_FLUSH_MS)
    },
    [onBatchLog]
  )

  // ── Hardware warning check ───────────────────────────────────────────────────

  const runHardwareCheck = useCallback(() => {
    const warning = detectHardwareWarning()
    if (warning) {
      const event: MonitorEvent = { kind: "hw_warning", ts: Date.now(), warning }
      queueEvent(event)
      setState((prev) => ({
        ...prev,
        hwWarning: warning,
        events: [...prev.events, event],
        // Transition to hw_warning only if currently active (don't override penalty).
        phase: prev.phase === "active" ? "hw_warning" : prev.phase,
      }))
    }
  }, [queueEvent])

  // ── Worker message handler ───────────────────────────────────────────────────

  const handleWorkerMessage = useCallback(
    (evt: MessageEvent<{ type: string; payload: Record<string, unknown> }>) => {
      const { type, payload } = evt.data

      switch (type) {
        case "heartbeat": {
          const event: MonitorEvent = {
            kind: "heartbeat",
            ts: payload.ts as number,
            count: payload.count as number,
          }
          queueEvent(event)
          setState((prev) => ({
            ...prev,
            heartbeatCount: payload.count as number,
            events: [...prev.events, event],
          }))
          break
        }

        case "focus_lost": {
          const event: MonitorEvent = { kind: "focus_lost", ts: payload.ts as number }
          queueEvent(event)
          setState((prev) => {
            if (prev.phase !== "active") return prev
            const newCount = prev.focusLossCount + 1
            const penaltyMs = calcPenaltyMs(newCount, 0)
            const cooldownEndsAt = Date.now() + penaltyMs
            return {
              ...prev,
              phase: "penalty",
              penaltyEndsAt: cooldownEndsAt,
              focusLossCount: newCount,
              reentry: {
                justification: "",
                cooldownEndsAt,
                submitAllowed: false,
              },
              events: [...prev.events, event],
            }
          })
          break
        }

        case "focus_restored": {
          const durationMs = payload.durationMs as number
          const event: MonitorEvent = {
            kind: "focus_restored",
            ts: payload.ts as number,
            durationMs,
          }
          queueEvent(event)
          // Update penalty duration with actual absence length.
          setState((prev) => {
            if (prev.phase !== "penalty") return { ...prev, events: [...prev.events, event] }
            const penaltyMs = calcPenaltyMs(prev.focusLossCount, durationMs)
            const cooldownEndsAt = Date.now() + penaltyMs
            return {
              ...prev,
              penaltyEndsAt: cooldownEndsAt,
              reentry: {
                ...prev.reentry,
                cooldownEndsAt,
                submitAllowed: false,
              },
              events: [...prev.events, event],
            }
          })
          break
        }

        case "visibility_hidden": {
          const event: MonitorEvent = {
            kind: "visibility_hidden",
            ts: payload.ts as number,
          }
          queueEvent(event)
          setState((prev) => {
            if (prev.phase !== "active") return { ...prev, events: [...prev.events, event] }
            const newCount = prev.focusLossCount + 1
            const penaltyMs = calcPenaltyMs(newCount, 0)
            const cooldownEndsAt = Date.now() + penaltyMs
            return {
              ...prev,
              phase: "penalty",
              penaltyEndsAt: cooldownEndsAt,
              focusLossCount: newCount,
              reentry: {
                justification: "",
                cooldownEndsAt,
                submitAllowed: false,
              },
              events: [...prev.events, event],
            }
          })
          break
        }

        case "hw_check_requested": {
          if (!hwCheckPendingRef.current) {
            hwCheckPendingRef.current = true
            // Use requestIdleCallback so it only runs when browser isn't busy.
            if (typeof requestIdleCallback !== "undefined") {
              requestIdleCallback(
                () => {
                  hwCheckPendingRef.current = false
                  runHardwareCheck()
                },
                { timeout: 5000 }
              )
            } else {
              setTimeout(() => {
                hwCheckPendingRef.current = false
                runHardwareCheck()
              }, 0)
            }
          }
          break
        }

        default:
          break
      }
    },
    [queueEvent, runHardwareCheck]
  )

  // ── Start / stop ─────────────────────────────────────────────────────────────

  const startMonitoring = useCallback(() => {
    if (workerRef.current) return  // already running

    const worker = new Worker("/exam-monitor.worker.js")
    worker.addEventListener("message", handleWorkerMessage)
    workerRef.current = worker
    worker.postMessage({ type: "start", payload: { intervalMs: 2000 } })

    setState((prev) => ({ ...prev, phase: "active" }))

    // Initial hardware check via requestIdleCallback.
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(() => runHardwareCheck(), { timeout: 3000 })
    } else {
      setTimeout(runHardwareCheck, 500)
    }
  }, [handleWorkerMessage, runHardwareCheck])

  const stopMonitoring = useCallback(() => {
    workerRef.current?.postMessage({ type: "stop" })
    workerRef.current?.terminate()
    workerRef.current = null

    // Flush remaining batch immediately on stop.
    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current)
      batchTimerRef.current = null
    }
    if (batchRef.current.length > 0) {
      onBatchLog?.([...batchRef.current])
      batchRef.current = []
    }

    setState((prev) => ({ ...prev, phase: "idle" }))
  }, [onBatchLog])

  // ── DOM focus / visibility listeners ─────────────────────────────────────────

  useEffect(() => {
    function onBlur() {
      workerRef.current?.postMessage({ type: "focus_lost" })
    }
    function onFocus() {
      workerRef.current?.postMessage({ type: "focus_restored" })
    }
    function onVisibility() {
      if (document.visibilityState === "hidden") {
        workerRef.current?.postMessage({ type: "visibility_hidden" })
      } else {
        workerRef.current?.postMessage({ type: "focus_restored" })
      }
    }

    window.addEventListener("blur", onBlur)
    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      window.removeEventListener("blur", onBlur)
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  // ── Penalty countdown tick (uses requestAnimationFrame to stay in sync) ──────

  useEffect(() => {
    if (state.phase !== "penalty") return

    let rafId: number

    function tick() {
      const now = Date.now()
      setState((prev) => {
        if (prev.phase !== "penalty" || prev.penaltyEndsAt === null) return prev
        const remaining = prev.penaltyEndsAt - now
        if (remaining <= 0) {
          return {
            ...prev,
            reentry: { ...prev.reentry, submitAllowed: true },
          }
        }
        return prev
      })
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [state.phase])

  // ── Cleanup on unmount ───────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      stopMonitoring()
      if (batchTimerRef.current) clearTimeout(batchTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Reentry actions ──────────────────────────────────────────────────────────

  const submitReentry = useCallback(() => {
    setState((prev) => {
      if (!prev.reentry.submitAllowed) return prev
      if (prev.reentry.justification.trim().length < 10) return prev
      return {
        ...prev,
        phase: "active",
        penaltyEndsAt: null,
        hwWarning: null,
      }
    })
  }, [])

  const setJustification = useCallback((text: string) => {
    setState((prev) => ({
      ...prev,
      reentry: { ...prev.reentry, justification: text },
    }))
  }, [])

  const dismissHwWarning = useCallback(() => {
    setState((prev) => ({
      ...prev,
      hwWarning: null,
      phase: prev.phase === "hw_warning" ? "active" : prev.phase,
    }))
  }, [])

  return {
    state,
    startMonitoring,
    stopMonitoring,
    submitReentry,
    setJustification,
    dismissHwWarning,
  }
}
