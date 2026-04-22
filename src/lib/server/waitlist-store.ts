import { appendFile, mkdir, readFile } from "node:fs/promises"
import path from "node:path"

const DATA_DIR = path.join(process.cwd(), ".data")
const WAITLIST_FILE = path.join(DATA_DIR, "waitlist-submissions.jsonl")

export type WaitlistEntry = {
  email: string
  fullName?: string
  submittedAt: string
  source?: string
  ipHash?: string
}

type ForwardResult =
  | { forwarded: false; reason: "disabled" }
  | { forwarded: false; reason: "error"; error: string }
  | { forwarded: true; status: number }

async function loadExistingEmails(): Promise<Set<string>> {
  try {
    const raw = await readFile(WAITLIST_FILE, "utf8")
    const emails = new Set<string>()
    for (const line of raw.split("\n")) {
      const trimmed = line.trim()
      if (!trimmed) continue
      try {
        const parsed = JSON.parse(trimmed) as Partial<WaitlistEntry>
        if (typeof parsed.email === "string") {
          emails.add(parsed.email)
        }
      } catch {
        // Ignore malformed lines; a corrupt record shouldn't block new signups.
      }
    }
    return emails
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return new Set()
    }
    throw error
  }
}

export async function recordWaitlistEntry(
  entry: WaitlistEntry
): Promise<{ stored: boolean; duplicate: boolean }> {
  await mkdir(DATA_DIR, { recursive: true })
  const existing = await loadExistingEmails()
  if (existing.has(entry.email)) {
    return { stored: false, duplicate: true }
  }
  await appendFile(WAITLIST_FILE, JSON.stringify(entry) + "\n", "utf8")
  return { stored: true, duplicate: false }
}

export async function forwardToCrm(entry: WaitlistEntry): Promise<ForwardResult> {
  const url = process.env.WAITLIST_WEBHOOK_URL
  if (!url) {
    return { forwarded: false, reason: "disabled" }
  }
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    const token = process.env.WAITLIST_WEBHOOK_TOKEN
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(entry),
      signal: AbortSignal.timeout(5_000),
    })
    return { forwarded: true, status: response.status }
  } catch (error) {
    return {
      forwarded: false,
      reason: "error",
      error: error instanceof Error ? error.message : "unknown",
    }
  }
}
