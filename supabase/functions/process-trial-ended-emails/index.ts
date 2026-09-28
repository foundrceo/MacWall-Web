import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2.105.4"

import {
  LIFECYCLE_PROMO,
  buildLifecycleEmail,
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
 * Trial sequence for people who tried MacWall and did not buy.
 *
 *   ended      trial end (24h after start)   10% code
 *   reminder   +2 days                       Reel refund angle, 10% code
 *   last_call  +6 days                       20% for 48 hours, final email
 *
 * Follow-ups keep the same time of day as the trial start, which is when the
 * person was using their Mac. Every send re-checks purchase, unsubscribe,
 * deliverability and the 20-hour frequency cap.
 */

const ENQUEUE_LIMIT = 40
const SEND_LIMIT = 8
const SEND_GAP_MS = 600
const DAY_MS = 24 * 60 * 60 * 1000

type TrialStep = "ended" | "reminder" | "last_call"

const STEP_EMAIL: Record<TrialStep, LifecycleEmailId> = {
  ended: "trial_ended",
  reminder: "trial_reminder",
  last_call: "trial_last_call",
}

const FOLLOW_UPS: { step: TrialStep; afterMs: number }[] = [
  { step: "reminder", afterMs: 2 * DAY_MS },
  { step: "last_call", afterMs: 6 * DAY_MS },
]

type QueueRow = { id: number; visitor_id: string; email: string; step: string }
type Supabase = ReturnType<typeof createClient>

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function parseStep(raw: string): TrialStep | null {
  return raw === "ended" || raw === "reminder" || raw === "last_call" ? raw : null
}

async function markQueueRow(supabase: Supabase, id: number, patch: Record<string, unknown>) {
  await supabase
    .from("macwall_trial_ended_queue")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
}

async function cancelPendingForVisitor(supabase: Supabase, visitorId: string, reason: string) {
  await supabase
    .from("macwall_trial_ended_queue")
    .update({ status: "cancelled", skip_reason: reason, updated_at: new Date().toISOString() })
    .eq("visitor_id", visitorId)
    .eq("status", "pending")
}

async function enqueueFollowUps(supabase: Supabase, row: QueueRow, sentAtMs: number) {
  for (const follow of FOLLOW_UPS) {
    await supabase.from("macwall_trial_ended_queue").upsert(
      {
        visitor_id: row.visitor_id,
        email: row.email,
        step: follow.step,
        scheduled_send_at: new Date(sentAtMs + follow.afterMs).toISOString(),
        status: "pending",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "visitor_id,step", ignoreDuplicates: true }
    )
  }
}

async function processQueueRow(args: {
  row: QueueRow
  supabase: Supabase
  resendKey: string
  from: string
  appName: string
}): Promise<"sent" | "skipped" | "deferred" | "failed" | "rate_limited"> {
  const { row, supabase, resendKey, from, appName } = args
  const step = parseStep(row.step)
  if (!step) {
    await markQueueRow(supabase, row.id, { status: "skipped", skip_reason: "retired_step" })
    return "skipped"
  }
  const email = row.email.trim().toLowerCase()

  const blocked = await marketingBlockReason(supabase, email)
  if (blocked) {
    await cancelPendingForVisitor(supabase, row.visitor_id, blocked)
    await markQueueRow(supabase, row.id, { status: "cancelled", skip_reason: blocked })
    return "skipped"
  }

  const allowedAt = await nextAllowedSendAt(supabase, email)
  if (allowedAt) {
    await markQueueRow(supabase, row.id, { scheduled_send_at: allowedAt.toISOString() })
    return "deferred"
  }

  const promo = step === "last_call" ? LIFECYCLE_PROMO.twenty : LIFECYCLE_PROMO.ten
  const untilUnix =
    step === "last_call"
      ? Math.floor(Date.now() / 1000) + LIFECYCLE_PROMO.twenty.validHours * 3600
      : null
  const unsub = await unsubscribeUrlsFor(email)
  const mail = buildLifecycleEmail(STEP_EMAIL[step], {
    appName,
    siteUrl: siteBaseUrl(),
    logoUrl: logoUrl(),
    supportEmail: supportEmail(),
    postalAddress: postalAddress(),
    unsubscribeHref: unsub?.page ?? null,
    checkoutHref: lifecycleCheckoutHref({
      promoCode: promo.code,
      untilUnix,
      email,
      visitorId: row.visitor_id,
      medium: "trial",
      campaign: `trial_${step}`,
    }),
  })

  const { error: auditError } = await supabase
    .from("macwall_trial_ended_emails")
    .insert({ visitor_id: row.visitor_id, step, customer_email: email })
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
    idempotencyKey: `trial/${row.visitor_id}/${step}`,
    tags: [
      { name: "category", value: "trial" },
      { name: "step", value: step },
    ],
  })
  if (!result.ok) {
    await supabase
      .from("macwall_trial_ended_emails")
      .delete()
      .eq("visitor_id", row.visitor_id)
      .eq("step", step)
    return result.rateLimited ? "rate_limited" : "failed"
  }

  const sentAtMs = Date.now()
  await markQueueRow(supabase, row.id, {
    status: "sent",
    sent_at: new Date(sentAtMs).toISOString(),
    resend_id: result.id,
  })
  if (step === "ended") await enqueueFollowUps(supabase, row, sentAtMs)
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
  if (!authorized) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  const resendKey = Deno.env.get("RESEND_API_KEY")?.trim()
  const from = Deno.env.get("LICENSE_EMAIL_FROM")?.trim()
  const appName = Deno.env.get("APP_NAME")?.trim() || "MacWall"
  if (!supabaseUrl || !supabaseServiceKey || !resendKey || !from) {
    return Response.json({ ok: false, error: "missing_config" }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: enqueued, error: enqueueError } = await supabase.rpc(
    "enqueue_macwall_trial_ended_emails",
    { p_limit: ENQUEUE_LIMIT }
  )
  if (enqueueError) {
    console.error("[process-trial-ended-emails] enqueue_failed", enqueueError.message)
  }

  const { data: rows, error } = await supabase
    .from("macwall_trial_ended_queue")
    .select("id, visitor_id, email, step")
    .eq("status", "pending")
    .lte("scheduled_send_at", new Date().toISOString())
    .order("scheduled_send_at", { ascending: true })
    .limit(SEND_LIMIT)
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 })

  const counts = { sent: 0, skipped: 0, deferred: 0, failed: 0 }
  let rateLimited = false
  for (const row of (rows ?? []) as QueueRow[]) {
    const result = await processQueueRow({ row, supabase, resendKey, from, appName })
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
    enqueued: typeof enqueued === "number" ? enqueued : 0,
    processed: (rows ?? []).length,
    ...counts,
    rate_limited: rateLimited,
  })
})
