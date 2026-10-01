import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import {
  createClient,
  type SupabaseClient,
} from "npm:@supabase/supabase-js@2.105.4"

import {
  cancelTrialEndedEmails,
  deliverLicenseEmail,
  sendTikTokPurchase,
  sendXPurchase,
} from "../_shared/license-email.ts"

/**
 * Whop webhook → activate the MacWall license and email the key.
 *
 * Whop (MacWall business) → Developer → Webhooks → this function's URL, with
 * `payment.succeeded` and refund events. Following Whop's guidance, the
 * Standard Webhooks signature (WHOP_WEBHOOK_SECRET) is verified first and a
 * verified payload is trusted. With WHOP_API_KEY set the payment is also
 * re-read from Whop's API; without a secret the API re-read is mandatory, so
 * a forged body can never activate a license.
 *
 * The license key comes from the checkout metadata set by macwall.app
 * (lib/whop/create-macwall-checkout.ts). Purchases made straight from the
 * Whop store page carry no key, so one is minted here.
 *
 * Env: WHOP_WEBHOOK_SECRET and/or WHOP_API_KEY, RESEND_API_KEY,
 * LICENSE_EMAIL_FROM, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (+ optional
 * pixel/email vars).
 */

const LOG = "[whop-license-email]"
const WHOP_API_BASE = "https://api.whop.com/api/v1"
const MACWALL_ACCOUNT_ID =
  Deno.env.get("WHOP_ACCOUNT_ID")?.trim() || "biz_igjHj25vmVcNW8"
const SIGNATURE_TOLERANCE_S = 5 * 60

/** Whop plan → Macs, for payments that did not start on macwall.app. */
const PLAN_MAX_DEVICES: Record<string, number> = {
  plan_usKwVg6qqu3Xd: 3,
  plan_zcQVqY47Kyes6: 3,
  plan_pcrr5GziIG8Y5: 5,
  plan_s8pA6GNn2zcgp: 5,
  plan_yAjmP1nZiMBzV: 10,
  plan_57rkMB7VgtQWu: 10,
}
const ALLOWED_MAX_DEVICES = new Set([1, 2, 3, 5, 10, 15, 20])

type Json = Record<string, unknown>
// deno-lint-ignore no-explicit-any
type Supabase = SupabaseClient<any, "public", "public", any, any>

function obj(value: unknown): Json {
  return value && typeof value === "object" ? (value as Json) : {}
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

function num(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value) : value
  return typeof n === "number" && Number.isFinite(n) ? n : null
}

// ---------------------------------------------------------------------------
// Signature (Standard Webhooks: webhook-id / webhook-timestamp / webhook-signature)

function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

function bytesToBase64(bytes: Uint8Array): string {
  let bin = ""
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin)
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** Whop's SDK signs with the secret's raw bytes; `whsec_` secrets are base64. */
function signingKeys(secret: string): Uint8Array<ArrayBuffer>[] {
  const keys = [new TextEncoder().encode(secret)]
  if (secret.startsWith("whsec_")) {
    try {
      keys.push(base64ToBytes(secret.slice("whsec_".length)))
    } catch {
      /* not base64 */
    }
  }
  return keys
}

async function signatureValid(
  req: Request,
  rawBody: string,
  secret: string
): Promise<boolean> {
  const id = req.headers.get("webhook-id")
  const timestamp = req.headers.get("webhook-timestamp")
  const header = req.headers.get("webhook-signature")
  if (!id || !timestamp || !header) return false

  const ts = Number(timestamp)
  if (!Number.isFinite(ts)) return false
  if (Math.abs(Date.now() / 1000 - ts) > SIGNATURE_TOLERANCE_S) return false

  const signed = new TextEncoder().encode(`${id}.${timestamp}.${rawBody}`)
  const provided = header
    .split(" ")
    .map((part) => part.split(",")[1] ?? "")
    .filter(Boolean)

  for (const keyBytes of signingKeys(secret)) {
    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )
    const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, signed))
    const expected = bytesToBase64(mac)
    if (provided.some((sig) => timingSafeEqual(sig, expected))) return true
  }
  return false
}

// ---------------------------------------------------------------------------
// Whop API

