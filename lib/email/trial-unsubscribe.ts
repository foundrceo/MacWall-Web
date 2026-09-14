import "server-only"

import { getSupabaseAdmin } from "@/lib/supabase/admin"

const textEncoder = new TextEncoder()

function unsubscribeSecret(): string {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) {
    throw new Error("CRON_SECRET is required to sign trial unsubscribe links.")
  }
  return secret
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/")
  const padLength = (4 - (padded.length % 4)) % 4
  const base64 = padded + "=".repeat(padLength)
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

async function importHmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
}

export async function signTrialUnsubscribeToken(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase()
  const key = await importHmacKey(unsubscribeSecret())
  const payload = bytesToBase64Url(textEncoder.encode(normalized))
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(normalized)
  )
  return `${payload}.${bytesToBase64Url(new Uint8Array(sig))}`
}

export async function parseTrialUnsubscribeToken(
  token: string | null | undefined
): Promise<string | null> {
  if (!token?.includes(".")) return null
  const dot = token.indexOf(".")
  const payload = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  if (!payload || !sig) return null

  let email: string
  try {
    email = new TextDecoder().decode(base64UrlToBytes(payload)).trim().toLowerCase()
  } catch {
    return null
  }
  if (!email.includes("@")) return null

  const expected = await signTrialUnsubscribeToken(email)
  if (expected.length !== token.length) return null

  const a = textEncoder.encode(expected)
  const b = textEncoder.encode(token)
  if (a.byteLength !== b.byteLength) return null

  let diff = 0
  for (let i = 0; i < a.byteLength; i += 1) diff |= a[i]! ^ b[i]!
  return diff === 0 ? email : null
}

export type TrialUnsubscribeResult =
  | { ok: true; email: string }
  | { ok: false; error: "missing_token" | "invalid_token" | "update_failed" }

export async function unsubscribeTrialEmailByToken(
  token: string | null | undefined
): Promise<TrialUnsubscribeResult> {
  if (!token?.trim()) return { ok: false, error: "missing_token" }

  const email = await parseTrialUnsubscribeToken(token)
  if (!email) return { ok: false, error: "invalid_token" }

  const supabase = getSupabaseAdmin()
  const now = new Date().toISOString()

  const { error: leadError } = await supabase
    .from("macwall_trial_leads")
    .update({ unsubscribed_at: now, updated_at: now })
    .eq("email", email)
    .is("unsubscribed_at", null)

  if (leadError) {
    console.error("[trial-unsubscribe] lead_update", leadError.message)
    return { ok: false, error: "update_failed" }
  }

  const { error: queueError } = await supabase
    .from("macwall_trial_ended_queue")
    .update({
      status: "cancelled",
      skip_reason: "unsubscribed",
      updated_at: now,
    })
    .eq("status", "pending")
    .eq("email", email)

  if (queueError) {
    console.error("[trial-unsubscribe] queue_update", queueError.message)
    return { ok: false, error: "update_failed" }
  }

  return { ok: true, email }
}
