import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2.105.4"

import {
  LIFECYCLE_PROMO,
  buildLifecycleEmail,
  emailLooksDeliverable,
  type LifecycleEmailContext,
  type LifecycleEmailId,
} from "../_shared/lifecycle-emails.ts"
import {
  lifecycleCheckoutHref,
  logoUrl,
  marketingBlockReason,
  postalAddress,
  sendMarketingEmail,
  siteBaseUrl,
  supportEmail,
  unsubscribeUrlsFor,
} from "../_shared/lifecycle-send.ts"

/**
 * One-off "please update" email for an app release, run in batches until
 * `remaining` is 0. POST { campaign, version, audience: "customer" | "trial",
 * offer?: "thirty_24h", limit?, dryRun? }.
 *
 *   customer   active license emails (service notice; skips suppressed and
 *              undeliverable addresses)
 *   trial      trial leads who never bought, minus unsubscribed, suppressed
 *              and undeliverable addresses
 *
 * Every address is logged in macwall_app_update_emails, so re-running never
 * emails anyone twice (the 20-hour cap then counts it). Without `offer` the
 * button goes to the download page. With `offer: "thirty_24h"` (trial only)
 * the button is checkout with the 30% code, valid 24 hours from each send.
 */

const MAX_BATCH = 200

/** Mail content for one address. `untilUnix` limits the 30% code to 24 hours from this send. */
function mailFor(args: {
  audience: Audience
  offer: boolean
  email: string
  campaign: string
  version: string
  appName: string
  unsubscribeHref: string | null
}) {
  const download = `${siteBaseUrl()}/download?utm_source=email&utm_medium=update&utm_campaign=${encodeURIComponent(args.campaign)}`
  const id: LifecycleEmailId = args.audience === "customer"
    ? "app_update_customer"
    : args.offer ? "app_update_trial_offer" : "app_update_trial"
  const ctx: LifecycleEmailContext = {
    appName: args.appName,
    siteUrl: siteBaseUrl(),
    logoUrl: logoUrl(),
    supportEmail: supportEmail(),
    postalAddress: postalAddress(),
    unsubscribeHref: args.unsubscribeHref,
    checkoutHref: args.offer
      ? lifecycleCheckoutHref({
          promoCode: LIFECYCLE_PROMO.thirty.code,
          untilUnix: Math.floor(Date.now() / 1000) + LIFECYCLE_PROMO.thirty.validHours * 3600,
          email: args.email,
          medium: "trial",
          campaign: args.campaign,
        })
      : download,
    downloadHref: download,
    updateVersion: args.version,
  }
  return buildLifecycleEmail(id, ctx)
}
const SEND_GAP_MS = 150

type Supabase = ReturnType<typeof createClient>
type Audience = "customer" | "trial"

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function blockReason(supabase: Supabase, audience: Audience, email: string) {
  if (audience === "trial") return await marketingBlockReason(supabase, email)
  if (!emailLooksDeliverable(email)) return "invalid_address"
  const { data: suppressed } = await supabase.rpc("macwall_email_suppressed", { p_email: email })
  return suppressed === true ? "suppressed" : null
}

async function log(
  supabase: Supabase,
  row: { campaign: string; email: string; audience: Audience; status: "sent" | "skipped"; skip_reason?: string | null; resend_id?: string | null }
) {
  const { error } = await supabase
    .from("macwall_app_update_emails")
    .upsert(row, { onConflict: "campaign,email", ignoreDuplicates: true })
  // Without the log the next batch would pick the same people again: stop.
  if (error) throw new Error(`log_failed: ${error.message}`)
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("POST only", { status: 405 })

  const cronSecret = Deno.env.get("CRON_SECRET")?.trim()
  const authHeader = req.headers.get("authorization")?.trim()
  const cronHeader = req.headers.get("x-cron-secret")?.trim()
  const authorized =
    (cronSecret && cronHeader === cronSecret) ||
    (authHeader?.startsWith("Bearer ") &&
      authHeader.slice(7) === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim())
  if (!authorized) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
  const campaign = typeof body.campaign === "string" ? body.campaign.trim() : ""
  const version = typeof body.version === "string" ? body.version.trim() : ""
  const audience = body.audience === "customer" || body.audience === "trial" ? body.audience : null
  const limit = Math.min(Math.max(Number(body.limit) || 50, 1), MAX_BATCH)
  const dryRun = body.dryRun === true
  const offer = body.offer === "thirty_24h"
  if (offer && audience !== "trial") {
    return Response.json({ ok: false, error: "the offer is for the trial audience only" }, { status: 400 })
  }
  if (!campaign || !version || !audience) {
    return Response.json({ ok: false, error: "campaign, version and audience are required" }, { status: 400 })
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  const resendKey = Deno.env.get("RESEND_API_KEY")?.trim()
  const from = Deno.env.get("LICENSE_EMAIL_FROM")?.trim()
  const appName = Deno.env.get("APP_NAME")?.trim() || "MacWall"
  if (!supabaseUrl || !serviceKey || !resendKey || !from) {
    return Response.json({ ok: false, error: "missing_config" }, { status: 500 })
  }
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  if (dryRun) {
    const { data, error } = await supabase.rpc("macwall_app_update_candidates", {
      p_campaign: campaign, p_audience: audience, p_limit: 100000,
    })
    if (error) return Response.json({ ok: false, error: error.message }, { status: 500 })
    const sample = mailFor({
      audience, offer, email: "someone@example.com", campaign, version, appName,
      unsubscribeHref: `${siteBaseUrl()}/unsubscribe/trial?t=…`,
    })
    return Response.json({ ok: true, dryRun: true, candidates: (data ?? []).length, from, subject: sample.subject, text: sample.text })
  }

  const { data: rows, error } = await supabase.rpc("macwall_app_update_candidates", {
    p_campaign: campaign, p_audience: audience, p_limit: limit,
  })
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 })

  const counts = { sent: 0, skipped: 0, failed: 0 }
  let rateLimited = false
  try {
  for (const { email } of (rows ?? []) as { email: string }[]) {
    const blocked = await blockReason(supabase, audience, email)
    if (blocked) {
      await log(supabase, { campaign, email, audience, status: "skipped", skip_reason: blocked })
      counts.skipped += 1
      continue
    }
    const unsub = await unsubscribeUrlsFor(email)
    const mail = mailFor({
      audience, offer, email, campaign, version, appName,
      unsubscribeHref: unsub?.page ?? null,
    })
    const result = await sendMarketingEmail({
      resendKey,
      from,
      to: email,
      mail,
      unsubscribeOneClick: unsub?.oneClick ?? null,
      idempotencyKey: `update/${campaign}/${email}`,
      tags: [
        { name: "category", value: offer ? "app_update_offer" : "app_update" },
        { name: "campaign", value: campaign.replace(/[^A-Za-z0-9_-]/g, "_") },
      ],
    })
    if (!result.ok) {
      if (result.rateLimited) { rateLimited = true; break }
      // Logged so one bad address can't keep the batches from finishing.
      await log(supabase, { campaign, email, audience, status: "skipped", skip_reason: "send_failed" })
      counts.failed += 1
      continue
    }
    await log(supabase, { campaign, email, audience, status: "sent", resend_id: result.id })
    counts.sent += 1
    await sleep(SEND_GAP_MS)
  }
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "error", ...counts },
      { status: 500 }
    )
  }

  const { data: left } = await supabase.rpc("macwall_app_update_candidates", {
    p_campaign: campaign, p_audience: audience, p_limit: 100000,
  })
  return Response.json({ ok: true, ...counts, rate_limited: rateLimited, remaining: (left ?? []).length })
})
