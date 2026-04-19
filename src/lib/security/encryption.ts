import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto"

const ENCRYPTION_SECRET =
  process.env.DATA_ENCRYPTION_KEY ??
  process.env.SESSION_SECRET ??
  "dev-only-insecure-encryption-secret-change-me"

function getKey() {
  return createHash("sha256").update(ENCRYPTION_SECRET).digest()
}

export function encryptJson(payload: unknown) {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv)
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8")
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, encrypted]).toString("base64")
}

export function decryptJson<T>(value: string): T {
  const data = Buffer.from(value, "base64")
  const iv = data.subarray(0, 12)
  const authTag = data.subarray(12, 28)
  const encrypted = data.subarray(28)
  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv)
  decipher.setAuthTag(authTag)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return JSON.parse(decrypted.toString("utf8")) as T
}
