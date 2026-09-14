import "server-only"

import { Resend } from "resend"

import { TrialEndedEmail } from "@/emails/trial-ended"
import { signTrialUnsubscribeToken } from "@/lib/email/trial-unsubscribe"
import {
  trialEndedCopy,
  trialEndedPlainText,
  trialEndedPromo,
  type TrialEndedEmailStep,
} from "@/lib/email/trial-ended-copy"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

const EMAIL_SITE_URL = "https://macwall.app"
const EMAIL_FROM_DISPLAY = "MacWall <licenses@macwall.app>"
const EMAIL_LOGO_URL = `${EMAIL_SITE_URL}/email/macwall-icon.png`

const ENQUEUE_LIMIT = 40
const SEND_LIMIT = 25
const LADDER_20_AFTER_MS = 24 * 60 * 60 * 1000
const LADDER_30_AFTER_MS = 48 * 60 * 60 * 1000

type QueueRow = {
  id: number
  visitor_id: string
  email: string
  step: string
}

function parseStep(raw: string): TrialEndedEmailStep | null {
  if (raw === "ended" || raw === "ladder_20" || raw === "ladder_30") return raw
  return null
}

function checkoutHref(promoCode: string, untilUnix?: number): string {
  const base = `${EMAIL_SITE_URL}/api/checkout/create-session?offer=permanent`
  const params = new URLSearchParams()
  if (promoCode) params.set("promo", promoCode)
  if (untilUnix && untilUnix > 0) params.set("until", String(untilUnix))
  const query = params.toString()
  return query ? `${base}&${query}` : base
}

function fromAddress(): string {
  return process.env.LICENSE_EMAIL_FROM?.trim() || EMAIL_FROM_DISPLAY
}

function supportEmail(): string {
  return process.env.LICENSE_EMAIL_SUPPORT?.trim() || "support@macwall.app"
}

function logoUrl(): string {
  return process.env.LICENSE_EMAIL_LOGO_URL?.trim() || EMAIL_LOGO_URL
}

function appName(): string {
  return process.env.APP_NAME?.trim() || "MacWall"
}

async function unsubscribeUrls(email: string): Promise<{
  page: string
  oneClick: string
} | null> {
  try {
    const token = await signTrialUnsubscribeToken(email)
    const encoded = encodeURIComponent(token)
    return {
      page: `${EMAIL_SITE_URL}/unsubscribe/trial?t=${encoded}`,
      oneClick: `${EMAIL_SITE_URL}/api/unsubscribe/trial?t=${encoded}`,
    }
  } catch {
    return null
  }
}

async function markQueueRow(
  id: number,
  patch: Record<string, unknown>
): Promise<void> {
  const supabase = getSupabaseAdmin()
  await supabase
    .from("macwall_trial_ended_queue")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
}

async function cancelPendingForVisitor(
  visitorId: string,
  skipReason: string
): Promise<void> {
  const supabase = getSupabaseAdmin()
  await supabase
    .from("macwall_trial_ended_queue")
    .update({
      status: "cancelled",
      skip_reason: skipReason,
      updated_at: new Date().toISOString(),
    })
    .eq("visitor_id", visitorId)
    .eq("status", "pending")
}

async function leadUnsubscribed(
  visitorId: string,
  email: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from("macwall_trial_leads")
    .select("unsubscribed_at")
    .eq("visitor_id", visitorId)
    .maybeSingle()
  if (data?.unsubscribed_at) return true

  const { data: byEmail } = await supabase
    .from("macwall_trial_leads")
    .select("unsubscribed_at")
    .eq("email", email.trim().toLowerCase())
    .not("unsubscribed_at", "is", null)
    .limit(1)
  return Boolean(byEmail?.[0]?.unsubscribed_at)
}

async function enqueueLadderFollowUps(input: {
  visitorId: string
  email: string
  sentAtMs: number
}): Promise<void> {
  const supabase = getSupabaseAdmin()
  const now = Date.now()
  const age = now - input.sentAtMs
  const twentyAt =
    age >= LADDER_20_AFTER_MS
      ? new Date(now + 5 * 60 * 1000)
      : new Date(input.sentAtMs + LADDER_20_AFTER_MS)
  const thirtyAt =
    age >= LADDER_30_AFTER_MS
      ? new Date(now + 30 * 60 * 1000)
      : new Date(input.sentAtMs + LADDER_30_AFTER_MS)

  const rows: { step: TrialEndedEmailStep; at: string }[] = [
    { step: "ladder_20", at: twentyAt.toISOString() },
    { step: "ladder_30", at: thirtyAt.toISOString() },
  ]

  for (const follow of rows) {
    const { data: existing } = await supabase
      .from("macwall_trial_ended_queue")
      .select("id")
      .eq("visitor_id", input.visitorId)
      .eq("step", follow.step)
      .maybeSingle()
    if (existing) continue

    await supabase.from("macwall_trial_ended_queue").insert({
      visitor_id: input.visitorId,
      email: input.email,
      step: follow.step,
      scheduled_send_at: follow.at,
      status: "pending",
      updated_at: new Date().toISOString(),
    })
  }
}

