import { appendFile, mkdir, readFile } from "node:fs/promises"
import { createHash } from "node:crypto"
import path from "node:path"

const DATA_DIR = path.join(process.cwd(), ".data")
const AUDIT_FILE = path.join(DATA_DIR, "security-audit.log")
const AUDIT_GENESIS_HASH = "GENESIS"

type AuditEventEntry = {
  timestamp: string
  sequence: number
  prevHash: string
  eventHash: string
} & Record<string, unknown>

let auditWriteQueue: Promise<void> = Promise.resolve()

function hashAuditPayload(payload: Record<string, unknown>) {
  return createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex")
}

function parseAuditLine(line: string): AuditEventEntry | null {
  try {
    return JSON.parse(line) as AuditEventEntry
  } catch {
    return null
  }
}

async function getAuditTailState() {
  try {
    const file = await readFile(AUDIT_FILE, "utf8")
    const lines = file.split("\n").filter((line) => line.trim().length > 0)
    if (!lines.length) {
      return { lastHash: AUDIT_GENESIS_HASH, lastSequence: 0 }
    }
    const last = parseAuditLine(lines[lines.length - 1])
    if (!last) {
      return { lastHash: AUDIT_GENESIS_HASH, lastSequence: 0 }
    }
    return {
      lastHash: typeof last.eventHash === "string" ? last.eventHash : AUDIT_GENESIS_HASH,
      lastSequence: typeof last.sequence === "number" ? last.sequence : 0,
    }
  } catch {
    return { lastHash: AUDIT_GENESIS_HASH, lastSequence: 0 }
  }
}

export async function logSecurityEvent(event: Record<string, unknown>) {
  auditWriteQueue = auditWriteQueue
    .then(async () => {
      try {
        await mkdir(DATA_DIR, { recursive: true })
        const { lastHash, lastSequence } = await getAuditTailState()
        const payload = {
          timestamp: new Date().toISOString(),
          sequence: lastSequence + 1,
          prevHash: lastHash,
          ...event,
        }
        const eventHash = hashAuditPayload(payload)
        const entry = {
          ...payload,
          eventHash,
        } as AuditEventEntry
        await appendFile(AUDIT_FILE, JSON.stringify(entry) + "\n", "utf8")
      } catch {
        // Intentionally ignore logging failures to avoid request failures.
      }
    })
    .catch(() => {})
}

type AiAuditSummary = {
  inferenceEventsLast24h: number
  requiresHumanReviewLast24h: number
  blockedIsolationAttemptsLast24h: number
  failedInferenceEventsLast24h: number
}

const EMPTY_AI_AUDIT_SUMMARY: AiAuditSummary = {
  inferenceEventsLast24h: 0,
  requiresHumanReviewLast24h: 0,
  blockedIsolationAttemptsLast24h: 0,
  failedInferenceEventsLast24h: 0,
}

export async function getAiAuditSummaryForDistrict(
  districtId: string
): Promise<AiAuditSummary> {
  try {
    const file = await readFile(AUDIT_FILE, "utf8")
    const now = Date.now()
    const cutoffMs = now - 24 * 60 * 60 * 1000
    const lines = file.trim().split("\n").slice(-2000)
    const summary = { ...EMPTY_AI_AUDIT_SUMMARY }

    for (const line of lines) {
      const parsed = parseAuditLine(line)
      if (!parsed) continue

      const timestamp = typeof parsed.timestamp === "string" ? Date.parse(parsed.timestamp) : NaN
      if (Number.isNaN(timestamp) || timestamp < cutoffMs) continue

      const eventType = typeof parsed.eventType === "string" ? parsed.eventType : ""
      const eventDistrictId = typeof parsed.districtId === "string" ? parsed.districtId : ""
      const withinDistrict = eventDistrictId === districtId

      if (
        withinDistrict &&
        (eventType === "ai_inference_started" || eventType === "ai_inference_completed")
      ) {
        summary.inferenceEventsLast24h += 1
      }
      if (withinDistrict && parsed.requiresHumanReview === true) {
        summary.requiresHumanReviewLast24h += 1
      }
      if (
        eventType === "district_isolation_blocked" &&
        (eventDistrictId === districtId ||
          (typeof parsed.sessionDistrictId === "string" &&
            parsed.sessionDistrictId === districtId))
      ) {
        summary.blockedIsolationAttemptsLast24h += 1
      }
      if (
        withinDistrict &&
        (eventType === "ai_inference_failed" || eventType === "ai_coach_error")
      ) {
        summary.failedInferenceEventsLast24h += 1
      }
    }

    return summary
  } catch {
    return EMPTY_AI_AUDIT_SUMMARY
  }
}
