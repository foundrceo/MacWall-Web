import { NextResponse } from "next/server"

import { secretsEqual } from "@/lib/http/secrets"
import { getStripe } from "@/lib/stripe/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 300

const HOUR_S = 60 * 60
const DAY_S = 24 * HOUR_S
/** Every session gets a pending license row; unpaid ones expire after 1 h. */
const RECENT_WINDOW_S = 26 * HOUR_S
/** Historical sweep: one day per run, cycling through this many days. */
const HISTORY_DAYS = 120
const CRON_INTERVAL_S = 15 * 60
/** Session ids go in the query string; keep the URL well under proxy limits. */
const DELETE_CHUNK = 100

/**
 * Vercel Cron → delete `pending` license rows whose Stripe Checkout Session
 * has expired. An expired session can never be paid (delayed payment methods
 * leave the session `complete`, not `expired`), so these rows are dead: they
 * come from sessions warmed on hover/view, crawlers, and abandoned checkouts.
 * Opened checkouts stay recorded in `macwall_checkout_opens`, recovery rows
 * in their own queue, and every session in Stripe.
 *
 * Stateless: each run sweeps the last ~day, plus one older day chosen from the
 * clock so the whole history is covered every ~30 hours.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim()
  if (!cronSecret) {
    return NextResponse.json({ ok: false, error: "missing_cron_secret" }, { status: 500 })
  }
  const auth = request.headers.get("authorization")?.trim()
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : ""
  if (!token || !secretsEqual(token, cronSecret)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const now = Math.floor(Date.now() / 1000)
  const historyDay = 1 + (Math.floor(now / CRON_INTERVAL_S) % HISTORY_DAYS)
  const windows = [
    { gte: now - RECENT_WINDOW_S, lt: now },
    {
      gte: now - RECENT_WINDOW_S - historyDay * DAY_S,
      lt: now - RECENT_WINDOW_S - (historyDay - 1) * DAY_S,
    },
  ]

  try {
    const supabase = getSupabaseAdmin()
    // Whop checkouts never expire, so drop unpaid Whop rows after 14 days.
    // A late payment still activates: the webhook recreates a missing row.
    const { count: whopDeleted, error: whopError } = await supabase
      .from("macwall_licenses")
      .delete({ count: "exact" })
      .eq("source", "whop")
      .eq("status", "pending")
      .lt("created_at", new Date(Date.now() - 14 * DAY_S * 1000).toISOString())
    if (whopError) throw new Error(whopError.message)

    const stripe = getStripe()
    const expiredIds: string[] = []
    for (const created of windows) {
      for await (const session of stripe.checkout.sessions.list({
        status: "expired",
        created,
        limit: 100,
      })) {
        if (session.payment_status !== "paid") expiredIds.push(session.id)
      }
    }

    let deleted = whopDeleted ?? 0
    for (let i = 0; i < expiredIds.length; i += DELETE_CHUNK) {
      const { count, error } = await supabase
        .from("macwall_licenses")
        .delete({ count: "exact" })
        .in("stripe_checkout_session_id", expiredIds.slice(i, i + DELETE_CHUNK))
        .eq("status", "pending")
        .eq("source", "stripe")
      if (error) throw new Error(error.message)
      deleted += count ?? 0
    }

    return NextResponse.json({
      ok: true,
      expiredSessions: expiredIds.length,
      deletedPendingLicenses: deleted,
      historyDay,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "prune_failed"
    console.error("[cron/prune-checkouts]", message)
    return NextResponse.json({ ok: false, error: message }, { status: 502 })
  }
}
