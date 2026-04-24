export type ProctorSeverity = "low" | "medium" | "high"

export type ProctorEventType =
  | "heartbeat_focus_ok"
  | "heartbeat_focus_lost"
  | "heartbeat_visibility_hidden"
  | "penalty_triggered"
  | "reentry_submitted"
  | "hardware_warning"
  | "camera_snapshot"
  | "camera_permission_denied"
  | "camera_unavailable"

export type ProctorEvent = {
  id: string
  type: ProctorEventType
  severity: ProctorSeverity
  timestamp: string
  quizId?: string
  detail?: string
  metadata?: Record<string, unknown>
}

export type DisplayRiskResult = {
  multiMonitorDetected: boolean
  secondaryDisplayRisk: boolean
  reasons: string[]
}

type BrowserWindowLike = {
  devicePixelRatio: number
  screen: Screen & {
    isExtended?: boolean
    availLeft?: number
    availTop?: number
  }
}

export function detectDisplayRisk(browserWindow: BrowserWindowLike): DisplayRiskResult {
  const reasons: string[] = []
  const screen = browserWindow.screen
  const dpr = browserWindow.devicePixelRatio
  const isExtended = Boolean(screen.isExtended)
  const ultraWideDesktop = screen.width >= 3000 || screen.availWidth >= 3000
  const offscreenWorkspace = (screen.availLeft ?? 0) < 0 || (screen.availTop ?? 0) < 0
  const suspiciousDpr = dpr < 1
  const likelyTvOrHdmi = screen.width > 2560 || suspiciousDpr

  if (isExtended) {
    reasons.push("Multiple displays reported by browser.")
  }
  if (ultraWideDesktop) {
    reasons.push("Desktop width looks unusually wide for single-monitor exam mode.")
  }
  if (offscreenWorkspace) {
    reasons.push("Display workspace offset suggests multiple monitor coordinates.")
  }
  if (screen.width > 2560) {
    reasons.push("Detected very wide screen footprint (possible HDMI/TV setup).")
  }
  if (suspiciousDpr) {
    reasons.push("Detected suspicious device pixel ratio below 1.")
  }

  return {
    multiMonitorDetected: isExtended || ultraWideDesktop || offscreenWorkspace,
    secondaryDisplayRisk: likelyTvOrHdmi,
    reasons,
  }
}

export function getPenaltyDurationMs(severity: ProctorSeverity) {
  if (severity === "high") return 5 * 60 * 1000
  if (severity === "medium") return 4 * 60 * 1000
  return 3 * 60 * 1000
}

export function determinePenaltySeverity(
  violationKind: "focus_lost" | "tab_hidden",
  violationCount: number
): ProctorSeverity {
  if (violationKind === "tab_hidden" || violationCount >= 3) return "high"
  if (violationCount >= 2) return "medium"
  return "low"
}

export function formatPenaltyClock(msRemaining: number) {
  const clamped = Math.max(0, msRemaining)
  const minutes = Math.floor(clamped / 60_000)
  const seconds = Math.floor((clamped % 60_000) / 1000)
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export function runWhenIdle(task: () => void, timeout = 1_500) {
  const globalScope = globalThis as typeof globalThis & {
    requestIdleCallback?: (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions
    ) => number
  }
  if (typeof globalScope.requestIdleCallback === "function") {
    globalScope.requestIdleCallback(() => task(), { timeout })
    return
  }
  setTimeout(task, 0)
}
