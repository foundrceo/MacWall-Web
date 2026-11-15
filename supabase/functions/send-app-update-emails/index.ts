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
 * POST { campaign, audience, limit?, workers?, dryRun?, from? }.
 *
 *   black_friday  trial users whose trial is over and who never bought,
 *              minus known India visitors and anyone mailed in the last 20
 *              hours, newest first. BLACKFRIDAY rides on the checkout link.
 *   black_friday_checkout  people outside India who opened a checkout, never
 *              bought and never started a trial. Same offer, without the
 *              "you tried MacWall" wording.
 *
 *   affiliate  everyone who gave us an address (trial users and buyers):
 *              the affiliate program, not a sale. Buyers first, then the
 *              newest trials. The link goes to /affiliate.
 *
 * Every address is logged in macwall_app_update_emails, so re-running never
 * emails anyone twice (the 20-hour cap then counts it).
 *
 * The function keeps its original name. It used to send the per-release
 * "please update" emails, the 50% win-back and the Diwali sale, all removed.
 */

const MAX_BATCH = 600
/** Most addresses handled at once in one run (`workers` in the request). */
const MAX_WORKERS = 8

/** Mail content for one address. */
function mailFor(args: {
  audience: Audience
  email: string
  campaign: string
  appName: string
  unsubscribeHref: string | null
  isBuyer?: boolean
}) {
  if (args.audience === "affiliate") {
    const site = siteBaseUrl()
    return buildLifecycleEmail("affiliate_campaign", {
      isBuyer: args.isBuyer === true,
      utmCampaign: args.campaign,
      appName: args.appName,
      siteUrl: site,
      logoUrl: logoUrl(),
      supportEmail: supportEmail(),
      postalAddress: postalAddress(),
      unsubscribeHref: args.unsubscribeHref,
      checkoutHref: `${site}/affiliate?utm_source=email&utm_medium=campaign&utm_campaign=${encodeURIComponent(args.campaign)}`,
    })
  }
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
/** With several workers: each starts one email this often. */
const WORKER_CYCLE_MS = 950
const WORKER_STAGGER_MS = 120
const RATE_LIMIT_BACKOFF_MS = 1500
const MAX_RATE_LIMIT_HITS = 30

type Supabase = ReturnType<typeof createClient>
type Audience = "black_friday" | "black_friday_checkout" | "affiliate"

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
    body.audience === "black_friday" ||
    body.audience === "black_friday_checkout" ||
    body.audience === "affiliate"
      ? body.audience
      : null
  const limit = Math.min(Math.max(Number(body.limit) || 50, 1), MAX_BATCH)
  // 1 (default) sends one at a time; up to 8 for a campaign that must go out fast.
  const workers = Math.min(Math.max(Math.floor(Number(body.workers) || 1), 1), MAX_WORKERS)
  const dryRun = body.dryRun === true
  if (!campaign || !audience) {
    return Response.json(
      { ok: false, error: "campaign and audience (black_friday, black_friday_checkout or affiliate) are required" },
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
    if (audience === "affiliate") {
      return supabase.rpc("macwall_affiliate_campaign_candidates", {
        p_campaign: campaign, p_limit: pLimit,
      }, opts)
    }
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
  const queue = [...((rows ?? []) as { email: string; is_buyer?: boolean }[])]
  // With several workers, each starts one email about every second, which
  // keeps the total under Resend's 10 requests a second.
  const cycleMs = workers > 1 ? WORKER_CYCLE_MS : SEND_GAP_MS
  let stop = false
  let rateLimitHits = 0

  /** Sends one address; false means "put it back, Resend asked us to slow down". */
  const sendOne = async (email: string, isBuyer: boolean): Promise<boolean> => {
    // The affiliate email is not a sales pitch, so owners get it too.
    const blocked = await marketingBlockReason(supabase, email, {
      allowBuyers: audience === "affiliate",
    })
    if (blocked) {
      await log(supabase, { campaign, email, audience, status: "skipped", skip_reason: blocked })
      counts.skipped += 1
      return true
    }
    const unsub = await unsubscribeUrlsFor(email)
    const mail = mailFor({
      audience, email, campaign, appName,
      unsubscribeHref: unsub?.page ?? null,
      isBuyer,
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
      if (result.rateLimited) return false
      // Logged so one bad address can't keep the batches from finishing.
      await log(supabase, { campaign, email, audience, status: "skipped", skip_reason: "send_failed" })
      counts.failed += 1
      return true
    }
    await log(supabase, { campaign, email, audience, status: "sent", resend_id: result.id })
    counts.sent += 1
    return true
  }

  const worker = async (index: number) => {
    // Start the workers a moment apart so they don't all hit Resend at once.
    if (index > 0) await sleep(index * WORKER_STAGGER_MS)
    while (!stop) {
      const row = queue.shift()
      if (!row) return
      const started = Date.now()
      const done = await sendOne(row.email, row.is_buyer === true)
      if (!done) {
        // Rate limited: with one worker stop (the next run continues); with
        // several, back off and retry a few times before giving up.
        rateLimited = true
        rateLimitHits += 1
        queue.unshift(row)
        if (workers === 1 || rateLimitHits > MAX_RATE_LIMIT_HITS) {
          stop = true
          return
        }
        await sleep(RATE_LIMIT_BACKOFF_MS)
        continue
      }
      const wait = cycleMs - (workers > 1 ? Date.now() - started : 0)
      if (wait > 0) await sleep(wait)
    }
  }

  try {
    await Promise.all(Array.from({ length: workers }, (_, index) => worker(index)))
  } catch (error) {
    stop = true
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "error", ...counts },
      { status: 500 }
    )
  }

  const { count: remaining } = await countLeft()
  return Response.json({ ok: true, ...counts, rate_limited: rateLimited, remaining })
})
