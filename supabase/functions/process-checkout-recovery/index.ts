import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import Stripe from "npm:stripe@14.25.0"
import { createClient } from "npm:@supabase/supabase-js@2.105.4"

import {
  LIFECYCLE_PROMO,
  buildLifecycleEmail,
  planLabelForOffer,
  type LifecycleEmailId,
} from "../_shared/lifecycle-emails.ts"
import {
  lifecycleCheckoutHref,
  logoUrl,
  marketingBlockReason,
  nextAllowedSendAt,
  postalAddress,
  sendMarketingEmail,
  siteBaseUrl,
  supportEmail,
  unsubscribeUrlsFor,
} from "../_shared/lifecycle-send.ts"

/**
 * Checkout recovery for people who clicked Buy, reached Stripe, and left.
 * Rows are queued by the Stripe webhook when an opened session expires
 * (sessions expire 1 hour after creation), at most once per email every
 * 14 days.
 *
 *   r1  ~1h after leaving   "Your checkout is saved", no discount
 *   r2  +1 day              10% code
 *   r3  +3 days             20% for 48 hours, final email
 *
 * Queue keys: `<session>` (r1), `<session>::r2`, `<session>::r3`.
 */

const SEND_LIMIT = 8
const SEND_GAP_MS = 600
const DAY_MS = 24 * 60 * 60 * 1000

type RecoveryStep = "r1" | "r2" | "r3"

const STEP_EMAIL: Record<RecoveryStep, LifecycleEmailId> = {
  r1: "recovery_saved",
  r2: "recovery_10",
  r3: "recovery_last_call",
}

const FOLLOW_UPS: { step: RecoveryStep; afterMs: number }[] = [
  { step: "r2", afterMs: 1 * DAY_MS },
  { step: "r3", afterMs: 3 * DAY_MS },
]

type QueueRow = {
  id: number
  checkout_session_id: string
  license_key: string | null
  customer_email: string | null
  payment_intent_id: string | null
  reason: string | null
}
type Supabase = ReturnType<typeof createClient>

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function stepFromReason(reason: string | null): RecoveryStep | null {
  const match = reason?.match(/^recovery:(r1|r2|r3)$/)
  return match ? (match[1] as RecoveryStep) : null
}

function baseSessionId(id: string): string {
  return id.split("::")[0] || id
}

async function markQueueRow(supabase: Supabase, id: number, patch: Record<string, unknown>) {
  await supabase
    .from("macwall_checkout_recovery_queue")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
}

async function cancelSequence(supabase: Supabase, sessionId: string, reason: string) {
  await supabase
    .from("macwall_checkout_recovery_queue")
    .update({ status: "cancelled", skip_reason: reason, updated_at: new Date().toISOString() })
    .in("checkout_session_id", [sessionId, `${sessionId}::r2`, `${sessionId}::r3`])
    .eq("status", "pending")
}

function formatPrice(amountMinor: number | null, currency: string | null): string | null {
  if (typeof amountMinor !== "number" || amountMinor <= 0 || !currency) return null
  const major = amountMinor / 100
  const code = currency.toUpperCase()
  try {
    return new Intl.NumberFormat(code === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: Number.isInteger(major) ? 0 : 2,
      maximumFractionDigits: Number.isInteger(major) ? 0 : 2,
    }).format(major)
  } catch {
    return null
  }
}

async function enqueueFollowUps(supabase: Supabase, row: QueueRow, email: string, sentAtMs: number) {
  const sessionId = baseSessionId(row.checkout_session_id)
  for (const follow of FOLLOW_UPS) {
    await supabase.from("macwall_checkout_recovery_queue").upsert(
      {
        checkout_session_id: `${sessionId}::${follow.step}`,
        license_key: row.license_key,
        customer_email: email,
        payment_intent_id: row.payment_intent_id,
        reason: `recovery:${follow.step}`,
        scheduled_send_at: new Date(sentAtMs + follow.afterMs).toISOString(),
        status: "pending",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "checkout_session_id", ignoreDuplicates: true }
    )
  }
}

