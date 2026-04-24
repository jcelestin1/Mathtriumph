/**
 * Exam Monitor Web Worker
 *
 * Runs off the main UI thread so that the 2-second integrity polling
 * never causes jank on the quiz surface. The main thread sends a
 * "start" message with configuration and the worker posts back
 * structured events whenever it detects a focus/visibility change,
 * a hardware anomaly, or a periodic heartbeat.
 *
 * Message protocol (main → worker):
 *   { type: "start", payload: { intervalMs: number } }
 *   { type: "stop" }
 *   { type: "tab_active" }  – main reports that focus was restored
 *
 * Message protocol (worker → main):
 *   { type: "heartbeat",        payload: HeartbeatPayload }
 *   { type: "focus_lost",       payload: { ts: number } }
 *   { type: "focus_restored",   payload: { ts: number, durationMs: number } }
 *   { type: "visibility_hidden",payload: { ts: number } }
 *   { type: "hw_warning",       payload: HwWarningPayload }
 */

let intervalId = null
let hwIntervalId = null
let focusLostAt = null
let heartbeatCount = 0

// ─── Helpers ──────────────────────────────────────────────────────────────────

function now() {
  return Date.now()
}

function post(type, payload) {
  self.postMessage({ type, payload: { ...payload, ts: now() } })
}

// ─── Main polling tick (runs every 2 s) ───────────────────────────────────────

function tick() {
  heartbeatCount += 1
  post("heartbeat", { count: heartbeatCount })
}

// ─── Hardware-warning check (runs every 30 s) ─────────────────────────────────
// Passed back from the main thread because window.screen is not accessible in
// a Worker; the main thread calls detectHardware() and sends the data here,
// but we also schedule a periodic reminder so the main thread re-runs the check.

function scheduleHwReminder() {
  hwIntervalId = setInterval(() => {
    post("hw_check_requested", {})
  }, 30_000)
}

// ─── Message handler ──────────────────────────────────────────────────────────

self.addEventListener("message", (event) => {
  const { type, payload } = event.data ?? {}

  switch (type) {
    case "start": {
      const intervalMs = payload?.intervalMs ?? 2000
      clearInterval(intervalId)
      clearInterval(hwIntervalId)
      heartbeatCount = 0
      focusLostAt = null
      intervalId = setInterval(tick, intervalMs)
      scheduleHwReminder()
      post("started", { intervalMs })
      break
    }

    case "stop": {
      clearInterval(intervalId)
      clearInterval(hwIntervalId)
      intervalId = null
      hwIntervalId = null
      post("stopped", {})
      break
    }

    case "focus_lost": {
      if (focusLostAt === null) {
        focusLostAt = now()
        post("focus_lost", {})
      }
      break
    }

    case "focus_restored": {
      if (focusLostAt !== null) {
        const durationMs = now() - focusLostAt
        focusLostAt = null
        post("focus_restored", { durationMs })
      }
      break
    }

    case "visibility_hidden": {
      if (focusLostAt === null) {
        focusLostAt = now()
      }
      post("visibility_hidden", {})
      break
    }

    default:
      break
  }
})
