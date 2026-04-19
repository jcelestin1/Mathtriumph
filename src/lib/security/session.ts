import { createHmac, randomBytes, timingSafeEqual } from "node:crypto"

import { z } from "zod"

import type { DemoRole } from "@/lib/demo-auth"

const SESSION_SECRET =
  process.env.SESSION_SECRET ?? "dev-only-insecure-session-secret-change-me"
export const SESSION_COOKIE_NAME = "mt_session_v2"
const SESSION_TTL_SHORT_SECONDS = 60 * 60 * 8
const SESSION_TTL_LONG_SECONDS = 60 * 60 * 24 * 7

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

function base64UrlEncode(input: string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
}

function base64UrlDecode(input: string) {
  const restored = input.replace(/-/g, "+").replace(/_/g, "/")
  const padded = restored + "===".slice((restored.length + 3) % 4)
  return Buffer.from(padded, "base64").toString("utf8")
}

function signPayload(payloadB64: string) {
  return createHmac("sha256", SESSION_SECRET).update(payloadB64).digest("hex")
}

export function createSessionToken({
  userId,
  districtId,
  role,
  rememberMe,
}: {
  userId: string
  districtId: string
  role: DemoRole
  rememberMe?: boolean
}) {
  const now = Math.floor(Date.now() / 1000)
  const ttl = rememberMe ? SESSION_TTL_LONG_SECONDS : SESSION_TTL_SHORT_SECONDS
  const payload: SessionPayload = {
    userId,
    districtId,
    role,
    issuedAt: now,
    expiresAt: now + ttl,
    nonce: randomBytes(12).toString("hex"),
  }
  const payloadB64 = base64UrlEncode(JSON.stringify(payload))
  const signature = signPayload(payloadB64)
  return {
    token: `${payloadB64}.${signature}`,
    maxAge: ttl,
    payload,
  }
}

export function verifySessionToken(token?: string | null): SessionPayload | null {
  if (!token) return null
  const [payloadB64, signature] = token.split(".")
  if (!payloadB64 || !signature) return null

  const expected = signPayload(payloadB64)
  const providedBuffer = Buffer.from(signature, "utf8")
  const expectedBuffer = Buffer.from(expected, "utf8")
  if (providedBuffer.length !== expectedBuffer.length) return null
  if (!timingSafeEqual(providedBuffer, expectedBuffer)) return null

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
