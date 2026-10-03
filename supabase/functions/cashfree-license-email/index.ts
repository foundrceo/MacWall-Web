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
import { sendPostHogPurchase } from "../_shared/posthog.ts"

/**
 * Cashfree webhook (India checkout) → activate the MacWall license and email
 * the key. Same job as whop-license-email.
 *
 * Every order made by macwall.app (lib/cashfree/create-macwall-checkout.ts)
 * sets this function as its `notify_url`, so no dashboard setup is needed.
 * The signature (HMAC-SHA256 of timestamp + raw body with the secret key) is
 * checked, then the order is re-read from Cashfree's API; only the order id
 * from the body is used. The license key rides in the order tags.
 *
 * Events: PAYMENT_SUCCESS_WEBHOOK (activate + email), REFUND_STATUS_WEBHOOK
 * (revoke once refunds cover the order). Others are acknowledged.
 *
 * Env: CASHFREE_APP_ID, CASHFREE_SECRET_KEY, CASHFREE_ENV ("production" or
 * sandbox), RESEND_API_KEY, LICENSE_EMAIL_FROM, SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY (+ optional pixel/email vars).
 */

const LOG = "[cashfree-license-email]"
const API_VERSION = "2025-01-01"
const ORDER_ID = /^mw_[a-z0-9]{24}$/
const LICENSE_KEY = /^MW-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/
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

function email(value: unknown): string | null {
  const e = str(value)?.toLowerCase()
  return e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null
}

// ---------------------------------------------------------------------------
// Signature: base64(HMAC-SHA256(x-webhook-timestamp + rawBody, secret key))

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

async function signatureValid(
  req: Request,
  rawBody: string,
  secret: string
): Promise<boolean> {
  const timestamp = req.headers.get("x-webhook-timestamp")
  const signature = req.headers.get("x-webhook-signature")
  if (!timestamp || !signature) return false
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const mac = new Uint8Array(
    await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(timestamp + rawBody)
    )
  )
  let bin = ""
  for (const b of mac) bin += String.fromCharCode(b)
  return timingSafeEqual(btoa(bin), signature)
}

// ---------------------------------------------------------------------------
// Cashfree API

function apiBase(): string {
  return Deno.env.get("CASHFREE_ENV")?.trim().toLowerCase() === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg"
}

