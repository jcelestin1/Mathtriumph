export const HEARTBEAT_INTERVAL_MS = 2_000
export const HARDWARE_SCAN_INTERVAL_MS = 30_000
export const CAMERA_SNAPSHOT_INTERVAL_MS = 45_000

export type ProctoringSeverity = "low" | "medium" | "high"

export type ProctoringEventType =
  | "heartbeat"
  | "focus_lost"
  | "focus_restored"
  | "reentry_requested"
  | "reentry_submitted"
  | "hardware_warning"
  | "launch_blocked"
  | "camera_ready"
  | "camera_blocked"
  | "camera_snapshot"

export type ProctoringEvent = {
  type: ProctoringEventType
  timestamp: string
  detail: string
  severity?: ProctoringSeverity
  metadata?: Record<string, string | number | boolean | null>
}

export type ProctoringSummary = {
  sessionId: string
  quizId: string
  focusLossCount: number
  reEntryCount: number
  hardwareWarnings: string[]
  snapshotCount: number
  maxSeverity: ProctoringSeverity
}

export type HardwareAssessment = {
  hasExtendedDisplay: boolean
  shouldBlockStart: boolean
  shouldWarn: boolean
  reasons: string[]
  raw: {
    devicePixelRatio: number
    screenWidth: number
    availWidth: number
    screenCount: number | null
    isExtended: boolean | null
  }
}

type ScreenDetailsResult = {
  screens?: Screen[]
}

type WindowWithScreenDetails = Window & {
  getScreenDetails?: () => Promise<ScreenDetailsResult>
}

type ExtendedScreen = Screen & {
  isExtended?: boolean
}

export function mergeSeverity(
  current: ProctoringSeverity,
  next: ProctoringSeverity
): ProctoringSeverity {
  const weight = { low: 1, medium: 2, high: 3 }
  return weight[next] > weight[current] ? next : current
}

export function getPenaltyForFocusLoss(input: {
  wasHidden: boolean
  awayDurationMs: number
  priorIncidents: number
}) {
  let score = 0

  if (input.wasHidden) score += 2
  if (input.awayDurationMs >= 15_000) score += 1
  if (input.awayDurationMs >= 30_000) score += 1
  if (input.priorIncidents >= 1) score += 1
  if (input.priorIncidents >= 3) score += 1

  if (score >= 4) {
    return {
      severity: "high" as const,
      durationMs: 5 * 60 * 1_000,
      label: "5 minute lockout",
    }
  }

  if (score >= 2) {
    return {
      severity: "medium" as const,
      durationMs: 4 * 60 * 1_000,
      label: "4 minute lockout",
    }
  }

  return {
    severity: "low" as const,
    durationMs: 3 * 60 * 1_000,
    label: "3 minute lockout",
  }
}

export async function detectHardwareRisk(win: Window): Promise<HardwareAssessment> {
  const extendedScreen = win.screen as ExtendedScreen
  const reasons: string[] = []

  let screenCount: number | null = null
  let isExtended: boolean | null = null

  if (typeof extendedScreen.isExtended === "boolean") {
    isExtended = extendedScreen.isExtended
  }

  const windowWithDetails = win as WindowWithScreenDetails
  if (typeof windowWithDetails.getScreenDetails === "function") {
    try {
      const details = await windowWithDetails.getScreenDetails()
      if (Array.isArray(details.screens)) {
        screenCount = details.screens.length
      }
    } catch {
      screenCount = null
    }
  }

  const screenWidth = win.screen.width
  const availWidth = win.screen.availWidth
  const devicePixelRatio = win.devicePixelRatio || 1
  const hasExtendedDisplay = isExtended === true || (screenCount !== null && screenCount > 1)
  const likelyTvOrHdmi = screenWidth > 2_560 || availWidth > 2_560 || devicePixelRatio < 1

  if (hasExtendedDisplay) {
    reasons.push("Multiple displays detected by the browser screen APIs.")
  }
  if (screenWidth > 2_560 || availWidth > 2_560) {
    reasons.push("Screen width exceeds the secure exam threshold.")
  }
  if (devicePixelRatio < 1) {
    reasons.push("Device pixel ratio suggests external scaling or TV mirroring.")
  }

  return {
    hasExtendedDisplay,
    shouldBlockStart: hasExtendedDisplay,
    shouldWarn: hasExtendedDisplay || likelyTvOrHdmi,
    reasons,
    raw: {
      devicePixelRatio,
      screenWidth,
      availWidth,
      screenCount,
      isExtended,
    },
  }
}

export function createHeartbeatWorker(intervalMs = HEARTBEAT_INTERVAL_MS) {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return null
  }

  const source = `
    let timer = null;
    self.onmessage = (event) => {
      const data = event.data || {};
      if (data.type === "start") {
        clearInterval(timer);
        timer = setInterval(() => {
          self.postMessage({ type: "tick", now: Date.now() });
        }, data.intervalMs || ${intervalMs});
      }
      if (data.type === "stop") {
        clearInterval(timer);
        timer = null;
        self.close();
      }
    };
  `

  const blob = new Blob([source], { type: "text/javascript" })
  const url = URL.createObjectURL(blob)
  const worker = new Worker(url)
  const dispose = () => URL.revokeObjectURL(url)

  return {
    worker,
    dispose,
  }
}

export function scheduleIdleTask(callback: () => void) {
  if (typeof window === "undefined") return () => undefined

  const idleWindow = window as Window & {
    requestIdleCallback?: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions
    ) => number
    cancelIdleCallback?: (handle: number) => void
  }

  if (typeof idleWindow.requestIdleCallback === "function") {
    const id = idleWindow.requestIdleCallback(() => callback(), { timeout: 1_500 })
    return () => idleWindow.cancelIdleCallback?.(id)
  }

  const id = window.setTimeout(callback, 250)
  return () => window.clearTimeout(id)
}

export function formatDurationLabel(durationMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(durationMs / 1_000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}
