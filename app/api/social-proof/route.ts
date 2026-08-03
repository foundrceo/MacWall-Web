import { NextResponse } from "next/server"
import type { SupabaseClient } from "@supabase/supabase-js"

import { getSupabaseAdmin } from "@/lib/supabase/admin"
import {
  EMPTY_SOCIAL_PROOF_FEED,
  type SocialProofFeed,
  type SocialProofPlan,
  type SocialProofPurchase,
} from "@/lib/social-proof/feed"

export const runtime = "nodejs"
/** Allow CDN caching via Cache-Control (no cookies/auth on this route). */
export const revalidate = 300

const RECENT_LIMIT = 24
const DAY_MS = 24 * 60 * 60 * 1000

type LicenseRow = {
  activated_at: string | null
  plan_slug?: string | null
  visitor_country?: string | null
}

function planFromSlug(slug: string | null | undefined): SocialProofPlan {
  return slug === "pro_plus" ? "pro_plus" : "pro"
}

function normalizeCountry(value: string | null | undefined): string | null {
  const code = value?.trim().toUpperCase()
  if (!code || !/^[A-Z]{2}$/.test(code) || code === "XX") return null
  return code
}

function isMissingRelation(message: string): boolean {
  return message.includes("does not exist")
}

async function fetchRecentPurchases(
  supabase: SupabaseClient
): Promise<SocialProofPurchase[]> {
  const run = (columns: string) =>
    supabase
      .from("macwall_licenses")
      .select(columns)
      .eq("status", "active")
      .not("activated_at", "is", null)
      .order("activated_at", { ascending: false })
      .limit(RECENT_LIMIT)

  let { data, error } = await run("activated_at, plan_slug, visitor_country")

  // Older deployments may lack visitor_country and/or plan_slug.
  if (error?.message.includes("visitor_country")) {
    ;({ data, error } = await run("activated_at, plan_slug"))
  }
  if (error?.message.includes("plan_slug")) {
    ;({ data, error } = await run("activated_at"))
  }

  if (error) {
    if (isMissingRelation(error.message)) return []
    throw new Error(error.message)
  }

  return ((data ?? []) as unknown as LicenseRow[])
    .filter((row): row is LicenseRow & { activated_at: string } =>
      Boolean(row.activated_at)
    )
    .map((row) => ({
      plan: planFromSlug(row.plan_slug),
      atIso: new Date(row.activated_at).toISOString(),
      country: normalizeCountry(row.visitor_country),
    }))
}

async function countActivatedSince(
  supabase: SupabaseClient,
  sinceIso: string | null
): Promise<number> {
  let query = supabase
    .from("macwall_licenses")
    .select("activated_at", { count: "exact", head: true })
    .eq("status", "active")
    .not("activated_at", "is", null)

  if (sinceIso) {
    query = query.gte("activated_at", sinceIso)
  }

  const { count, error } = await query
  if (error) {
    if (isMissingRelation(error.message)) return 0
    throw new Error(error.message)
  }
  return count ?? 0
}

async function buildFeed(): Promise<SocialProofFeed> {
  const supabase = getSupabaseAdmin()
  const now = Date.now()

  const [purchases, last24h, last7d, allTime] = await Promise.all([
    fetchRecentPurchases(supabase),
    countActivatedSince(supabase, new Date(now - DAY_MS).toISOString()),
    countActivatedSince(supabase, new Date(now - 7 * DAY_MS).toISOString()),
    countActivatedSince(supabase, null),
  ])

  return {
    purchases,
    stats: { last24h, last7d, allTime },
  }
}

/**
 * Volume reference + anonymized recent purchases for marketing social proof.
 * Never exposes emails, keys, or identifiable buyer data — only plan, time,
 * and optional ISO country code.
 */
export async function GET() {
  let feed = EMPTY_SOCIAL_PROOF_FEED

  try {
    feed = await buildFeed()
  } catch (error) {
    console.error(
      "[social-proof]",
      error instanceof Error ? error.message : "feed failed"
    )
  }

  return NextResponse.json(feed, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  })
}
