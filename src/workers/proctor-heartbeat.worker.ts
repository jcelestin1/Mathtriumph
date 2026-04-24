export type HeartbeatWorkerMessage =
  | { type: "start"; intervalMs?: number }
  | { type: "stop" }
  | {
      type: "status"
      payload: { hasFocus: boolean; visibilityState: "hidden" | "visible" | "prerender" }
    }

let timerId: number | null = null
let intervalMs = 2_000

function stopHeartbeat() {
  if (timerId !== null) {
    self.clearInterval(timerId)
    timerId = null
  }
}

function startHeartbeat(nextIntervalMs: number) {
  stopHeartbeat()
  intervalMs = Math.max(500, nextIntervalMs)
  timerId = self.setInterval(() => {
    self.postMessage({
      type: "request-status",
      timestamp: Date.now(),
    })
  }, intervalMs)
}

self.onmessage = (event: MessageEvent<HeartbeatWorkerMessage>) => {
  const message = event.data
  if (!message || typeof message !== "object") return

  if (message.type === "start") {
    startHeartbeat(message.intervalMs ?? intervalMs)
    return
  }

  if (message.type === "stop") {
    stopHeartbeat()
    return
  }

  if (message.type === "status") {
    self.postMessage({
      type: "heartbeat",
      timestamp: Date.now(),
      payload: message.payload,
    })
  }
}

