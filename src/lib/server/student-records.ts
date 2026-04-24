import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import type { QuizAttempt } from "@/lib/quiz-engine"
import { decryptJson, encryptJson } from "@/lib/security/encryption"

type StoredRecord = {
  role: QuizAttempt["role"]
  attempts: QuizAttempt[]
}

type StoredProctorEvent = {
  id: string
  type: string
  severity: "low" | "medium" | "high"
  timestamp: string
  quizId?: string
  detail?: string
  metadata?: Record<string, unknown>
}

type StoreShape = {
  records: Record<string, StoredRecord>
  proctorEvents?: Record<string, StoredProctorEvent[]>
}

const DATA_DIR = path.join(process.cwd(), ".data")
const RECORDS_FILE = path.join(DATA_DIR, "student-records.enc")

async function readStore(): Promise<StoreShape> {
  try {
    const encrypted = await readFile(RECORDS_FILE, "utf8")
    const parsed = decryptJson<StoreShape>(encrypted)
    return {
      records: parsed.records ?? {},
      proctorEvents: parsed.proctorEvents ?? {},
    }
  } catch {
    return { records: {}, proctorEvents: {} }
  }
}

async function writeStore(store: StoreShape) {
  await mkdir(DATA_DIR, { recursive: true })
  const encrypted = encryptJson(store)
  await writeFile(RECORDS_FILE, encrypted, "utf8")
}

function userKey(districtId: string, userId: string) {
  return `${districtId}::${userId}`
}

export async function listUserAttempts(districtId: string, userId: string) {
  const store = await readStore()
  return store.records[userKey(districtId, userId)]?.attempts ?? []
}

export async function listDistrictAttempts(districtId: string) {
  const store = await readStore()
  return Object.entries(store.records)
    .filter(([key]) => key.startsWith(`${districtId}::`))
    .flatMap(([, record]) => record.attempts)
}

export async function upsertAttempt(
  districtId: string,
  userId: string,
  role: QuizAttempt["role"],
  attempt: QuizAttempt
) {
  const store = await readStore()
  const key = userKey(districtId, userId)
  const current = store.records[key] ?? { role, attempts: [] }
  current.role = role
  current.attempts = [attempt, ...current.attempts].slice(0, 300)
  store.records[key] = current
  await writeStore(store)
}

export async function updateAttemptReview(
  attemptId: string,
  payload: { status?: "pending" | "acknowledged" | "escalated"; notes?: string }
) {
  const store = await readStore()
  const now = new Date().toISOString()

  Object.values(store.records).forEach((record) => {
    record.attempts = record.attempts.map((attempt) =>
      attempt.attemptId === attemptId
        ? {
            ...attempt,
            integrityReview: {
              status: payload.status ?? attempt.integrityReview?.status ?? "pending",
              reviewedAt: now,
              notes: payload.notes ?? attempt.integrityReview?.notes ?? "",
            },
          }
        : attempt
    )
  })
  await writeStore(store)
}

export async function deleteUserAttempts(districtId: string, userId: string) {
  const store = await readStore()
  const key = userKey(districtId, userId)
  delete store.records[key]
  if (store.proctorEvents) {
    delete store.proctorEvents[key]
  }
  await writeStore(store)
}

export async function appendProctorEvents(
  districtId: string,
  userId: string,
  events: StoredProctorEvent[]
) {
  if (!events.length) return
  const store = await readStore()
  const key = userKey(districtId, userId)
  const existing = store.proctorEvents?.[key] ?? []
  const sanitized = events.slice(0, 120).map((event) => ({
    ...event,
    metadata:
      event.metadata && typeof event.metadata === "object"
        ? event.metadata
        : undefined,
  }))
  store.proctorEvents = {
    ...(store.proctorEvents ?? {}),
    [key]: [...sanitized, ...existing].slice(0, 2_000),
  }
  await writeStore(store)
}