async function fetchPayment(apiKey: string, paymentId: string): Promise<Json> {
  const res = await fetch(`${WHOP_API_BASE}/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  const data = obj(await res.json().catch(() => null))
  if (!res.ok) {
    const message = str(obj(data.error).message) ?? `whop_${res.status}`
    throw new Error(`payment_fetch_failed: ${message}`)
  }
  return data
}

function paymentAccountId(payment: Json): string | null {
  return (
    str(obj(payment.company).id) ??
    str(obj(payment.account).id) ??
    str(payment.company_id) ??
    str(payment.account_id)
  )
}

function paymentEmail(payment: Json, metadata: Json): string | null {
  const candidates = [
    obj(payment.user).email,
    obj(payment.member).email,
    payment.email,
    obj(payment.billing_details).email,
    metadata.customer_email,
  ]
  for (const c of candidates) {
    const email = str(c)?.toLowerCase()
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return email
  }
  return null
}

function paymentIsPaid(payment: Json): boolean {
  const status = str(payment.status)?.toLowerCase()
  const substatus = str(payment.substatus)?.toLowerCase()
  return status === "paid" || substatus === "succeeded"
}

function paymentIsFullyRefunded(payment: Json): boolean {
  const status = str(payment.status)?.toLowerCase()
  const substatus = str(payment.substatus)?.toLowerCase()
  if (status === "refunded" || substatus === "refunded") return true
  const refunded = num(payment.refunded_amount)
  const total = num(payment.total) ?? num(payment.final_amount)
  return refunded != null && total != null && total > 0 && refunded >= total
}

// ---------------------------------------------------------------------------
// License

const KEY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

function mintLicenseKey(): string {
  const segment = () => {
    const bytes = crypto.getRandomValues(new Uint8Array(4))
    return Array.from(bytes, (b) => KEY_ALPHABET[b % KEY_ALPHABET.length]).join("")
  }
  return `MW-${segment()}-${segment()}-${segment()}`
}

function maxDevicesFor(payment: Json, metadata: Json): number {
  const fromMetadata = num(metadata.max_devices)
  if (fromMetadata && ALLOWED_MAX_DEVICES.has(fromMetadata)) return fromMetadata
  const planId = str(obj(payment.plan).id) ?? str(payment.plan_id)
  return (planId && PLAN_MAX_DEVICES[planId]) || 3
}

async function activateLicense(args: {
  supabase: Supabase
  licenseKey: string
  email: string
  paymentId: string
  membershipId: string | null
  maxDevices: number
  visitorCountry: string | null
}): Promise<void> {
  const fields = {
    status: "active",
    customer_email: args.email,
    whop_payment_id: args.paymentId,
    ...(args.membershipId ? { whop_membership_id: args.membershipId } : {}),
    activated_at: new Date().toISOString(),
    plan_slug: args.maxDevices >= 5 ? "pro_plus" : "pro",
    max_devices: args.maxDevices,
    billing_model: "permanent",
    ...(args.visitorCountry ? { visitor_country: args.visitorCountry } : {}),
  }

  const { data, error } = await args.supabase
    .from("macwall_licenses")
    .update(fields)
    .eq("license_key", args.licenseKey)
    .select("id")
  if (error) throw new Error(`license_update: ${error.message}`)
  if (data && data.length > 0) return

  // No pending row (store-page purchase, or it was pruned): create it.
  const { error: insertError } = await args.supabase
    .from("macwall_licenses")
    .insert({ license_key: args.licenseKey, source: "whop", ...fields })
  if (insertError) throw new Error(`license_insert: ${insertError.message}`)
}

async function existingLicenseKeyForPayment(
  supabase: Supabase,
  paymentId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("macwall_licenses")
    .select("license_key")
    .eq("whop_payment_id", paymentId)
    .maybeSingle()
  return str(obj(data).license_key)
}

async function handlePaid(args: {
  supabase: Supabase
  payment: Json
  paymentId: string
  messageId: string | null
  resendKey: string
  from: string
}): Promise<Response> {
  const { supabase, payment, paymentId } = args

  const { data: alreadySent } = await supabase
    .from("macwall_whop_license_emails")
    .select("payment_id")
    .eq("payment_id", paymentId)
    .maybeSingle()
  if (alreadySent) {
    return Response.json({ ok: true, skipped: "already_emailed" })
  }

  const metadata = obj(payment.metadata)
  const email = paymentEmail(payment, metadata)
  if (!email) {
    console.error(LOG, "no_customer_email", paymentId)
    return Response.json({ ok: false, error: "no_customer_email" }, { status: 422 })
  }

  const licenseKey =
    str(metadata.license_key)?.toUpperCase() ??
    (await existingLicenseKeyForPayment(supabase, paymentId)) ??
    mintLicenseKey()
  const maxDevices = maxDevicesFor(payment, metadata)
  const rawCountry = (
    str(metadata.visitor_country) ??
    str(obj(payment.billing_address).country) ??
    ""
  ).toUpperCase()
  const visitorCountry = /^[A-Z]{2}$/.test(rawCountry) && rawCountry !== "XX"
    ? rawCountry
    : null

  await activateLicense({
    supabase,
    licenseKey,
    email,
    paymentId,
    membershipId: str(obj(payment.membership).id) ?? str(payment.membership_id),
    maxDevices,
    visitorCountry,
  })
  await cancelTrialEndedEmails(supabase, email)

  const amount = num(payment.total) ?? num(payment.final_amount) ?? num(payment.subtotal)
  const currency = str(payment.currency)
  await sendTikTokPurchase({
    email,
    eventIdSeed: `whop_${paymentId}`,
    amount,
    currency,
  })
  await sendXPurchase({ email, eventIdSeed: `whop_${paymentId}` })

  const sent = await deliverLicenseEmail({
    resendKey: args.resendKey,
    from: args.from,
    appName: Deno.env.get("APP_NAME")?.trim() || "MacWall",
    to: email,
    licenseKey,
    maxDevices,
  })
  if (!sent.ok) {
    console.error(LOG, "resend_failed", sent.status, sent.error)
    // Non-2xx makes Whop retry; the license is already active.
    return Response.json(
      { ok: false, error: sent.error },
      { status: sent.retryable ? 503 : 502 }
    )
  }

  const { error: auditError } = await supabase
    .from("macwall_whop_license_emails")
    .insert({
      payment_id: paymentId,
      license_key: licenseKey,
      customer_email: email,
      webhook_message_id: args.messageId,
    })
  if (auditError && (auditError as { code?: string }).code !== "23505") {
    console.error(LOG, "audit_insert", auditError.message)
  }

  return Response.json({ ok: true, emailed_to: email })
}

async function handleRefund(supabase: Supabase, payment: Json, paymentId: string) {
  if (!paymentIsFullyRefunded(payment)) {
    return Response.json({ ok: true, skipped: "partial_refund" })
  }
  const { error } = await supabase
    .from("macwall_licenses")
    .update({ status: "revoked" })
    .eq("whop_payment_id", paymentId)
  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 })
  }
  return Response.json({ ok: true, revoked: paymentId })
}

/** The payment id an event is about, whatever object Whop sent. */
function eventPaymentId(type: string, data: Json): string | null {
  if (type.startsWith("payment.")) return str(data.id)
  return str(obj(data.payment).id) ?? str(data.payment_id)
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ ok: false, error: "method_not_allowed" }, { status: 405 })
  }

  const apiKey = Deno.env.get("WHOP_API_KEY")?.trim()
  const webhookSecret = Deno.env.get("WHOP_WEBHOOK_SECRET")?.trim()
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  const resendKey = Deno.env.get("RESEND_API_KEY")?.trim()
  const from = Deno.env.get("LICENSE_EMAIL_FROM")?.trim()
  if (!supabaseUrl || !serviceKey || !resendKey || !from || (!apiKey && !webhookSecret)) {
    console.error(LOG, "missing_env")
    return Response.json({ ok: false, error: "missing_env" }, { status: 500 })
  }

  const rawBody = await req.text()
  if (webhookSecret) {
    if (!(await signatureValid(req, rawBody, webhookSecret))) {
      return Response.json({ ok: false, error: "bad_signature" }, { status: 401 })
    }
  } else {
    // Still safe: nothing below trusts the body beyond the payment id.
    console.warn(LOG, "WHOP_WEBHOOK_SECRET not set; skipping signature check")
  }

  let event: Json
  try {
    event = obj(JSON.parse(rawBody))
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }
  const type = str(event.type) ?? str(event.action) ?? ""
  const data = obj(event.data)
  const isPaid = type === "payment.succeeded"
  const isRefund = type.startsWith("refund.") || type === "payment.refunded"
  if (!isPaid && !isRefund) {
    return Response.json({ ok: true, skipped: type || "unknown" })
  }

  const paymentId = eventPaymentId(type, data)
  if (!paymentId) {
    return Response.json({ ok: false, error: "no_payment_id" }, { status: 422 })
  }

  // A signed payload is trusted as-is; the API (when configured) is fresher.
  let payment: Json = isPaid ? data : obj(data.payment)
  if (apiKey) {
    try {
      payment = await fetchPayment(apiKey, paymentId)
    } catch (e) {
      console.error(LOG, e instanceof Error ? e.message : "payment_fetch_failed")
      if (!webhookSecret) {
        return Response.json({ ok: false, error: "payment_fetch_failed" }, { status: 502 })
      }
    }
  }

  const accountId = paymentAccountId(payment)
  if (accountId && accountId !== MACWALL_ACCOUNT_ID) {
    return Response.json({ ok: true, skipped: "other_business" })
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })

  try {
    if (isRefund) return await handleRefund(supabase, payment, paymentId)
    if (!paymentIsPaid(payment)) {
      return Response.json({ ok: true, skipped: "not_paid" })
    }
    return await handlePaid({
      supabase,
      payment,
      paymentId,
      messageId: req.headers.get("webhook-id"),
      resendKey,
      from,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "error"
    console.error(LOG, message)
    return Response.json({ ok: false, error: message }, { status: 500 })
  }
})
