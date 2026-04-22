import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import { decryptJson, encryptJson } from "@/lib/security/encryption"

export type WaitlistSubmission = {
  fullName?: string
  email: string
  submittedAt: string
}

type WaitlistDeliveryResult =
  | {
      destination: "crm_webhook"
    }
  | {
      destination: "local_queue"
      fallbackReason: "crm_webhook_not_configured" | "crm_webhook_failed"
    }

type StoredWaitlistQueue = {
  submissions: WaitlistSubmission[]
}

const DATA_DIR = path.join(process.cwd(), ".data")
const WAITLIST_QUEUE_FILE = path.join(DATA_DIR, "waitlist-submissions.enc")
const WAITLIST_QUEUE_LIMIT = 1000

const WAITLIST_CRM_WEBHOOK_URL = process.env.WAITLIST_CRM_WEBHOOK_URL
const WAITLIST_CRM_BEARER_TOKEN = process.env.WAITLIST_CRM_BEARER_TOKEN

async function readWaitlistQueue(): Promise<StoredWaitlistQueue> {
  try {
    const encrypted = await readFile(WAITLIST_QUEUE_FILE, "utf8")
    return decryptJson<StoredWaitlistQueue>(encrypted)
  } catch {
    return { submissions: [] }
  }
}

async function writeWaitlistQueue(queue: StoredWaitlistQueue) {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(WAITLIST_QUEUE_FILE, encryptJson(queue), "utf8")
}

async function queueWaitlistSubmission(submission: WaitlistSubmission) {
  const queue = await readWaitlistQueue()
  queue.submissions = [submission, ...queue.submissions].slice(0, WAITLIST_QUEUE_LIMIT)
  await writeWaitlistQueue(queue)
}

async function sendToCrmWebhook(webhookUrl: string, submission: WaitlistSubmission) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(WAITLIST_CRM_BEARER_TOKEN
        ? { Authorization: `Bearer ${WAITLIST_CRM_BEARER_TOKEN}` }
        : {}),
    },
    body: JSON.stringify(submission),
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(
      `CRM webhook rejected waitlist submission with status ${response.status}`
    )
  }

  return true
}

export async function deliverWaitlistSubmission(submission: WaitlistSubmission) {
  const webhookUrl = WAITLIST_CRM_WEBHOOK_URL
  if (!webhookUrl) {
    await queueWaitlistSubmission(submission)
    return {
      destination: "local_queue",
      fallbackReason: "crm_webhook_not_configured",
    } satisfies WaitlistDeliveryResult
  }

  try {
    await sendToCrmWebhook(webhookUrl, submission)
    return {
      destination: "crm_webhook",
    } satisfies WaitlistDeliveryResult
  } catch (error) {
    console.warn("[waitlist] CRM webhook delivery failed, queued locally", {
      email: submission.email,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    await queueWaitlistSubmission(submission)
    return {
      destination: "local_queue",
      fallbackReason: "crm_webhook_failed",
    } satisfies WaitlistDeliveryResult
  }
}
