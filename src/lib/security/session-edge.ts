import { z } from "zod"

const SESSION_SECRET =
  process.env.SESSION_SECRET ?? "dev-only-insecure-session-secret-change-me"

const SessionPayloadSchema = z.object({
  userId: z.string().min(8),
  districtId: z.string().min(2),
  role: z.enum([
    "district_admin",
    "school_admin",
    "tech_admin",
    "interventionist",
    "instructional_coach",
    "data_analyst",
    "teacher",
    "student",
    "parent",
    "support_admin",
  ]),
  issuedAt: z.number().int().positive(),
  expiresAt: z.number().int().positive(),
  nonce: z.string().min(8),
})

export type SessionPayload = z.infer<typeof SessionPayloadSchema>

function base64UrlDecode(input: string) {
  const restored = input.replace(/-/g, "+").replace(/_/g, "/")
  const padded = restored + "===".slice((restored.length + 3) % 4)
  return atob(padded)
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

async function signPayload(payloadB64: string) {
  const keyData = new TextEncoder().encode(SESSION_SECRET)
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64))
  return toHex(new Uint8Array(signature))
}

export async function verifySessionTokenEdge(token?: string | null): Promise<SessionPayload | null> {
  if (!token) return null
  const [payloadB64, signature] = token.split(".")
  if (!payloadB64 || !signature) return null

  const expected = await signPayload(payloadB64)
  if (!constantTimeEqual(signature, expected)) return null

  try {
    const parsed = JSON.parse(base64UrlDecode(payloadB64))
    const payload = SessionPayloadSchema.parse(parsed)
    const now = Math.floor(Date.now() / 1000)
    if (payload.expiresAt <= now) return null
    return payload
  } catch {
    return null
  }
}
