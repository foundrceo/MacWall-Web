import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2.105.4"

import { buildLifecycleEmail, emailLooksDeliverable } from "../_shared/lifecycle-emails.ts"
import {
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
 * limit?, dryRun? }.
 *
 *   customer   active license emails (service notice; skips suppressed and
 *              undeliverable addresses)
 *   trial      trial leads who never bought, minus unsubscribed, suppressed
 *              and undeliverable addresses
 *
 * Every address is logged in macwall_app_update_emails, so re-running never
 * emails anyone twice. No discount, no checkout link: the button goes to the
 * download page.
 */

const MAX_BATCH = 200
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
    const sample = buildLifecycleEmail(audience === "customer" ? "app_update_customer" : "app_update_trial", {
      appName, siteUrl: siteBaseUrl(), logoUrl: logoUrl(), supportEmail: supportEmail(),
      postalAddress: postalAddress(), unsubscribeHref: `${siteBaseUrl()}/unsubscribe/trial?t=…`,
      checkoutHref: `${siteBaseUrl()}/download`, updateVersion: version,
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
    const mail = buildLifecycleEmail(audience === "customer" ? "app_update_customer" : "app_update_trial", {
      appName,
      siteUrl: siteBaseUrl(),
      logoUrl: logoUrl(),
      supportEmail: supportEmail(),
      postalAddress: postalAddress(),
      unsubscribeHref: unsub?.page ?? null,
      checkoutHref: `${siteBaseUrl()}/download?utm_source=email&utm_medium=update&utm_campaign=${encodeURIComponent(campaign)}`,
      updateVersion: version,
    })
    const result = await sendMarketingEmail({
      resendKey,
      from,
      to: email,
      mail,
      unsubscribeOneClick: unsub?.oneClick ?? null,
      idempotencyKey: `update/${campaign}/${email}`,
      tags: [
        { name: "category", value: "app_update" },
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
