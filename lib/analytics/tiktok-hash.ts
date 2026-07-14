import { createHash } from "node:crypto"

export function normalizeTikTokEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function normalizeTikTokPhone(phone: string): string {
  return phone.replace(/\D/g, "")
}

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex")
}

export function hashTikTokEmail(email: string): string {
  return sha256Hex(normalizeTikTokEmail(email))
}

export function hashTikTokPhone(phone: string): string {
  return sha256Hex(normalizeTikTokPhone(phone))
}

export function hashTikTokExternalId(externalId: string): string {
  return sha256Hex(externalId)
}
