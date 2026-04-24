// High-security exam monitoring helpers used by the proctored exam shell.
// All functions are framework-agnostic and side-effect free unless documented.

export type ExamEventType =
  | "heartbeat"
  | "focus_lost"
  | "focus_restored"
  | "visibility_hidden"
  | "visibility_visible"
  | "hardware_warning"
  | "lockdown_engaged"
  | "lockdown_lifted"
  | "penalty_assessed"
  | "penalty_acknowledged"
  | "fullscreen_exited"
  | "screen_change"
  | "exam_started"
  | "exam_completed"
  | "camera_snapshot"

export type ExamEvent = {
  type: ExamEventType
  attemptId: string
  quizId: string
  timestamp: number
  severity?: "low" | "medium" | "high"
  detail?: string
  metadata?: Record<string, unknown>
}

export type HardwareCheckResult = {
  totalScreens?: number
  isMultiMonitor: boolean
  screenWidth: number
  screenHeight: number
  devicePixelRatio: number
  innerWidth: number
  innerHeight: number
  suspiciousReasons: string[]
}

// Performs a synchronous hardware check using the basic screen API. Pure
// function over `window` so callers can compose with optional async multi-
// monitor checks (`detectMultiMonitor`).
export function inspectHardware(): HardwareCheckResult {
  const reasons: string[] = []
  const screenWidth = typeof window !== "undefined" ? window.screen.width : 0
  const screenHeight = typeof window !== "undefined" ? window.screen.height : 0
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1
  const innerWidth = typeof window !== "undefined" ? window.innerWidth : 0
  const innerHeight = typeof window !== "undefined" ? window.innerHeight : 0

  // Most common laptop / desktop monitors top out around 1440-2560px wide.
  // Widths beyond that often indicate an ultrawide or TV mirror.
  if (screenWidth > 2560) {
    reasons.push(
      `Screen width ${screenWidth}px exceeds 2560px — likely TV/ultrawide mirror.`
    )
  }
  // TVs commonly report devicePixelRatio < 1 due to upscaling.
  if (dpr < 1) {
    reasons.push(
      `devicePixelRatio ${dpr} is below 1 — likely projector/TV downscale.`
    )
  }
  // Aspect ratios near 16:9 with very large screens are TV-like; flag the combo.
  const aspect = screenHeight ? screenWidth / screenHeight : 0
  if (screenWidth >= 1920 && aspect > 2.0) {
    reasons.push(
      `Aspect ratio ${aspect.toFixed(2)} suggests stretched/extended display.`
    )
  }
  return {
    isMultiMonitor: false,
    screenWidth,
    screenHeight,
    devicePixelRatio: dpr,
    innerWidth,
    innerHeight,
    suspiciousReasons: reasons,
  }
}

type ScreenDetailsLike = {
  screens?: Array<unknown>
  addEventListener?: (
    name: string,
    handler: (event: Event) => void
  ) => void
}

// Detect potential multi-monitor setups using the modern Window Management
// API (Chrome 100+). Falls back to false when permission is denied or the
// API is missing — we never *block* in that case, only flag.
export async function detectMultiMonitor(): Promise<{
  isMultiMonitor: boolean
  totalScreens?: number
  permissionDenied?: boolean
}> {
  if (typeof window === "undefined") return { isMultiMonitor: false }
  const w = window as unknown as {
    getScreenDetails?: () => Promise<ScreenDetailsLike>
  }
  if (typeof w.getScreenDetails !== "function") {
    return { isMultiMonitor: false }
  }
  try {
    const details = await w.getScreenDetails()
    const total = Array.isArray(details.screens) ? details.screens.length : 1
    return { isMultiMonitor: total > 1, totalScreens: total }
  } catch {
    return { isMultiMonitor: false, permissionDenied: true }
  }
}

// Penalty windows are deterministic functions of severity. The exam shell uses
// `setTimeout` to disable the "Submit Re-entry" button for this duration. We
// intentionally bound the values so a single bug cannot lock a student out
// permanently.
const PENALTY_MS_BY_SEVERITY = {
  low: 3 * 60 * 1000,
  medium: 4 * 60 * 1000,
  high: 5 * 60 * 1000,
} as const

export type PenaltySeverity = keyof typeof PENALTY_MS_BY_SEVERITY