async function processQueueRow(
  row: QueueRow,
  resend: Resend
): Promise<"sent" | "skipped" | "failed"> {
  const supabase = getSupabaseAdmin()
  const step = parseStep(row.step)
  if (!step) {
    await markQueueRow(row.id, { status: "skipped", skip_reason: "invalid_step" })
    return "skipped"
  }

  const email = row.email.trim().toLowerCase()
  if (!email) {
    await markQueueRow(row.id, { status: "skipped", skip_reason: "no_email" })
    return "skipped"
  }

  const { data: converted } = await supabase.rpc("macwall_email_converted", {
    p_email: email,
  })
  if (converted === true) {
    await cancelPendingForVisitor(row.visitor_id, "converted")
    await markQueueRow(row.id, { status: "cancelled", skip_reason: "converted" })
    return "skipped"
  }

  if (await leadUnsubscribed(row.visitor_id, email)) {
    await cancelPendingForVisitor(row.visitor_id, "unsubscribed")
    await markQueueRow(row.id, {
      status: "cancelled",
      skip_reason: "unsubscribed",
    })
    return "skipped"
  }

  const promo = trialEndedPromo(step)
  const copy = trialEndedCopy(step, appName())
  const untilUnix = promo.expiresHours
    ? Math.floor(Date.now() / 1000) + promo.expiresHours * 3600
    : undefined
  const href = checkoutHref(promo.code, untilUnix)
  const unsub = await unsubscribeUrls(email)

  const { error: insErr } = await supabase.from("macwall_trial_ended_emails").insert({
    visitor_id: row.visitor_id,
    step,
    customer_email: email,
  })
  if (insErr) {
    const code = (insErr as { code?: string }).code
    if (code === "23505") {
      await markQueueRow(row.id, {
        status: "skipped",
        skip_reason: "already_sent",
      })
      return "skipped"
    }
    console.error(
      "[trial-ended] audit_insert_failed_continuing",
      insErr.message
    )
  }

  const headers: Record<string, string> = {}
  if (unsub?.oneClick) {
    headers["List-Unsubscribe"] = `<${unsub.oneClick}>`
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"
  }

  const { data, error } = await resend.emails.send(
    {
      from: fromAddress(),
      to: [email],
      subject: copy.subject,
      react: TrialEndedEmail({
        step,
        appName: appName(),
        logoUrl: logoUrl(),
        checkoutHref: href,
        unsubscribeHref: unsub?.page ?? null,
      }),
      text: trialEndedPlainText({
        step,
        appName: appName(),
        checkoutHref: href,
        unsubscribeHref: unsub?.page ?? null,
        supportEmail: supportEmail(),
      }),
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      tags: [
        { name: "category", value: "trial_ended" },
        { name: "step", value: step },
      ],
    },
    { idempotencyKey: `trial-ended/${row.visitor_id}/${step}` }
  )

  if (error) {
    await supabase
      .from("macwall_trial_ended_emails")
      .delete()
      .eq("visitor_id", row.visitor_id)
      .eq("step", step)
    console.error("[trial-ended] resend_failed", error.message)
    return "failed"
  }

  await markQueueRow(row.id, {
    status: "sent",
    sent_at: new Date().toISOString(),
    resend_id: data?.id ?? null,
  })

  if (step === "ended") {
    await enqueueLadderFollowUps({
      visitorId: row.visitor_id,
      email,
      sentAtMs: Date.now(),
    })
  }

  return "sent"
}

export async function processTrialEndedEmails(): Promise<{
  ok: true
  enqueued: number
  processed: number
  sent: number
  skipped: number
  failed: number
}> {
  const resendKey = process.env.RESEND_API_KEY?.trim()
  if (!resendKey) {
    throw new Error("missing_resend_api_key")
  }

  const supabase = getSupabaseAdmin()
  const resend = new Resend(resendKey)

  const { data: enqueued, error: enqueueError } = await supabase.rpc(
    "enqueue_macwall_trial_ended_emails",
    { p_limit: ENQUEUE_LIMIT }
  )
  if (enqueueError) {
    console.error("[trial-ended] enqueue_failed", enqueueError.message)
  }

  const now = new Date().toISOString()
  const { data: rows, error } = await supabase
    .from("macwall_trial_ended_queue")
    .select("id, visitor_id, email, step")
    .eq("status", "pending")
    .lte("scheduled_send_at", now)
    .order("scheduled_send_at", { ascending: true })
    .limit(SEND_LIMIT)

  if (error) {
    throw new Error(error.message)
  }

  let sent = 0
  let skipped = 0
  let failed = 0

  for (const row of (rows ?? []) as QueueRow[]) {
    const result = await processQueueRow(row, resend)
    if (result === "sent") sent += 1
    else if (result === "skipped") skipped += 1
    else failed += 1
  }

  return {
    ok: true,
    enqueued: typeof enqueued === "number" ? enqueued : 0,
    processed: (rows ?? []).length,
    sent,
    skipped,
    failed,
  }
}
