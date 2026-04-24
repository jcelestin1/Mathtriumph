"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  CAMERA_SNAPSHOT_INTERVAL_MS,
  createHeartbeatWorker,
  detectHardwareRisk,
  formatDurationLabel,
  getPenaltyForFocusLoss,
  HARDWARE_SCAN_INTERVAL_MS,
  mergeSeverity,
  scheduleIdleTask,
  type ProctoringEvent,
  type ProctoringSeverity,
  type ProctoringSummary,
} from "@/lib/exam-security"
import { clearSecureExamSession, writeSecureExamSession } from "@/lib/secure-exam-session"
import { appendProctoringBatch } from "@/lib/quiz-storage"

type LockState = {
  status: "focus-lost" | "cooldown"
  severity: ProctoringSeverity
  message: string
  cooldownUntil?: number
  awayDurationMs?: number
  wasHidden?: boolean
}

type UseQuizProctoringOptions = {
  attemptId: string
  quizId: string
  secureMode: boolean
  isCompleted: boolean
}

type UseQuizProctoringResult = {
  secureMode: boolean
  lockState: LockState | null
  isLocked: boolean
  reentryJustification: string
  setReentryJustification: (value: string) => void
  canSubmitReentry: boolean
  cooldownLabel: string
  hardwareWarningOpen: boolean
  setHardwareWarningOpen: (open: boolean) => void
  hardwareWarningReasons: string[]
  proctoringSummary: ProctoringSummary
  cameraStatus: "idle" | "ready" | "blocked"
  totalEventCount: number
  submitReentry: () => Promise<boolean>
  flushPending: () => Promise<void>
  drainPendingBatch: () => ProctoringEvent[]
  getSnapshot: () => { events: ProctoringEvent[]; summary: ProctoringSummary }
}

