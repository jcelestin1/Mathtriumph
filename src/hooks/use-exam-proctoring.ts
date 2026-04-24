"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  detectDisplayRisk,
  determinePenaltySeverity,
  formatPenaltyClock,
  getPenaltyDurationMs,
  runWhenIdle,
  type ProctorEvent,
  type ProctorSeverity,
} from "@/lib/proctoring"

type ViolationKind = "focus_lost" | "tab_hidden"

type UseExamProctoringOptions = {
  quizId: string
  enabled: boolean
}

type UseExamProctoringResult = {
  isLocked: boolean
  justification: string
  setJustification: (value: string) => void
  canSubmitReentry: boolean
  penaltyTimerLabel: string
  penaltySeverity: ProctorSeverity
  warningReasons: string[]
  showHardwareModal: boolean
  acknowledgeHardwareModal: () => void
  submitReentry: () => void
  proctorEvents: ProctorEvent[]
}

type WorkerMessage =
  | { type: "request-status" }
  | {
      type: "heartbeat"
      payload: { hasFocus: boolean; visibilityState: "hidden" | "visible" | "prerender" }
    }

const HARDWARE_RECHECK_MS = 30_000
const CAMERA_SNAPSHOT_MS = 45_000
const HEARTBEAT_MS = 2_000

function buildProctorEvent(
  type: ProctorEvent["type"],
  severity: ProctorSeverity,
  quizId: string,
  detail?: string,
  metadata?: Record<string, unknown>
): ProctorEvent {
  return {
    id: `${type}-${Date.now()}-${Math.round(Math.random() * 100_000)}`,
    type,
    severity,
    timestamp: new Date().toISOString(),
    quizId,
    detail,
    metadata,
  }
}

