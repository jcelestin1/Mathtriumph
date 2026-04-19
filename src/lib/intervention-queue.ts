export type InterventionQueueStatus = "assigned" | "completed"

export type InterventionQueueItem = {
  id: string
  createdAt: string
  updatedAt?: string
  completedAt?: string
  reportingCategory: string
  misconceptionTag: string
  errorType: string
  status: InterventionQueueStatus
  teacherNotes?: string
}

const INTERVENTION_QUEUE_KEY = "mathtriumph-intervention-queue"

function readQueue(): InterventionQueueItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(INTERVENTION_QUEUE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as InterventionQueueItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeQueue(queue: InterventionQueueItem[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(
    INTERVENTION_QUEUE_KEY,
    JSON.stringify(queue.slice(0, 250))
  )
}

export function getInterventionQueue() {
  return readQueue()
}

export function addInterventionQueueItem(
  payload: Omit<InterventionQueueItem, "id" | "createdAt" | "status">
) {
  const queue = readQueue()
  const item: InterventionQueueItem = {
    id: `iq-${Date.now()}-${Math.round(Math.random() * 10000)}`,
    createdAt: new Date().toISOString(),
    reportingCategory: payload.reportingCategory,
    misconceptionTag: payload.misconceptionTag,
    errorType: payload.errorType,
    status: "assigned",
    teacherNotes: payload.teacherNotes ?? "",
  }
  writeQueue([item, ...queue])
  return item
}

export function updateInterventionQueueStatus(
  id: string,
  status: InterventionQueueStatus
) {
  const now = new Date().toISOString()
  const queue = readQueue().map((item) =>
    item.id === id
      ? {
          ...item,
          status,
          updatedAt: now,
          completedAt: status === "completed" ? now : item.completedAt,
        }
      : item
  )
  writeQueue(queue)
}

export function updateInterventionQueueStatuses(
  ids: string[],
  status: InterventionQueueStatus
) {
  if (!ids.length) return
  const idSet = new Set(ids)
  const now = new Date().toISOString()
  const queue = readQueue().map((item) =>
    idSet.has(item.id)
      ? {
          ...item,
          status,
          updatedAt: now,
          completedAt: status === "completed" ? now : item.completedAt,
        }
      : item
  )
  writeQueue(queue)
}

export function updateInterventionQueueNotes(id: string, teacherNotes: string) {
  const now = new Date().toISOString()
  const queue = readQueue().map((item) =>
    item.id === id
      ? {
          ...item,
          teacherNotes,
          updatedAt: now,
        }
      : item
  )
  writeQueue(queue)
}