async function processQueueRow(args: {
  row: QueueRow
  stripe: Stripe
  supabase: Supabase
  resendKey: string
  from: string
  appName: string
}): Promise<"sent" | "skipped" | "deferred" | "failed" | "rate_limited"> {
  const { row, stripe, supabase, resendKey, from, appName } = args
  const step = stepFromReason(row.reason)
  const sessionId = baseSessionId(row.checkout_session_id)
  if (!step) {
    await markQueueRow(supabase, row.id, { status: "skipped", skip_reason: "retired_format" })
    return "skipped"
  }
  // Rows queued for Whop / Cashfree orders (`whop:` / `cashfree:` keys)
  // have no Stripe session; those gateways are gone.
  if (!sessionId.startsWith("cs_")) {
    await markQueueRow(supabase, row.id, { status: "skipped", skip_reason: "retired_provider" })
    return "skipped"
  }

  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch (error) {
    const missing = (error as { code?: string }).code === "resource_missing"
    console.error(
      "[process-checkout-recovery] session_retrieve_failed",
      error instanceof Error ? error.message : "error"
    )
    if (missing) {
      await markQueueRow(supabase, row.id, { status: "skipped", skip_reason: "session_not_found" })
      return "skipped"
    }
    // Transient Stripe error: retry in 30 minutes instead of blocking the queue.
    await markQueueRow(supabase, row.id, {
      scheduled_send_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    })
    return "deferred"
  }
  if (session.payment_status === "paid" || session.status === "complete") {
    await cancelSequence(supabase, sessionId, "payment_completed")
    return "skipped"
  }

  if (row.license_key) {
    const { data: license } = await supabase
      .from("macwall_licenses")
      .select("status")
      .eq("license_key", row.license_key)
      .maybeSingle()
    if (license?.status === "active") {
      await cancelSequence(supabase, sessionId, "license_active")
      return "skipped"
    }
  }

  const email = row.customer_email?.trim().toLowerCase()
  if (!email) {
    await markQueueRow(supabase, row.id, { status: "skipped", skip_reason: "no_email" })
    return "skipped"
  }

  const blocked = await marketingBlockReason(supabase, email)
  if (blocked) {
    await cancelSequence(supabase, sessionId, blocked)
    return "skipped"
  }

  const allowedAt = await nextAllowedSendAt(supabase, email)
  if (allowedAt) {
    await markQueueRow(supabase, row.id, { scheduled_send_at: allowedAt.toISOString() })
    return "deferred"
  }

  const promo =
    step === "r2" ? LIFECYCLE_PROMO.ten : step === "r3" ? LIFECYCLE_PROMO.twenty : null
  const untilUnix =
    step === "r3"
      ? Math.floor(Date.now() / 1000) + LIFECYCLE_PROMO.twenty.validHours * 3600
      : null
  const offerSlug = session.metadata?.offer_slug ?? "permanent"
  const maxDevices = Number.parseInt(session.metadata?.max_devices ?? "", 10)
  const unsub = await unsubscribeUrlsFor(email)
  const mail = buildLifecycleEmail(STEP_EMAIL[step], {
    appName,
    siteUrl: siteBaseUrl(),
    logoUrl: logoUrl(),
    supportEmail: supportEmail(),
    postalAddress: postalAddress(),
    unsubscribeHref: unsub?.page ?? null,
    planLabel: planLabelForOffer(appName, offerSlug, Number.isFinite(maxDevices) ? maxDevices : null),
    priceLabel: formatPrice(session.amount_total, session.currency),
    checkoutHref: lifecycleCheckoutHref({
      offerSlug,
      promoCode: promo?.code ?? null,
      untilUnix,
      email,
      visitorId: session.metadata?.visitor_id ?? null,
      medium: "recovery",
      campaign: `recovery_${step}`,
    }),
  })

  const webhookEventId = `recovery_queue_${row.id}_${row.checkout_session_id}`
  const { error: auditError } = await supabase.from("macwall_payment_recovery_emails").insert({
    webhook_event_id: webhookEventId,
    customer_email: email,
    payment_id: row.payment_intent_id,
    checkout_session_id: row.checkout_session_id,
    reason: row.reason,
  })
  if ((auditError as { code?: string } | null)?.code === "23505") {
    await markQueueRow(supabase, row.id, { status: "skipped", skip_reason: "already_sent" })
    return "skipped"
  }

  const result = await sendMarketingEmail({
    resendKey,
    from,
    to: email,
    mail,
    unsubscribeOneClick: unsub?.oneClick ?? null,
    idempotencyKey: `recovery/${row.checkout_session_id}`,
    tags: [
      { name: "category", value: "recovery" },
      { name: "step", value: step },
    ],
  })
  if (!result.ok) {
    await supabase
      .from("macwall_payment_recovery_emails")
      .delete()
      .eq("webhook_event_id", webhookEventId)
    return result.rateLimited ? "rate_limited" : "failed"
  }

  const sentAtMs = Date.now()
  await markQueueRow(supabase, row.id, {
    status: "sent",
    sent_at: new Date(sentAtMs).toISOString(),
    customer_email: email,
  })
  if (step === "r1") await enqueueFollowUps(supabase, row, email, sentAtMs)
  return "sent"
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { Allow: "POST, OPTIONS" } })
  }
  if (req.method !== "POST") return new Response("POST only", { status: 405 })

  const cronSecret = Deno.env.get("CRON_SECRET")?.trim()
  const authHeader = req.headers.get("authorization")?.trim()
  const cronHeader = req.headers.get("x-cron-secret")?.trim()
  const authorized =
    (cronSecret && cronHeader === cronSecret) ||
    (authHeader?.startsWith("Bearer ") &&
      authHeader.slice(7) === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim())
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
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: rows, error } = await supabase
    .from("macwall_checkout_recovery_queue")
    .select("id, checkout_session_id, license_key, customer_email, payment_intent_id, reason")
    .eq("status", "pending")
    .lte("scheduled_send_at", new Date().toISOString())
    .order("scheduled_send_at", { ascending: true })
    .limit(SEND_LIMIT)
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 })

  const counts = { sent: 0, skipped: 0, deferred: 0, failed: 0 }
  let rateLimited = false
  for (const row of (rows ?? []) as QueueRow[]) {
    const result = await processQueueRow({ row, stripe, supabase, resendKey, from, appName })
    if (result === "rate_limited") {
      counts.failed += 1
      rateLimited = true
      break
    }
    counts[result] += 1
    if (result === "sent") await sleep(SEND_GAP_MS)
  }

  return Response.json({
    ok: true,
    processed: (rows ?? []).length,
    ...counts,
    rate_limited: rateLimited,
  })
})