export function useExamProctoring({
  quizId,
  enabled,
}: UseExamProctoringOptions): UseExamProctoringResult {
  const [isLocked, setIsLocked] = useState(false)
  const [showHardwareModal, setShowHardwareModal] = useState(false)
  const [warningReasons, setWarningReasons] = useState<string[]>([])
  const [justification, setJustification] = useState("")
  const [penaltyUntil, setPenaltyUntil] = useState(0)
  const [penaltySeverity, setPenaltySeverity] = useState<ProctorSeverity>("low")
  const [proctorEvents, setProctorEvents] = useState<ProctorEvent[]>([])
  const [reentryBlocked, setReentryBlocked] = useState(true)
  const [clockNow, setClockNow] = useState(() => Date.now())

  const flushTimeoutRef = useRef<number | null>(null)
  const queueRef = useRef<ProctorEvent[]>([])
  const heartbeatWorkerRef = useRef<Worker | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const violationCounterRef = useRef(0)
  const lastHealthyHeartbeatLogAtRef = useRef(0)
  const reentryTimeoutRef = useRef<number | null>(null)

  const canSubmitReentry = useMemo(
    () => !reentryBlocked && justification.trim().length >= 20,
    [justification, reentryBlocked]
  )

  const penaltyTimerLabel = useMemo(
    () => formatPenaltyClock(Math.max(0, penaltyUntil - clockNow)),
    [clockNow, penaltyUntil]
  )

  const enqueueEvent = useCallback((event: ProctorEvent) => {
    setProctorEvents((prev) => [event, ...prev].slice(0, 200))
    queueRef.current = [event, ...queueRef.current].slice(0, 300)
    if (flushTimeoutRef.current !== null) {
      window.clearTimeout(flushTimeoutRef.current)
    }
    flushTimeoutRef.current = window.setTimeout(() => {
      const batch = queueRef.current.splice(0, 50)
      if (!batch.length) return
      void fetch("/api/student-records/proctor-events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ events: batch }),
      })
    }, 1_200)
  }, [])

  const applyPenalty = useCallback((kind: ViolationKind) => {
    violationCounterRef.current += 1
    const severity = determinePenaltySeverity(kind, violationCounterRef.current)
    setPenaltySeverity(severity)
    const durationMs = getPenaltyDurationMs(severity)
    setPenaltyUntil(Date.now() + durationMs)
    setIsLocked(true)
    setReentryBlocked(true)
    setJustification("")
    if (reentryTimeoutRef.current !== null) {
      window.clearTimeout(reentryTimeoutRef.current)
    }
    reentryTimeoutRef.current = window.setTimeout(() => setReentryBlocked(false), durationMs)
    enqueueEvent(
      buildProctorEvent(
        "penalty_triggered",
        severity,
        quizId,
        kind === "tab_hidden" ? "Document visibility changed to hidden." : "Window focus lost.",
        { violationCount: violationCounterRef.current, durationMs }
      )
    )
  }, [enqueueEvent, quizId])

  const submitReentry = useCallback(() => {
    if (!canSubmitReentry) return
    const currentPenalty = penaltySeverity
    setIsLocked(false)
    setJustification("")
    enqueueEvent(
      buildProctorEvent(
        "reentry_submitted",
        currentPenalty,
        quizId,
        "Student submitted re-entry justification.",
        { justificationLength: justification.trim().length }
      )
    )
  }, [canSubmitReentry, enqueueEvent, justification, penaltySeverity, quizId])

  const acknowledgeHardwareModal = useCallback(() => {
    setShowHardwareModal(false)
  }, [])

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return

    const risk = detectDisplayRisk(window)
    if (risk.secondaryDisplayRisk || risk.multiMonitorDetected) {
      window.setTimeout(() => {
        setWarningReasons(risk.reasons)
        setShowHardwareModal(true)
        enqueueEvent(
          buildProctorEvent(
            "hardware_warning",
            risk.multiMonitorDetected ? "high" : "medium",
            quizId,
            "Potential HDMI/TV or multi-monitor setup detected.",
            {
              screenWidth: window.screen.width,
              devicePixelRatio: window.devicePixelRatio,
              reasons: risk.reasons,
            }
          )
        )
      }, 0)
    }

    const checkInterval = window.setInterval(() => {
      const nextRisk = detectDisplayRisk(window)
      if (nextRisk.secondaryDisplayRisk || nextRisk.multiMonitorDetected) {
        setWarningReasons(nextRisk.reasons)
        setShowHardwareModal(true)
        enqueueEvent(
          buildProctorEvent(
            "hardware_warning",
            nextRisk.multiMonitorDetected ? "high" : "medium",
            quizId,
            "Periodic hardware scan detected secondary display risk.",
            { reasons: nextRisk.reasons }
          )
        )
      }
    }, HARDWARE_RECHECK_MS)

    return () => window.clearInterval(checkInterval)
  }, [enabled, enqueueEvent, quizId])

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        applyPenalty("tab_hidden")
      }
    }
    const onBlur = () => applyPenalty("focus_lost")
    document.addEventListener("visibilitychange", onVisibilityChange)
    window.addEventListener("blur", onBlur)

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange)
      window.removeEventListener("blur", onBlur)
    }
  }, [applyPenalty, enabled])

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return
    document.body.classList.toggle("exam-secure-locked", isLocked)
    return () => {
      document.body.classList.remove("exam-secure-locked")
    }
  }, [enabled, isLocked])

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return
    if (!isLocked) return
    const timer = window.setInterval(() => {
      setClockNow(Date.now())
    }, 1_000)
    return () => window.clearInterval(timer)
  }, [enabled, isLocked])

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return

    const worker = new Worker(
      new URL("../workers/proctor-heartbeat.worker.ts", import.meta.url),
      { type: "module" }
    )
    heartbeatWorkerRef.current = worker
    worker.postMessage({ type: "start", intervalMs: HEARTBEAT_MS })

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data
      if (!message || typeof message !== "object") return
      if (message.type === "request-status") {
        worker.postMessage({
          type: "status",
          payload: {
            hasFocus: document.hasFocus(),
            visibilityState: document.visibilityState,
          },
        })
        return
      }
      if (message.type === "heartbeat") {
        if (!message.payload.hasFocus) {
          enqueueEvent(
            buildProctorEvent("heartbeat_focus_lost", "medium", quizId, "Heartbeat detected focus loss.")
          )
        } else if (message.payload.visibilityState === "hidden") {
          enqueueEvent(
            buildProctorEvent("heartbeat_visibility_hidden", "high", quizId, "Heartbeat detected hidden tab.")
          )
        } else {
          const now = Date.now()
          if (now - lastHealthyHeartbeatLogAtRef.current >= 30_000) {
            lastHealthyHeartbeatLogAtRef.current = now
            enqueueEvent(buildProctorEvent("heartbeat_focus_ok", "low", quizId))
          }
        }
      }
    }

    return () => {
      worker.postMessage({ type: "stop" })
      worker.terminate()
      heartbeatWorkerRef.current = null
    }
  }, [enabled, enqueueEvent, quizId])

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return
    let cancelled = false
    let snapshotTimer: number | null = null
    if (!navigator.mediaDevices?.getUserMedia) {
      runWhenIdle(() => {
        enqueueEvent(
          buildProctorEvent(
            "camera_unavailable",
            "medium",
            quizId,
            "Camera APIs are unavailable in this browser context."
          )
        )
      })
      return
    }

    void navigator.mediaDevices
      .getUserMedia({ video: { width: 320, height: 180 }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        const video = document.createElement("video")
        video.muted = true
        video.playsInline = true
        video.srcObject = stream
        void video.play().catch(() => {})
        videoRef.current = video

        snapshotTimer = window.setInterval(() => {
          runWhenIdle(() => {
            if (!videoRef.current) return
            const canvas = document.createElement("canvas")
            canvas.width = 160
            canvas.height = 90
            const context = canvas.getContext("2d")
            if (!context) return
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
            const snapshot = canvas.toDataURL("image/jpeg", 0.45)
            enqueueEvent(
              buildProctorEvent(
                "camera_snapshot",
                "low",
                quizId,
                "Low-res proctoring snapshot captured.",
                { imagePreview: snapshot.slice(0, 200), length: snapshot.length }
              )
            )
          })
        }, CAMERA_SNAPSHOT_MS)
      })
      .catch((error: unknown) => {
        const detail = error instanceof Error ? error.message : "Unknown camera error"
        enqueueEvent(
          buildProctorEvent("camera_permission_denied", "high", quizId, detail)
        )
      })

    return () => {
      cancelled = true
      if (snapshotTimer !== null) {
        window.clearInterval(snapshotTimer)
      }
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      videoRef.current = null
    }
  }, [enabled, enqueueEvent, quizId])

  useEffect(() => {
    return () => {
      if (flushTimeoutRef.current !== null) {
        window.clearTimeout(flushTimeoutRef.current)
      }
      if (reentryTimeoutRef.current !== null) {
        window.clearTimeout(reentryTimeoutRef.current)
      }
      const batch = queueRef.current.splice(0, 80)
      if (batch.length && typeof navigator !== "undefined") {
        const body = JSON.stringify({ events: batch })
        if ("sendBeacon" in navigator) {
          const blob = new Blob([body], { type: "application/json" })
          navigator.sendBeacon("/api/student-records/proctor-events", blob)
        } else {
          void fetch("/api/student-records/proctor-events", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body,
            keepalive: true,
          })
        }
      }
    }
  }, [])

  return {
    isLocked,
    justification,
    setJustification,
    canSubmitReentry,
    penaltyTimerLabel,
    penaltySeverity,
    warningReasons,
    showHardwareModal,
    acknowledgeHardwareModal,
    submitReentry,
    proctorEvents,
  }
}
