import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import Stripe from "npm:stripe@14.25.0"
import { createClient } from "npm:@supabase/supabase-js@2.105.4"

const MAX_NO_EMAIL_RETRIES = 6
const NO_EMAIL_RETRY_MINUTES = 30
const SEND_LIMIT = 5
const SEND_GAP_MS = 800
const EMAIL_RECOVERY_PROMO_CODE = "WALL10"
const EMAIL_RECOVERY_PROMO_PERCENT = "10%"
const LADDER_20_HOURS = 24
const LADDER_30_HOURS = 12
const LADDER_20_AFTER_MS = 24 * 60 * 60 * 1000
const LADDER_30_AFTER_MS = 48 * 60 * 60 * 1000
const EMAIL_LADDER_20 = "R7N2WP8J"
const EMAIL_LADDER_30 = "B3H9KF5Q"
const FONT = "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif"
const MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace"

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}
function siteBaseUrl(): string {
  return (Deno.env.get("LICENSE_EMAIL_SITE_URL")?.trim() || "https://macwall.app").replace(/\/+$/, "")
}
function supportEmail(): string {
  return Deno.env.get("LICENSE_EMAIL_SUPPORT")?.trim() || "support@macwall.app"
}
function logoUrl(): string {
  return Deno.env.get("LICENSE_EMAIL_LOGO_URL")?.trim() || `${siteBaseUrl()}/email/macwall-icon.png`
}
function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
function originalCheckoutSessionId(id: string): string {
  return id.split("::")[0] || id
}
function ladderFromReason(reason: string | null): { code: string; percent: string; expiresHours: number } | null {
  const match = reason?.match(/ladder:(WALL20|WALL30|R7N2WP8J|B3H9KF5Q)/i)
  if (!match) return null
  const raw = match[1].toUpperCase()
  if (raw === "WALL20" || raw === EMAIL_LADDER_20) {
    return { code: EMAIL_LADDER_20, percent: "20%", expiresHours: LADDER_20_HOURS }
  }
  return { code: EMAIL_LADDER_30, percent: "30%", expiresHours: LADDER_30_HOURS }
}
function checkoutHref(
  promoCode?: string,
  untilUnix?: number,
  email?: string | null,
  campaign: "wall10" | "ladder_20" | "ladder_30" = "wall10"
): string {
  const base = `${siteBaseUrl()}/api/checkout/create-session?offer=permanent`
  const params = new URLSearchParams()
  const code = (promoCode ?? EMAIL_RECOVERY_PROMO_CODE).trim()
  if (code) params.set("promo", code)
  if (untilUnix && untilUnix > 0) params.set("until", String(untilUnix))
  const leadEmail = email?.trim().toLowerCase()
  if (leadEmail) params.set("email", leadEmail)
  params.set("utm_source", "email")
  params.set("utm_medium", "recovery")
  params.set("utm_campaign", campaign)
  return `${base}&${params.toString()}`
}
function parseRetryCount(reason: string | null): number {
  const match = reason?.match(/retry:(\d+)/)
  return match ? Number.parseInt(match[1], 10) : 0
}
function recoveryEmailSubject(appName = "MacWall", promoPercent = EMAIL_RECOVERY_PROMO_PERCENT): string {
  return `Claim ${promoPercent} off ${appName} Pro`
}
function buildEmail(args: {
  appName: string
  checkoutHref: string
  promoCode: string
  promoPercent: string
  expiresHours?: number
}): { html: string; text: string; subject: string } {
  const { appName, checkoutHref: href, promoCode, promoPercent, expiresHours } = args
  const urgency =
    expiresHours === 12
      ? `Last chance — this ${promoPercent} off expires in 12 hours.`
      : expiresHours === 24
        ? `This extra ${promoPercent} off expires in 24 hours.`
        : `Your checkout is still open.`
  const preheader = expiresHours
    ? `Code ${promoCode} · expires in ${expiresHours} hours`
    : `Code ${promoCode} · tap to finish checkout`
  const year = new Date().getFullYear()
  const subject = recoveryEmailSubject(appName, promoPercent)
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#fff;font-family:${FONT}">
<div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preheader)}</div>
<table width="100%" cellspacing="0" cellpadding="0" style="background:#fff;padding:24px 16px">
<tr><td align="center">
<table width="100%" style="max-width:740px;background:#f5f5f7;border-radius:12px">
<tr><td align="center" style="padding:36px 26px 12px"><img src="${escapeHtml(logoUrl())}" width="36" height="36" alt="${escapeHtml(appName)}" style="border-radius:9px"></td></tr>
<tr><td align="center" style="padding:12px 26px 20px"><p style="margin:0;font-size:32px;font-weight:600;color:#111">${escapeHtml(promoPercent)} off ${escapeHtml(appName)} Pro</p></td></tr>
<tr><td align="center" style="padding:0 26px 28px"><p style="margin:0;font-size:17px;color:#333;line-height:1.47">${escapeHtml(urgency)} Unlock 1,000+ live wallpapers and Lock Screen with a one-time Pro license — not a subscription.</p></td></tr>
<tr><td style="padding:0 26px 28px"><table width="100%" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px"><tr><td align="center" style="padding:22px 20px">
<p style="margin:0 0 8px;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#86868b">Discount code</p>
<p style="margin:0;font-family:${MONO};font-size:22px;font-weight:600;letter-spacing:.08em;color:#111">${escapeHtml(promoCode)}</p>
<p style="margin:10px 0 0;font-size:13px;color:#86868b">${escapeHtml(promoPercent)} off · auto-applied when you continue</p>
</td></tr></table></td></tr>
<tr><td align="center" style="padding-bottom:8px"><a href="${escapeHtml(href)}" style="color:#0070c9;text-decoration:none;font-size:17px">Continue with ${escapeHtml(promoPercent)} off&nbsp;›</a></td></tr>
<tr><td align="center" style="padding:20px 28px 28px"><p style="margin:0;color:#888;font-size:11px">Already paid? You can ignore this email.</p>
<p style="margin:0;color:#888;font-size:11px">&copy; ${year} ${escapeHtml(appName)}. All rights reserved.</p></td></tr>
</table></td></tr></table></body></html>`
  const text =
    `${promoPercent} off ${appName} Pro\n\n` +
    `Your checkout is still open. Unlock 1,000+ live wallpapers and Lock Screen with a one-time Pro license.\n\n` +
    `Code ${promoCode} (${promoPercent} off — auto-applied):\n${href}\n\n` +
    `Already paid? You can ignore this email.\n\nHelp: ${supportEmail()}`
  return { html, text, subject }
}

type QueueRow = {
  id: number
  checkout_session_id: string
  license_key: string | null
  customer_email: string | null
  payment_intent_id: string | null
  reason: string | null
}

async function markQueueRow(supabase: ReturnType<typeof createClient>, id: number, patch: Record<string, unknown>) {
  await supabase.from("macwall_checkout_recovery_queue").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id)
}

function sessionEmail(session: Stripe.Checkout.Session): string | null {
  const email = session.customer_details?.email?.trim() || session.customer_email?.trim() || null
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  return email
}

async function enqueueLadderFollowUps(
  supabase: ReturnType<typeof createClient>,
  input: { baseSessionId: string; licenseKey: string | null; email: string; paymentIntentId: string | null }
) {
  const now = Date.now()
  for (const follow of [
    { id: `${input.baseSessionId}::wall20`, reason: `ladder:${EMAIL_LADDER_20}`, at: new Date(now + LADDER_20_AFTER_MS).toISOString() },
    { id: `${input.baseSessionId}::wall30`, reason: `ladder:${EMAIL_LADDER_30}`, at: new Date(now + LADDER_30_AFTER_MS).toISOString() },
  ]) {
    const { data: existing } = await supabase.from("macwall_checkout_recovery_queue").select("id").eq("checkout_session_id", follow.id).maybeSingle()
    if (existing) continue
    await supabase.from("macwall_checkout_recovery_queue").insert({
      checkout_session_id: follow.id,
      license_key: input.licenseKey,
      customer_email: input.email,
      payment_intent_id: input.paymentIntentId,
      reason: follow.reason,
      scheduled_send_at: follow.at,
      status: "pending",
      sent_at: null,
      skip_reason: null,
      updated_at: new Date().toISOString(),
    })
  }
}

async function backfillLadderFollowUps(supabase: ReturnType<typeof createClient>): Promise<number> {
  const { data: sent } = await supabase
    .from("macwall_checkout_recovery_queue")
    .select("checkout_session_id, license_key, customer_email, payment_intent_id, sent_at, reason")
    .eq("status", "sent")
    .not("customer_email", "is", null)
    .order("sent_at", { ascending: false })
    .limit(80)
  let queued = 0
  for (const row of sent ?? []) {
    if (ladderFromReason(row.reason)) continue
    const email = row.customer_email?.trim()
    if (!email) continue
    const baseId = originalCheckoutSessionId(row.checkout_session_id)
    if (baseId.includes("::")) continue
    const sentAt = row.sent_at ? Date.parse(row.sent_at) : Date.now()
    const age = Date.now() - sentAt
    const { data: wall20 } = await supabase.from("macwall_checkout_recovery_queue").select("id").eq("checkout_session_id", `${baseId}::wall20`).maybeSingle()
    if (wall20) continue
    const now = Date.now()
    const twentyAt = age >= LADDER_20_AFTER_MS ? new Date(now + 5 * 60 * 1000) : new Date(sentAt + LADDER_20_AFTER_MS)
    const thirtyAt = age >= LADDER_30_AFTER_MS ? new Date(now + 30 * 60 * 1000) : new Date(sentAt + LADDER_30_AFTER_MS)
    await supabase.from("macwall_checkout_recovery_queue").insert([
      { checkout_session_id: `${baseId}::wall20`, license_key: row.license_key, customer_email: email, payment_intent_id: row.payment_intent_id, reason: `ladder:${EMAIL_LADDER_20}`, scheduled_send_at: twentyAt.toISOString(), status: "pending", updated_at: new Date().toISOString() },
      { checkout_session_id: `${baseId}::wall30`, license_key: row.license_key, customer_email: email, payment_intent_id: row.payment_intent_id, reason: `ladder:${EMAIL_LADDER_30}`, scheduled_send_at: thirtyAt.toISOString(), status: "pending", updated_at: new Date().toISOString() },
    ])
    queued += 2
  }
  return queued
}

async function processQueueRow(args: {
  row: QueueRow
  stripe: Stripe
  supabase: ReturnType<typeof createClient>
  resendKey: string
  from: string
  appName: string
}): Promise<"sent" | "skipped" | "failed" | "rescheduled" | "rate_limited"> {
  const { row, stripe, supabase, resendKey, from, appName } = args
  const ladder = ladderFromReason(row.reason)
  const promoCode = ladder?.code ?? EMAIL_RECOVERY_PROMO_CODE
  const promoPercent = ladder?.percent ?? EMAIL_RECOVERY_PROMO_PERCENT
  const expiresHours = ladder?.expiresHours
  const untilUnix = expiresHours ? Math.floor(Date.now() / 1000) + expiresHours * 3600 : undefined
  const stripeSessionId = originalCheckoutSessionId(row.checkout_session_id)

  let session: Stripe.Checkout.Session | null = null
  try {
    session = await stripe.checkout.sessions.retrieve(stripeSessionId)
  } catch (e) {
    console.error("[process-checkout-recovery] session_retrieve_failed", stripeSessionId, e instanceof Error ? e.message : "error")
    if (!row.customer_email?.trim()) {
      await markQueueRow(supabase, row.id, { status: "skipped", skip_reason: "session_not_found" })
      return "skipped"
    }
  }

  if (session && (session.payment_status === "paid" || session.status === "complete")) {
    await markQueueRow(supabase, row.id, { status: "cancelled", skip_reason: "payment_completed" })
    return "skipped"
  }

  if (row.license_key) {
    const { data: lic } = await supabase.from("macwall_licenses").select("status").eq("license_key", row.license_key).maybeSingle()
    if (lic?.status === "active") {
      await markQueueRow(supabase, row.id, { status: "cancelled", skip_reason: "license_active" })
      return "skipped"
    }
  }

  const email = row.customer_email?.trim() || (session ? sessionEmail(session) : null)
  if (!email) {
    const retries = parseRetryCount(row.reason)
    if (retries >= MAX_NO_EMAIL_RETRIES) {
      await markQueueRow(supabase, row.id, { status: "skipped", skip_reason: "no_email" })
      return "skipped"
    }
    await markQueueRow(supabase, row.id, {
      status: "pending",
      scheduled_send_at: new Date(Date.now() + NO_EMAIL_RETRY_MINUTES * 60 * 1000).toISOString(),
      reason: `checkout_started:retry:${retries + 1}`,
      skip_reason: null,
    })
    return "rescheduled"
  }

  const checkoutCampaign =
    promoCode === EMAIL_LADDER_20 ? "ladder_20" : promoCode === EMAIL_LADDER_30 ? "ladder_30" : "wall10"
  const checkoutHrefValue = checkoutHref(promoCode, untilUnix, email, checkoutCampaign)
  const paymentIntentId =
    row.payment_intent_id ||
    (session && typeof session.payment_intent === "string" ? session.payment_intent : session?.payment_intent?.id) ||
    null
  const webhookEventId = `recovery_queue_${row.id}_${row.checkout_session_id}`

  const { error: insErr } = await supabase.from("macwall_payment_recovery_emails").insert({
    webhook_event_id: webhookEventId,
    customer_email: email,
    payment_id: paymentIntentId,
    checkout_session_id: row.checkout_session_id,
    reason: row.reason,
  })
  if (insErr) {
    if ((insErr as { code?: string }).code === "23505") {
      await markQueueRow(supabase, row.id, { status: "skipped", skip_reason: "already_sent" })
      return "skipped"
    }
    console.error("[process-checkout-recovery] audit_insert_failed_continuing", insErr.message)
  }

  const mail = buildEmail({ appName, checkoutHref: checkoutHrefValue, promoCode, promoPercent, expiresHours })
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json", "User-Agent": "MacWall/1.0" },
      body: JSON.stringify({ from, to: [email], subject: mail.subject, html: mail.html, text: mail.text }),
    })
    if (!res.ok) {
      await supabase.from("macwall_payment_recovery_emails").delete().eq("webhook_event_id", webhookEventId)
      console.error("[process-checkout-recovery] resend_failed", res.status)
      if (res.status === 429) return "rate_limited"
      return "failed"
    }
  } catch (e) {
    await supabase.from("macwall_payment_recovery_emails").delete().eq("webhook_event_id", webhookEventId)
    console.error("[process-checkout-recovery] resend_exception", e instanceof Error ? e.message : "error")
    return "failed"
  }

  await markQueueRow(supabase, row.id, { status: "sent", sent_at: new Date().toISOString(), customer_email: email })
  if (!ladder) {
    await enqueueLadderFollowUps(supabase, { baseSessionId: stripeSessionId, licenseKey: row.license_key, email, paymentIntentId })
  }
  return "sent"
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: { Allow: "POST, OPTIONS" } })
  if (req.method !== "POST") return new Response("POST only", { status: 405 })

  const cronSecret = Deno.env.get("CRON_SECRET")?.trim()
  const authHeader = req.headers.get("authorization")?.trim()
  const cronHeader = req.headers.get("x-cron-secret")?.trim()
  const authorized =
    (cronSecret && cronHeader === cronSecret) ||
    (authHeader?.startsWith("Bearer ") && authHeader.slice(7) === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim())
  if (!authorized) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 })

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY")?.trim()
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  const resendKey = Deno.env.get("RESEND_API_KEY")?.trim()
  const from = Deno.env.get("LICENSE_EMAIL_FROM")?.trim()
  const appName = Deno.env.get("APP_NAME")?.trim() || "MacWall"
  if (!stripeSecret || !supabaseUrl || !supabaseServiceKey || !resendKey || !from) {
    return Response.json({ ok: false, error: "missing_config" }, { status: 500 })
  }

  const stripe = new Stripe(stripeSecret)
  const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const now = new Date().toISOString()
  const { data: rows, error } = await supabase
    .from("macwall_checkout_recovery_queue")
    .select("id, checkout_session_id, license_key, customer_email, payment_intent_id, reason")
    .eq("status", "pending")
    .lte("scheduled_send_at", now)
    .order("scheduled_send_at", { ascending: true })
    .limit(SEND_LIMIT)
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 })

  const ladderBackfilled = await backfillLadderFollowUps(supabase)
  let sent = 0, skipped = 0, failed = 0, rescheduled = 0, rateLimited = false
  for (const row of (rows ?? []) as QueueRow[]) {
    const result = await processQueueRow({ row, stripe, supabase, resendKey, from, appName })
    if (result === "sent") sent++
    else if (result === "rescheduled") rescheduled++
    else if (result === "skipped") skipped++
    else if (result === "rate_limited") { failed++; rateLimited = true; break }
    else failed++
    await sleep(SEND_GAP_MS)
  }
  return Response.json({ ok: true, processed: (rows ?? []).length, sent, skipped, rescheduled, failed, rate_limited: rateLimited, ladderBackfilled })
})
