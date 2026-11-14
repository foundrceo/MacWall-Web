import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2.105.4"

import {
  BLACK_FRIDAY_SALE,
  buildLifecycleEmail,
} from "../_shared/lifecycle-emails.ts"
import {
  lifecycleCheckoutHref,
  marketingFrom,
  logoUrl,
  marketingBlockReason,
  postalAddress,
  sendMarketingEmail,
  siteBaseUrl,
  supportEmail,
  unsubscribeUrlsFor,
} from "../_shared/lifecycle-send.ts"

/**
 * One-off campaign emails, run in batches until `remaining` is 0.
 * POST { campaign, audience, limit?, dryRun?, from? }.
 *
 *   black_friday  trial users whose trial is over and who never bought,
 *              minus known India visitors and anyone mailed in the last 20
 *              hours, newest first. BLACKFRIDAY rides on the checkout link.
 *   black_friday_checkout  people outside India who opened a checkout, never
 *              bought and never started a trial. Same offer, without the
 *              "you tried MacWall" wording.
 *
 * Every address is logged in macwall_app_update_emails, so re-running never
 * emails anyone twice (the 20-hour cap then counts it).
 *
 * The function keeps its original name. It used to send the per-release
 * "please update" emails, the 50% win-back and the Diwali sale, all removed.
 */

const MAX_BATCH = 200

/** Mail content for one address. */
function mailFor(args: {
  audience: Audience
  email: string
  campaign: string
  appName: string
  unsubscribeHref: string | null
}) {
  const checkoutOnly = args.audience === "black_friday_checkout"
  return buildLifecycleEmail("black_friday_sale", {
    checkoutOnly,
    // The secondary link is tracked under the same campaign as the button.
    utmCampaign: args.campaign,
    appName: args.appName,
    siteUrl: siteBaseUrl(),
    logoUrl: logoUrl(),
    supportEmail: supportEmail(),
    postalAddress: postalAddress(),
    unsubscribeHref: args.unsubscribeHref,
    checkoutHref: lifecycleCheckoutHref({
      promoCode: BLACK_FRIDAY_SALE.code,
      email: args.email,
      medium: checkoutOnly ? "recovery" : "trial",
      campaign: args.campaign,
    }),
  })
}

const SEND_GAP_MS = 150

type Supabase = ReturnType<typeof createClient>
type Audience = "black_friday" | "black_friday_checkout"

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
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
  const audience =
    body.audience === "black_friday" || body.audience === "black_friday_checkout"
      ? body.audience
      : null
  const limit = Math.min(Math.max(Number(body.limit) || 50, 1), MAX_BATCH)
  const dryRun = body.dryRun === true
  if (!campaign || !audience) {
    return Response.json(
      { ok: false, error: "campaign and audience (black_friday or black_friday_checkout) are required" },
      { status: 400 }
    )
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  const resendKey = Deno.env.get("RESEND_API_KEY")?.trim()
  // Optional sender for a campaign, e.g. "MacWall <hi@macwall.app>". Only
  // macwall.app and its subdomains are allowed.
  const fromOverride =
    typeof body.from === "string" && /^[^<>@]*<[a-z0-9._%+-]+@([a-z0-9-]+\.)?macwall\.app>$|^[a-z0-9._%+-]+@([a-z0-9-]+\.)?macwall\.app$/i.test(body.from.trim())
      ? body.from.trim()
      : null
  const licenseFrom = Deno.env.get("LICENSE_EMAIL_FROM")?.trim()
  const from = fromOverride || (licenseFrom ? marketingFrom(licenseFrom) : undefined)
  const appName = Deno.env.get("APP_NAME")?.trim() || "MacWall"
  if (!supabaseUrl || !serviceKey || !resendKey || !from) {
    return Response.json({ ok: false, error: "missing_config" }, { status: 500 })
  }
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const candidates = (pLimit: number, countOnly = false) => {
    const opts = countOnly ? { count: "exact" as const, head: true } : undefined
    return audience === "black_friday"
      ? supabase.rpc("macwall_black_friday_candidates", {
          p_campaign: campaign, p_limit: pLimit,
        }, opts)
      : supabase.rpc("macwall_black_friday_checkout_candidates", {
          p_campaign: campaign, p_limit: pLimit,
        }, opts)
  }
  // An exact count: the API caps returned rows at 1,000.
  const countLeft = async () => {
    const { count, error } = await candidates(100000, true)
    return { count: count ?? 0, error }
  }

  if (dryRun) {
    const { count, error } = await countLeft()
    if (error) return Response.json({ ok: false, error: error.message }, { status: 500 })
    const sample = mailFor({
      audience, email: "someone@example.com", campaign, appName,
      unsubscribeHref: `${siteBaseUrl()}/unsubscribe/trial?t=…`,
    })
    return Response.json({ ok: true, dryRun: true, candidates: count, from, subject: sample.subject, text: sample.text })
  }

  const { data: rows, error } = await candidates(limit)
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 })

  const counts = { sent: 0, skipped: 0, failed: 0 }
  let rateLimited = false
  try {
  for (const { email } of (rows ?? []) as { email: string }[]) {
    const blocked = await marketingBlockReason(supabase, email)
    if (blocked) {
      await log(supabase, { campaign, email, audience, status: "skipped", skip_reason: blocked })
      counts.skipped += 1
      continue
    }
    const unsub = await unsubscribeUrlsFor(email)
    const mail = mailFor({
      audience, email, campaign, appName,
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
        { name: "category", value: audience },
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

  const { count: remaining } = await countLeft()
  return Response.json({ ok: true, ...counts, rate_limited: rateLimited, remaining })
})
