"use client"

export const EXAM_SESSION_STORAGE_KEY = "mathtriumph-secure-exam-session"

export type SecureExamSessionState = {
  status: "session-active"
  startedAt: string
  origin: "login" | "portal" | "quiz"
}

export function writeSecureExamSession(origin: SecureExamSessionState["origin"]) {
  if (typeof window === "undefined") return

  const payload: SecureExamSessionState = {
    status: "session-active",
    startedAt: new Date().toISOString(),
    origin,
  }

  window.localStorage.setItem(EXAM_SESSION_STORAGE_KEY, JSON.stringify(payload))
  window.sessionStorage.setItem(EXAM_SESSION_STORAGE_KEY, JSON.stringify(payload))
}

export function readSecureExamSession(): SecureExamSessionState | null {
  if (typeof window === "undefined") return null

  const raw =
    window.sessionStorage.getItem(EXAM_SESSION_STORAGE_KEY) ??
    window.localStorage.getItem(EXAM_SESSION_STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as SecureExamSessionState
  } catch {
    return null
  }
}

export function clearSecureExamSession() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(EXAM_SESSION_STORAGE_KEY)
  window.sessionStorage.removeItem(EXAM_SESSION_STORAGE_KEY)
}

export function launchSecureExamWindow(url: string) {
  if (typeof window === "undefined") {
    return { opened: false }
  }

  writeSecureExamSession("login")
  const openedWindow = window.open(
    url,
    "_blank",
    "popup=yes,noopener,noreferrer,toolbar=no,location=no,status=no,menubar=no"
  )

  if (openedWindow) {
    openedWindow.focus()
    return { opened: true }
  }

  return { opened: false }
}
