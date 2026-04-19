import { compare, hash } from "bcryptjs"

const PASSWORD_HASH_ROUNDS = 12

export async function hashPassword(rawPassword: string) {
  return hash(rawPassword, PASSWORD_HASH_ROUNDS)
}

export async function verifyPassword(rawPassword: string, passwordHash: string) {
  return compare(rawPassword, passwordHash)
}