export function useQuizProctoring({
  attemptId,
  quizId,
  secureMode,
  isCompleted,
}: UseQuizProctoringOptions): UseQuizProctoringResult {
  const [lockState, setLockState] = useState<LockState | null>(null)
  const [reentryJustification, setReentryJustification] = useState("")
  const [canSubmitReentry, setCanSubmitReentry] = useState(false)
  const [hardwareWarningOpen, setHardwareWarningOpen] = useState(false)
  const [hardwareWarningReasons, setHardwareWarningReasons] = useState<string[]>([])
  const [cameraStatus, setCameraStatus] = useState<"idle" | "ready" | "blocked">("idle")
  const [totalEventCount, setTotalEventCount] = useState(0)
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState(0)
  const [proctoringSummary, setProctoringSummary] = useState<ProctoringSummary>(() => ({
    sessionId: attemptId,
    quizId,
    focusLossCount: 0,
    reEntryCount: 0,
    hardwareWarnings: [],
    snapshotCount: 0,
    maxSeverity: "low",
  }))

  const allEventsRef = useRef<ProctoringEvent[]>([])
  const pendingBatchRef = useRef<ProctoringEvent[]>([])
  const summaryRef = useRef<ProctoringSummary>({
    sessionId: attemptId,
    quizId,
    focusLossCount: 0,
    reEntryCount: 0,
    hardwareWarnings: [],
    snapshotCount: 0,
    maxSeverity: "low",
  })
  const flushTimeoutRef = useRef<number | null>(null)
  const cancelIdleFlushRef = useRef<(() => void) | null>(null)
  const focusLossStartedAtRef = useRef<number | null>(null)
  const hiddenDuringLossRef = useRef(false)
  const cooldownTimeoutRef = useRef<number | null>(null)
  const lastHardwareSignatureRef = useRef("")
  const workerRef = useRef<Worker | null>(null)
  const disposeWorkerRef = useRef<(() => void) | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const isLocked = secureMode && !isCompleted && lockState !== null

  const updateSummary = useCallback(
    (updater: (prev: ProctoringSummary) => ProctoringSummary) => {
      setProctoringSummary((prev) => {
        const next = updater(prev)
        summaryRef.current = next
        return next
      })
    },
    []
  )

  const flushPending = useCallback(async () => {
    if (!secureMode || pendingBatchRef.current.length === 0) return
    const events = pendingBatchRef.current.splice(0, pendingBatchRef.current.length)
    await appendProctoringBatch({
      attemptId,
      quizId,
      events,
      summary: summaryRef.current,
    })
  }, [attemptId, quizId, secureMode])

  const scheduleFlush = useCallback(() => {
    if (!secureMode) return

    if (flushTimeoutRef.current !== null) {
      window.clearTimeout(flushTimeoutRef.current)
    }
    if (cancelIdleFlushRef.current) {
      cancelIdleFlushRef.current()
      cancelIdleFlushRef.current = null
    }

    cancelIdleFlushRef.current = scheduleIdleTask(() => {
      void flushPending()
    })
    flushTimeoutRef.current = window.setTimeout(() => {
      void flushPending()
    }, 5_000)
  }, [flushPending, secureMode])

  const recordEvent = useCallback(
    (
      event: Omit<ProctoringEvent, "timestamp">,
      onSummary?: (prev: ProctoringSummary) => ProctoringSummary
    ) => {
      const nextEvent: ProctoringEvent = {
        ...event,
        timestamp: new Date().toISOString(),
      }

      allEventsRef.current.push(nextEvent)
      pendingBatchRef.current.push(nextEvent)
      setTotalEventCount(allEventsRef.current.length)

      if (onSummary) {
        updateSummary(onSummary)
      }

      if (pendingBatchRef.current.length >= 6) {
        void flushPending()
      } else {
        scheduleFlush()
      }
    },
    [flushPending, scheduleFlush, updateSummary]
  )

  const onFocusRestored = useCallback(
    (now: number, hasFocus: boolean, isVisible: boolean) => {
      if (focusLossStartedAtRef.current === null) return

      const awayDurationMs = Math.max(0, now - focusLossStartedAtRef.current)
      const penalty = getPenaltyForFocusLoss({
        wasHidden: hiddenDuringLossRef.current,
        awayDurationMs,
        priorIncidents: summaryRef.current.focusLossCount,
      })
      const cooldownUntil = Date.now() + penalty.durationMs

      focusLossStartedAtRef.current = null
      setCanSubmitReentry(false)
      setReentryJustification("")
      setLockState({
        status: "cooldown",
        severity: penalty.severity,
        message: `Focus returned. ${penalty.label} required before re-entry approval.`,
        cooldownUntil,
        awayDurationMs,
        wasHidden: hiddenDuringLossRef.current,
      })
      hiddenDuringLossRef.current = false

      if (cooldownTimeoutRef.current !== null) {
        window.clearTimeout(cooldownTimeoutRef.current)
      }
      cooldownTimeoutRef.current = window.setTimeout(() => {
        setCanSubmitReentry(true)
      }, penalty.durationMs)

      recordEvent(
        {
          type: "focus_restored",
          detail: `Focus restored after ${Math.round(awayDurationMs / 1_000)}s away.`,
          severity: penalty.severity,
          metadata: {
            hasFocus,
            isVisible,
            awayDurationMs,
            wasHidden: hiddenDuringLossRef.current,
          },
        },
        (prev) => ({
          ...prev,
          focusLossCount: prev.focusLossCount + 1,
          maxSeverity: mergeSeverity(prev.maxSeverity, penalty.severity),
        })
      )
    },
    [recordEvent]
  )

  const submitReentry = useCallback(async () => {
    if (!lockState || lockState.status !== "cooldown") return false
    if (!canSubmitReentry || !reentryJustification.trim()) return false

    recordEvent(
      {
        type: "reentry_submitted",
        detail: "Student submitted secure re-entry justification.",
        severity: lockState.severity,
        metadata: {
          justificationLength: reentryJustification.trim().length,
          awayDurationMs: lockState.awayDurationMs ?? 0,
          wasHidden: Boolean(lockState.wasHidden),
        },
      },
      (prev) => ({
        ...prev,
        reEntryCount: prev.reEntryCount + 1,
        maxSeverity: mergeSeverity(prev.maxSeverity, lockState.severity),
      })
    )

    setLockState(null)
    setReentryJustification("")
    setCanSubmitReentry(false)
    return true
  }, [canSubmitReentry, lockState, recordEvent, reentryJustification])

  const getSnapshot = useCallback(
    () => ({
      events: allEventsRef.current.slice(-300),
      summary: summaryRef.current,
    }),
    []
  )

  const drainPendingBatch = useCallback(() => {
    return pendingBatchRef.current.splice(0, pendingBatchRef.current.length)
  }, [])

  useEffect(() => {
    if (!secureMode) return
    writeSecureExamSession("quiz")
    document.title = "Session Active | MathTriumph"
  }, [secureMode])

  useEffect(() => {
    document.body.classList.toggle("exam-lockdown-active", isLocked)
    return () => {
      document.body.classList.remove("exam-lockdown-active")
    }
  }, [isLocked])

  useEffect(() => {
    if (!lockState || lockState.status !== "cooldown" || !lockState.cooldownUntil) {
      return
    }

    const timer = window.setInterval(() => {
      setCooldownRemainingMs((current) => current + 1)
    }, 1_000)
    return () => window.clearInterval(timer)
  }, [lockState])
  const cooldownLabel = useMemo(
    () => formatDurationLabel(cooldownRemainingMs),
    [cooldownRemainingMs]
  )


  useEffect(() => {
    if (!secureMode || isCompleted) return

    const runHardwareCheck = async () => {
      const assessment = await detectHardwareRisk(window)
      if (!assessment.shouldWarn) return

      const signature = assessment.reasons.join("|")
      setHardwareWarningReasons(assessment.reasons)
      setHardwareWarningOpen(true)

      if (signature === lastHardwareSignatureRef.current) return
      lastHardwareSignatureRef.current = signature

      recordEvent(
        {
          type: "hardware_warning",
          detail: "Potential secondary display or HDMI setup detected.",
          severity: assessment.shouldBlockStart ? "high" : "medium",
          metadata: {
            devicePixelRatio: assessment.raw.devicePixelRatio,
            screenWidth: assessment.raw.screenWidth,
            availWidth: assessment.raw.availWidth,
            screenCount: assessment.raw.screenCount ?? "unknown",
            isExtended: assessment.raw.isExtended ?? "unknown",
          },
        },
        (prev) => ({
          ...prev,
          hardwareWarnings: Array.from(new Set([...prev.hardwareWarnings, ...assessment.reasons])),
          maxSeverity: mergeSeverity(
            prev.maxSeverity,
            assessment.shouldBlockStart ? "high" : "medium"
          ),
        })
      )
    }

    void runHardwareCheck()
    const timer = window.setInterval(() => {
      void runHardwareCheck()
    }, HARDWARE_SCAN_INTERVAL_MS)

    return () => window.clearInterval(timer)
  }, [isCompleted, recordEvent, secureMode])

  useEffect(() => {
    if (!secureMode || isCompleted) return

    const workerParts = createHeartbeatWorker()
    if (!workerParts) return

    workerRef.current = workerParts.worker
    disposeWorkerRef.current = workerParts.dispose

    workerParts.worker.onmessage = (message: MessageEvent<{ now?: number; type?: string }>) => {
      if (message.data?.type !== "tick") return

      const now = message.data.now ?? Date.now()
      const hasFocus = document.hasFocus()
      const isVisible = document.visibilityState === "visible"

      recordEvent({
        type: "heartbeat",
        detail: `Heartbeat: focus=${hasFocus ? "yes" : "no"} visibility=${document.visibilityState}.`,
        metadata: {
          hasFocus,
          isVisible,
          visibilityState: document.visibilityState,
        },
      })

      if (!hasFocus || !isVisible) {
        if (focusLossStartedAtRef.current === null) {
          focusLossStartedAtRef.current = now
          hiddenDuringLossRef.current = !isVisible
          setLockState({
            status: "focus-lost",
            severity: "medium",
            message: "Focus was lost. Return to this exam to begin the re-entry penalty timer.",
          })
          recordEvent({
            type: "focus_lost",
            detail: "Exam focus lost; blur lock applied.",
            severity: "medium",
            metadata: {
              hasFocus,
              isVisible,
              visibilityState: document.visibilityState,
            },
          })
        } else if (!isVisible) {
          hiddenDuringLossRef.current = true
        }
        return
      }

      onFocusRestored(now, hasFocus, isVisible)
    }

    workerParts.worker.postMessage({
      type: "start",
      intervalMs: 2_000,
    })

    return () => {
      workerRef.current?.postMessage({ type: "stop" })
      workerRef.current = null
      disposeWorkerRef.current?.()
      disposeWorkerRef.current = null
    }
  }, [isCompleted, onFocusRestored, recordEvent, secureMode])

  useEffect(() => {
    if (!secureMode || isCompleted || !navigator.mediaDevices?.getUserMedia) return

    let cancelled = false

    const captureSnapshot = () => {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || video.readyState < 2) return

      canvas.width = 160
      canvas.height = 90
      const context = canvas.getContext("2d")
      if (!context) return

      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      const snapshot = canvas.toDataURL("image/jpeg", 0.45)
      recordEvent(
        {
          type: "camera_snapshot",
          detail: "Low-resolution camera snapshot captured for review.",
          severity: "low",
          metadata: {
            snapshot,
            width: canvas.width,
            height: canvas.height,
          },
        },
        (prev) => ({
          ...prev,
          snapshotCount: prev.snapshotCount + 1,
        })
      )
    }

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 },
            height: { ideal: 180 },
            frameRate: { ideal: 5, max: 5 },
          },
          audio: false,
        })

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream
        const video = document.createElement("video")
        video.autoplay = true
        video.muted = true
        video.playsInline = true
        video.srcObject = stream
        await video.play().catch(() => undefined)
        videoRef.current = video
        canvasRef.current = document.createElement("canvas")
        setCameraStatus("ready")

        recordEvent({
          type: "camera_ready",
          detail: "Camera snapshot monitoring enabled.",
          severity: "low",
        })

        captureSnapshot()
        const timer = window.setInterval(captureSnapshot, CAMERA_SNAPSHOT_INTERVAL_MS)
        return () => window.clearInterval(timer)
      } catch {
        setCameraStatus("blocked")
        recordEvent({
          type: "camera_blocked",
          detail: "Camera access was blocked or unavailable.",
          severity: "medium",
        })
        return undefined
      }
    }

    let disposeInterval: (() => void) | undefined
    void startCamera().then((cleanup) => {
      disposeInterval = cleanup
    })

    return () => {
      cancelled = true
      disposeInterval?.()
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      videoRef.current = null
      canvasRef.current = null
    }
  }, [isCompleted, recordEvent, secureMode])

  useEffect(() => {
    if (!secureMode) return

    const handlePageHide = () => {
      void flushPending()
    }

    window.addEventListener("pagehide", handlePageHide)
    return () => {
      window.removeEventListener("pagehide", handlePageHide)
    }
  }, [flushPending, secureMode])

  useEffect(() => {
    if (!isCompleted) return

    void flushPending()
    clearSecureExamSession()
  }, [flushPending, isCompleted])

  useEffect(() => {
    return () => {
      if (flushTimeoutRef.current !== null) {
        window.clearTimeout(flushTimeoutRef.current)
      }
      if (cooldownTimeoutRef.current !== null) {
        window.clearTimeout(cooldownTimeoutRef.current)
      }
      cancelIdleFlushRef.current?.()
    }
  }, [])

  return useMemo(
    () => ({
      secureMode,
      lockState,
      isLocked,
      reentryJustification,
      setReentryJustification,
      canSubmitReentry,
      cooldownLabel,
      hardwareWarningOpen,
      setHardwareWarningOpen,
      hardwareWarningReasons,
      proctoringSummary,
      cameraStatus,
      totalEventCount,
      submitReentry,
      flushPending,
      drainPendingBatch,
      getSnapshot,
    }),
    [
      cameraStatus,
      canSubmitReentry,
      cooldownLabel,
      drainPendingBatch,
      flushPending,
      getSnapshot,
      hardwareWarningOpen,
      hardwareWarningReasons,
      isLocked,
      lockState,
      proctoringSummary,
      reentryJustification,
      secureMode,
      submitReentry,
      totalEventCount,
    ]
  )
}
