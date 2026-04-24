/// <reference lib="webworker" />

// Exam Monitoring Heartbeat Worker
//
// The worker keeps the 2-second cadence off the main thread so the student's
// typing/UI stays at a smooth 60fps. The host page posts {type: 'config'}
// messages with the latest focus/visibility state every time it changes,
// and the worker emits {type: 'tick'} messages on a fixed 2000ms cadence.

declare const self: DedicatedWorkerGlobalScope

type ConfigMessage = {
  type: "config"
  hasFocus: boolean
  visibilityState: "visible" | "hidden" | "prerender"
  examActive: boolean
  intervalMs?: number
}

type StartMessage = { type: "start"; intervalMs?: number }
type StopMessage = { type: "stop" }
type IncomingMessage = ConfigMessage | StartMessage | StopMessage

type TickPayload = {
  type: "tick"
  timestamp: number
  hasFocus: boolean
  visibilityState: "visible" | "hidden" | "prerender"
  consecutiveLostFocusTicks: number
  consecutiveHiddenTicks: number
}

let intervalMs = 2000
let timer: ReturnType<typeof setInterval> | null = null
let hasFocus = true
let visibilityState: "visible" | "hidden" | "prerender" = "visible"
let consecutiveLostFocusTicks = 0
let consecutiveHiddenTicks = 0
let examActive = false

function emitTick() {
  if (!examActive) return
  if (!hasFocus) consecutiveLostFocusTicks += 1
  else consecutiveLostFocusTicks = 0

  if (visibilityState !== "visible") consecutiveHiddenTicks += 1
  else consecutiveHiddenTicks = 0

  const payload: TickPayload = {
    type: "tick",
    timestamp: Date.now(),
    hasFocus,
    visibilityState,
    consecutiveLostFocusTicks,
    consecutiveHiddenTicks,
  }
  self.postMessage(payload)
}

function startTimer(nextIntervalMs?: number) {
  if (typeof nextIntervalMs === "number" && nextIntervalMs > 0) {
    intervalMs = nextIntervalMs
  }
  if (timer) clearInterval(timer)
  timer = setInterval(emitTick, intervalMs)
}

function stopTimer() {
  if (timer) clearInterval(timer)
  timer = null
}

self.onmessage = (event: MessageEvent<IncomingMessage>) => {
  const data = event.data
  switch (data.type) {
    case "config":
      hasFocus = data.hasFocus
      visibilityState = data.visibilityState
      examActive = data.examActive
      if (data.intervalMs && data.intervalMs !== intervalMs) {
        intervalMs = data.intervalMs
        if (timer) startTimer()
      }
      break
    case "start":
      examActive = true
      consecutiveLostFocusTicks = 0
      consecutiveHiddenTicks = 0
      startTimer(data.intervalMs)
      break
    case "stop":
      examActive = false
      stopTimer()
      break
  }
}

export {}
