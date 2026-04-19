import { appendFile, mkdir } from "node:fs/promises"
import path from "node:path"

const DATA_DIR = path.join(process.cwd(), ".data")
const AUDIT_FILE = path.join(DATA_DIR, "security-audit.log")

export async function logSecurityEvent(event: Record<string, unknown>) {
  try {
    await mkdir(DATA_DIR, { recursive: true })
    await appendFile(
      AUDIT_FILE,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        ...event,
      }) + "\n",
      "utf8"
    )
  } catch {
    // Intentionally ignore logging failures to avoid request failures.
  }
}