async function cashfreeGet(path: string, appId: string, secret: string): Promise<unknown> {
  const res = await fetch(`${apiBase()}${path}`, {
    headers: {
      "x-client-id": appId,
      "x-client-secret": secret,
      "x-api-version": API_VERSION,
      Accept: "application/json",
    },
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(`cashfree_${res.status}: ${str(obj(data).message) ?? "error"}`)
  }
  return data
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

/** Activates the order's license (the return route may have done it already). */
async function activateLicense(
  supabase: Supabase,
  orderId: string,
  order: Json,
  buyerEmail: string | null
): Promise<{ licenseKey: string; maxDevices: number }> {
  const tags = obj(order.order_tags)
  const { data: existing } = await supabase
    .from("macwall_licenses")
    .select("license_key, status, max_devices")
    .eq("cashfree_order_id", orderId)
    .maybeSingle()
  const row = obj(existing)

  const tagKey = str(tags.license_key)?.toUpperCase()
  const licenseKey =
    str(row.license_key) ??
    (tagKey && LICENSE_KEY.test(tagKey) ? tagKey : mintLicenseKey())
  const tagDevices = num(tags.max_devices)
  const maxDevices =
    tagDevices && ALLOWED_MAX_DEVICES.has(tagDevices) ? tagDevices : 3

  const fields = {
    status: "active",
    cashfree_order_id: orderId,
    plan_slug: maxDevices >= 5 ? "pro_plus" : "pro",
    max_devices: maxDevices,
    billing_model: "permanent",
    visitor_country: "IN",
    ...(buyerEmail ? { customer_email: buyerEmail } : {}),
  }

  if (row.status === "active") {
    // Return route got here first; only fill in the email if it was missing.
    if (buyerEmail) {
      await supabase
        .from("macwall_licenses")
        .update({ customer_email: buyerEmail })
        .eq("license_key", licenseKey)
        .is("customer_email", null)
    }
    return { licenseKey, maxDevices }
  }

  const activatedFields = { ...fields, activated_at: new Date().toISOString() }
  const { data, error } = await supabase
    .from("macwall_licenses")
    .update(activatedFields)
    .eq("license_key", licenseKey)
    .select("id")
  if (error) throw new Error(`license_update: ${error.message}`)
  if (data && data.length > 0) return { licenseKey, maxDevices }

  const { error: insertError } = await supabase
    .from("macwall_licenses")
    .insert({ license_key: licenseKey, source: "cashfree", ...activatedFields })
  if (insertError && (insertError as { code?: string }).code !== "23505") {
    throw new Error(`license_insert: ${insertError.message}`)
  }
  return { licenseKey, maxDevices }
}

async function handlePaid(args: {
  supabase: Supabase
  orderId: string
  order: Json
  resendKey: string
  from: string
}): Promise<Response> {
  const { supabase, orderId, order } = args

  const { data: alreadySent } = await supabase
    .from("macwall_cashfree_license_emails")
    .select("order_id")
    .eq("order_id", orderId)
    .maybeSingle()
  if (alreadySent) {
    return Response.json({ ok: true, skipped: "already_emailed" })
  }

  // Only an email the buyer typed (tagged at order creation). Older orders
  // could carry a guessed lead email, so they are activated but not emailed.
  const typedByBuyer = str(obj(order.order_tags).email_source) === "buyer"
  const buyerEmail = typedByBuyer
    ? email(obj(order.customer_details).customer_email)
    : null

  const { licenseKey, maxDevices } = await activateLicense(
    supabase,
    orderId,
    order,
    buyerEmail
  )

  if (!buyerEmail) {
    // Key was shown on /activate; nothing to email. Don't make Cashfree retry.
    console.warn(LOG, "no_customer_email", orderId)
    return Response.json({ ok: true, activated: true, emailed: false })
  }

  await cancelTrialEndedEmails(supabase, buyerEmail)
  await sendTikTokPurchase({
    email: buyerEmail,
    eventIdSeed: `cashfree_${orderId}`,
    amount: num(order.order_amount),
    currency: str(order.order_currency) ?? "INR",
  })
  await sendXPurchase({ email: buyerEmail, eventIdSeed: `cashfree_${orderId}` })
  await sendPostHogPurchase({
    email: buyerEmail,
    eventIdSeed: `cashfree_${orderId}`,
    provider: "cashfree",
    amount: num(order.order_amount),
    currency: str(order.order_currency) ?? "INR",
    country: "IN",
  })

  const sent = await deliverLicenseEmail({
    resendKey: args.resendKey,
    from: args.from,
    appName: Deno.env.get("APP_NAME")?.trim() || "MacWall",
    to: buyerEmail,
    licenseKey,
    maxDevices,
  })
  if (!sent.ok) {
    console.error(LOG, "resend_failed", sent.status, sent.error)
    // Non-2xx makes Cashfree retry; the license is already active.
    return Response.json(
      { ok: false, error: sent.error },
      { status: sent.retryable ? 503 : 502 }
    )
  }

  const { error: auditError } = await supabase
    .from("macwall_cashfree_license_emails")
    .insert({
      order_id: orderId,
      license_key: licenseKey,
      customer_email: buyerEmail,
    })
  if (auditError && (auditError as { code?: string }).code !== "23505") {
    console.error(LOG, "audit_insert", auditError.message)
  }

  return Response.json({ ok: true, emailed_to: buyerEmail })
}

/** Revokes the license once successful refunds cover the whole order. */
async function handleRefund(args: {
  supabase: Supabase
  orderId: string
  order: Json
  appId: string
  secret: string
}): Promise<Response> {
  const refunds = await cashfreeGet(
    `/orders/${encodeURIComponent(args.orderId)}/refunds`,
    args.appId,
    args.secret
  )
  const refunded = (Array.isArray(refunds) ? refunds : [])
    .map(obj)
    .filter((r) => str(r.refund_status) === "SUCCESS")
    .reduce((sum, r) => sum + (num(r.refund_amount) ?? 0), 0)
  const total = num(args.order.order_amount) ?? 0
  if (total <= 0 || refunded + 0.005 < total) {
    return Response.json({ ok: true, skipped: "partial_or_pending_refund" })
  }
  const { error } = await args.supabase
    .from("macwall_licenses")
    .update({ status: "revoked" })
    .eq("cashfree_order_id", args.orderId)
  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 })
  }
  return Response.json({ ok: true, revoked: args.orderId })
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ ok: false, error: "method_not_allowed" }, { status: 405 })
  }

  const appId = Deno.env.get("CASHFREE_APP_ID")?.trim()
  const secret = Deno.env.get("CASHFREE_SECRET_KEY")?.trim()
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  const resendKey = Deno.env.get("RESEND_API_KEY")?.trim()
  const from = Deno.env.get("LICENSE_EMAIL_FROM")?.trim()
  if (!appId || !secret || !supabaseUrl || !serviceKey || !resendKey || !from) {
    console.error(LOG, "missing_env")
    return Response.json({ ok: false, error: "missing_env" }, { status: 500 })
  }

  const rawBody = await req.text()
  if (!(await signatureValid(req, rawBody, secret))) {
    return Response.json({ ok: false, error: "bad_signature" }, { status: 401 })
  }

  let event: Json
  try {
    event = obj(JSON.parse(rawBody))
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }
  const type = str(event.type) ?? ""
  const data = obj(event.data)
  const isPaid = type === "PAYMENT_SUCCESS_WEBHOOK"
  const isRefund =
    type === "REFUND_STATUS_WEBHOOK" &&
    str(obj(data.refund).refund_status) === "SUCCESS"
  if (!isPaid && !isRefund) {
    return Response.json({ ok: true, skipped: type || "unknown" })
  }

  const orderId = isPaid
    ? str(obj(data.order).order_id)
    : str(obj(data.refund).order_id)
  if (!orderId || !ORDER_ID.test(orderId)) {
    return Response.json({ ok: true, skipped: "not_macwall" })
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })

  try {
    const order = obj(
      await cashfreeGet(`/orders/${encodeURIComponent(orderId)}`, appId, secret)
    )
    if (isRefund) {
      return await handleRefund({ supabase, orderId, order, appId, secret })
    }
    if (str(order.order_status) !== "PAID") {
      return Response.json({ ok: true, skipped: "not_paid" })
    }
    return await handlePaid({ supabase, orderId, order, resendKey, from })
  } catch (e) {
    const message = e instanceof Error ? e.message : "error"
    console.error(LOG, message)
    return Response.json({ ok: false, error: message }, { status: 500 })
  }
})
