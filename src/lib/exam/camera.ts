// Lightweight camera snapshot helper for proctored exams.
//
// Streaming raw video to a server is expensive and slow. Instead we capture
// a low-resolution still frame every 30-60s and ship a compressed Base64
// JPEG. The helper is opt-in: callers must explicitly request a stream and
// dispose of it when the exam ends.

export type CameraSession = {
  start: () => Promise<MediaStream | null>
  stop: () => void
  capture: (maxWidth?: number) => Promise<string | null>
  isActive: () => boolean
}

const DEFAULT_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    width: { ideal: 320, max: 480 },
    height: { ideal: 240, max: 360 },
    frameRate: { ideal: 5, max: 10 },
    facingMode: "user",
  },
  audio: false,
}

export function createCameraSession(): CameraSession {
  let stream: MediaStream | null = null
  let video: HTMLVideoElement | null = null
  let canvas: HTMLCanvasElement | null = null

  async function start() {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      return null
    }
    if (stream) return stream
    try {
      stream = await navigator.mediaDevices.getUserMedia(DEFAULT_CONSTRAINTS)
    } catch {
      stream = null
      return null
    }
    video = document.createElement("video")
    video.muted = true
    video.playsInline = true
    video.srcObject = stream
    try {
      await video.play()
    } catch {
      stop()
      return null
    }
    canvas = document.createElement("canvas")
    return stream
  }

  function stop() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }
    stream = null
    if (video) {
      video.srcObject = null
      video = null
    }
    canvas = null
  }

  async function capture(maxWidth = 240): Promise<string | null> {
    if (!stream || !video || !canvas) return null
    if (!video.videoWidth || !video.videoHeight) return null
    const ratio = video.videoHeight / video.videoWidth
    const width = Math.min(maxWidth, video.videoWidth)
    const height = Math.round(width * ratio)
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    ctx.drawImage(video, 0, 0, width, height)
    try {
      return canvas.toDataURL("image/jpeg", 0.55)
    } catch {
      return null
    }
  }

  function isActive() {
    return stream !== null
  }

  return { start, stop, capture, isActive }
}
