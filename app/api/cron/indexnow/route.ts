import { NextResponse } from "next/server"

import sitemap from "@/app/sitemap"
import { appKv } from "@/lib/env/worker-bindings"
import { secretsEqual } from "@/lib/http/secrets"
import {
  indexNowConfig,
  sitemapUrlsChangedSince,
  submitToIndexNow,
} from "@/lib/seo/indexnow"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 120

const DAY_MS = 24 * 60 * 60 * 1000
/** When the run has no record of the last one (first run, KV unavailable). */
const DEFAULT_LOOKBACK_MS = 2 * DAY_MS
const LAST_RUN_KEY = "macwall:seo:indexnow:last-run"
/** Forget the cursor after a quiet quarter; the default lookback takes over. */
const LAST_RUN_TTL_S = 90 * 24 * 60 * 60

function startOfUtcDay(ms: number): number {
  return Math.floor(ms / DAY_MS) * DAY_MS
}

/**
 * Cron (daily) → submit sitemap URLs changed since the last successful run
 * to IndexNow: new and edited wallpaper pages, collections, and docs or blog
 * posts with a new `updatedAt`. The cursor is the last run's time in KV.
 * No-op until INDEXNOW_KEY is set. Auth is CRON_SECRET only.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim()
  if (!cronSecret) {
    return NextResponse.json(
      { ok: false, error: "missing_cron_secret" },
      { status: 500 }
    )
  }
  const auth = request.headers.get("authorization")?.trim()
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : ""
  if (!token || !secretsEqual(token, cronSecret)) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 }
    )
  }

  if (!indexNowConfig()) {
    console.info("[cron/indexnow] skipped: INDEXNOW_KEY is not set")
    return NextResponse.json({ ok: true, skipped: "not_configured" })
  }

  const now = Date.now()
  const kv = await appKv()
  const lastRun = Date.parse(
    (await kv?.get(LAST_RUN_KEY).catch(() => null)) ?? ""
  )
  // Lastmods can be date-only (midnight UTC), so start at the beginning of
  // the last run's day: a page edited after that run still has its date.
  const since = Number.isFinite(lastRun)
    ? startOfUtcDay(Math.min(lastRun, now))
    : now - DEFAULT_LOOKBACK_MS

  let urls: string[]
  try {
    urls = sitemapUrlsChangedSince(await sitemap(), since)
  } catch (error) {
    // Catalog outage: keep the cursor so the next run covers this window.
    const message = error instanceof Error ? error.message : "sitemap_failed"
    console.error("[cron/indexnow] sitemap failed:", message)
    return NextResponse.json({ ok: false, error: message }, { status: 502 })
  }

  const result = await submitToIndexNow(urls)
  if (result.status === "failed") {
    return NextResponse.json(
      { ok: false, since: new Date(since).toISOString(), result },
      { status: 502 }
    )
  }

  await kv
    ?.put(LAST_RUN_KEY, new Date(now).toISOString(), {
      expirationTtl: LAST_RUN_TTL_S,
    })
    .catch((error: unknown) => {
      console.warn(
        "[cron/indexnow] cursor not saved:",
        error instanceof Error ? error.message : error
      )
    })

  console.log(
    `[cron/indexnow] ${urls.length} URLs changed since ${new Date(since).toISOString()}: ${result.status}`
  )
  return NextResponse.json({
    ok: true,
    since: new Date(since).toISOString(),
    cursor: kv ? "kv" : "default-lookback",
    result,
  })
}
