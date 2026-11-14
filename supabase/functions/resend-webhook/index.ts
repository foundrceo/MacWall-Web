import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2.105.4"

/**
 * Resend → MacWall delivery feedback.
 *
 * Resend calls this when an email hard-bounces or the recipient marks it as
 * spam. The address goes on macwall_email_suppressions, the list every
 * marketing send checks first, so it is never mailed again. Mailing dead
 * addresses and people who complained is what sends a domain to spam.
 *
 *   email.bounced     permanent bounces only → reason "bounced"
 *   email.complained                         → reason "complained"
 *
 * Temporary bounces (full mailbox, server busy) are ignored: Resend retries
 * those. Requests are signed by Resend (Svix); anything unsigned, wrongly
 * signed or older than 5 minutes is rejected.
 */

/** The one database call this function makes. */
type Supabase = {
  from(table: string): {
    upsert(
      rows: { email: string; reason: string }[],
      options: { onConflict: string; ignoreDuplicates: boolean }
    ): PromiseLike<{ error: { message: string } | null }>
  }
}

/** Replays older (or further in the future) than this are rejected. */
const SIGNATURE_TOLERANCE_SECONDS = 5 * 60

const encoder = new TextEncoder()

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return bytes
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

/** Constant-time string compare, so timing can't leak the signature. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let index = 0; index < a.length; index += 1) diff |= a.charCodeAt(index) ^ b.charCodeAt(index)
  return diff === 0
}

/**
 * Svix signature check: HMAC-SHA256 over `id.timestamp.body` with the
 * base64 part of the `whsec_…` secret. The header may list several
 * space-separated `v1,<signature>` values (during a secret rotation).
 */
async function verifySignature(args: {
  secret: string
  id: string | null
  timestamp: string | null
  signatures: string | null
  body: string
  nowSeconds: number
}): Promise<boolean> {
  if (!args.id || !args.timestamp || !args.signatures) return false
  const sentAt = Number(args.timestamp)
  if (!Number.isFinite(sentAt)) return false
  if (Math.abs(args.nowSeconds - sentAt) > SIGNATURE_TOLERANCE_SECONDS) return false

  let keyBytes: Uint8Array
  try {
    keyBytes = base64ToBytes(args.secret.replace(/^whsec_/, ""))
  } catch {
    return false
  }
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${args.id}.${args.timestamp}.${args.body}`)
  )
  const expected = bytesToBase64(new Uint8Array(signed))
  return args.signatures
    .split(" ")
    .map((entry) => entry.split(","))
    .some(([version, signature]) => version === "v1" && safeEqual(signature ?? "", expected))
}

/** Why this event suppresses its recipients, or null when it doesn't. */
function suppressionReason(event: unknown): "bounced" | "complained" | null {
  if (typeof event !== "object" || event === null) return null
  const { type, data } = event as { type?: unknown; data?: { bounce?: { type?: unknown } } }
  if (type === "email.complained") return "complained"
  if (type === "email.bounced") {
    const kind = typeof data?.bounce?.type === "string" ? data.bounce.type.toLowerCase() : ""
    return kind === "permanent" ? "bounced" : null
  }
  return null
}

/** Recipient addresses on the event, lowercased, well-formed ones only. */
function eventRecipients(event: unknown): string[] {
  const to = (event as { data?: { to?: unknown } } | null)?.data?.to
  const list = Array.isArray(to) ? to : typeof to === "string" ? [to] : []
  const emails = list
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length >= 5 && value.length <= 254 && /^[^\s@]+@[^\s@]+$/.test(value))
  return [...new Set(emails)]
}

async function handleEvent(args: { event: unknown; supabase: Supabase }): Promise<Response> {
  const reason = suppressionReason(args.event)
  if (!reason) return Response.json({ ok: true, skipped: "ignored_event" })
  const emails = eventRecipients(args.event)
  if (emails.length === 0) return Response.json({ ok: true, skipped: "no_recipient" })

  // A complaint outranks an older reason; a bounce never overwrites one.
  const { error } = await args.supabase.from("macwall_email_suppressions").upsert(
    emails.map((email) => ({ email, reason })),
    { onConflict: "email", ignoreDuplicates: reason !== "complained" }
  )
  if (error) {
    console.error("[resend-webhook] suppress_failed", error.message)
    // 500 makes Resend retry the event later.
    return Response.json({ ok: false, error: "suppress_failed" }, { status: 500 })
  }
  return Response.json({ ok: true, suppressed: emails.length, reason })
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ ok: false, error: "method_not_allowed" }, { status: 405 })
  }
  const secret = Deno.env.get("RESEND_WEBHOOK_SECRET")?.trim()
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  if (!secret || !supabaseUrl || !serviceKey) {
    return Response.json({ ok: false, error: "not_configured" }, { status: 500 })
  }

  const body = await req.text()
  const valid = await verifySignature({
    secret,
    id: req.headers.get("svix-id"),
    timestamp: req.headers.get("svix-timestamp"),
    signatures: req.headers.get("svix-signature"),
    body,
    nowSeconds: Math.floor(Date.now() / 1000),
  })
  if (!valid) return Response.json({ ok: false, error: "invalid_signature" }, { status: 401 })

  let event: unknown
  try {
    event = JSON.parse(body)
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  }) as unknown as Supabase
  return handleEvent({ event, supabase })
})