export function classifyPenalty(input: {
  consecutiveLostFocusTicks: number
  consecutiveHiddenTicks: number
  priorPenaltyCount: number
}): { severity: PenaltySeverity; lockoutMs: number; reason: string } {
  // Each "tick" represents 2s. 5 ticks (~10s) of being away is "low",
  // 15 ticks (~30s) is "medium", 30+ ticks (~60s) is "high". Repeat
  // offenders escalate one tier.
  const { consecutiveLostFocusTicks, consecutiveHiddenTicks, priorPenaltyCount } = input
  const worstTicks = Math.max(consecutiveLostFocusTicks, consecutiveHiddenTicks)

  let severity: PenaltySeverity = "low"
  if (worstTicks >= 30) severity = "high"
  else if (worstTicks >= 15) severity = "medium"

  if (priorPenaltyCount >= 2 && severity !== "high") {
    severity = severity === "low" ? "medium" : "high"
  }

  const reason =
    consecutiveHiddenTicks >= consecutiveLostFocusTicks
      ? `Tab/window was hidden for ~${worstTicks * 2}s.`
      : `Window lost focus for ~${worstTicks * 2}s.`

  return {
    severity,
    lockoutMs: PENALTY_MS_BY_SEVERITY[severity],
    reason,
  }
}

export function formatLockoutCountdown(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

// Batches events into a single network round-trip per `flushIntervalMs` to
// avoid hammering the database with sub-second writes during intense focus
// loss/restoration cycles. Uses sendBeacon on unload for reliability.
export type EventDispatcher = {
  enqueue: (event: ExamEvent) => void
  flush: () => Promise<void>
  destroy: () => void
}

const MAX_BATCH_SIZE = 50

export function createEventDispatcher(options: {
  endpoint?: string
  flushIntervalMs?: number
}): EventDispatcher {
  const endpoint = options.endpoint ?? "/api/exam/events"
  const flushInterval = options.flushIntervalMs ?? 5000

  let queue: ExamEvent[] = []
  let timer: ReturnType<typeof setTimeout> | null = null
  let destroyed = false

  function scheduleFlush() {
    if (destroyed || timer) return
    timer = setTimeout(() => {
      timer = null
      void flush()
    }, flushInterval)
  }

  async function flush() {
    if (!queue.length) return
    const batch = queue.splice(0, MAX_BATCH_SIZE)
    try {
      await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ events: batch }),
        keepalive: true,
      })
    } catch {
      // Non-fatal: re-queue head of batch so the next flush retries.
      queue = [...batch, ...queue]
    }
  }

  function enqueue(event: ExamEvent) {
    if (destroyed) return
    queue.push(event)
    // Flush immediately for high-severity events so reviewers see them ASAP.
    if (event.severity === "high" || event.type === "lockdown_engaged") {
      void flush()
      return
    }
    scheduleFlush()
  }

  function beaconFlush() {
    if (!queue.length) return
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([JSON.stringify({ events: queue })], {
        type: "application/json",
      })
      navigator.sendBeacon(endpoint, blob)
      queue = []
    } else {
      void flush()
    }
  }

  if (typeof window !== "undefined") {
    window.addEventListener("pagehide", beaconFlush)
    window.addEventListener("beforeunload", beaconFlush)
  }

  return {
    enqueue,
    flush,
    destroy() {
      destroyed = true
      if (timer) clearTimeout(timer)
      timer = null
      if (typeof window !== "undefined") {
        window.removeEventListener("pagehide", beaconFlush)
        window.removeEventListener("beforeunload", beaconFlush)
      }
    },
  }
}

// Schedule a callback during browser idle time, falling back to a short
// timeout so the work always runs. Used by the exam shell for
// non-time-critical work like re-checking hardware every 30s.
type IdleHandle = number
type RequestIdleCallback = (cb: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void, opts?: { timeout?: number }) => IdleHandle
type CancelIdleCallback = (handle: IdleHandle) => void

export function scheduleIdle(callback: () => void, timeoutMs = 1500) {
  if (typeof window === "undefined") return () => {}
  const w = window as unknown as {
    requestIdleCallback?: RequestIdleCallback
    cancelIdleCallback?: CancelIdleCallback
  }
  if (typeof w.requestIdleCallback === "function") {
    const handle = w.requestIdleCallback(() => callback(), { timeout: timeoutMs })
    return () => {
      if (typeof w.cancelIdleCallback === "function") w.cancelIdleCallback(handle)
    }
  }
  const handle = window.setTimeout(callback, Math.min(timeoutMs, 200))
  return () => window.clearTimeout(handle)
}
