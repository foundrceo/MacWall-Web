import type { SupabaseClient } from "@supabase/supabase-js"

import { SITE_ANALYTICS_EVENTS } from "@/lib/analytics/events"

export type AnalyticsEventRow = {
  event_name: string
  created_at?: string
  path?: string | null
  metadata?: { location?: string; page?: string } | null
  session_id?: string | null
}

export type EventCountRow = { event_name: string; count: number }
export type DailyRow = { day: string; event_name: string; count: number }
export type LocationCountRow = { location: string; count: number }

const PAGE_SIZE = 1000

export async function countEventsByName(
  supabase: SupabaseClient,
  sinceIso: string
): Promise<EventCountRow[]> {
  const counts = await Promise.all(
    SITE_ANALYTICS_EVENTS.map(async (eventName) => {
      const { count, error } = await supabase
        .from("site_analytics_events")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sinceIso)
        .eq("event_name", eventName)

      if (error) throw new Error(error.message)
      return { event_name: eventName, count: count ?? 0 }
    })
  )

  return counts.filter((row) => row.count > 0).sort((a, b) => b.count - a.count)
}

export async function fetchEventsInRange(
  supabase: SupabaseClient,
  sinceIso: string,
  eventNames?: string[]
): Promise<AnalyticsEventRow[]> {
  const rows: AnalyticsEventRow[] = []
  let offset = 0

  while (true) {
    let query = supabase
      .from("site_analytics_events")
      .select("event_name,created_at,path,metadata,session_id")
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1)

    if (eventNames?.length) {
      query = query.in("event_name", eventNames)
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)

    const batch = (data ?? []) as AnalyticsEventRow[]
    rows.push(...batch)

    if (batch.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }

  return rows
}

export async function fetchLatestEventAt(
  supabase: SupabaseClient
): Promise<string | null> {
  const { data, error } = await supabase
    .from("site_analytics_events")
    .select("created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data?.created_at ?? null
}

export async function fetchDailyCounts(
  supabase: SupabaseClient,
  sinceIso: string
): Promise<DailyRow[]> {
  const { data, error } = await supabase.rpc("admin_analytics_daily_counts", {
    p_since: sinceIso,
  })

  if (!error && Array.isArray(data)) {
    return data.map((row) => ({
      day: String((row as { day: string }).day).slice(0, 10),
      event_name: String((row as { event_name: string }).event_name),
      count: Number((row as { count: number | string }).count),
    }))
  }

  return []
}

export function buildTopPageViews(
  rows: AnalyticsEventRow[],
  limit = 12
): Array<{ path: string; count: number }> {
  const totals = new Map<string, number>()

  for (const row of rows) {
    if (row.event_name !== "page_view") continue
    const path =
      (typeof row.metadata?.page === "string" && row.metadata.page) ||
      row.path ||
      ""
    if (!path) continue
    totals.set(path, (totals.get(path) ?? 0) + 1)
  }

  return [...totals.entries()]
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export function buildDownloadFunnel(rows: AnalyticsEventRow[]) {
  let clicks = 0
  let redirects = 0
  const uniqueRedirectSessions = new Set<string>()

  for (const row of rows) {
    if (row.event_name === "download_click") clicks += 1
    if (row.event_name === "download_redirect") {
      redirects += 1
      if (row.session_id) uniqueRedirectSessions.add(row.session_id)
    }
  }

  const completionRate =
    clicks > 0 ? Math.round((redirects / clicks) * 100) : 0

  return {
    clicks,
    redirects,
    uniqueRedirectSessions: uniqueRedirectSessions.size,
    completionRate,
  }
}

export function buildClicksByLocation(
  rows: AnalyticsEventRow[],
  eventName: "download_click" | "pricing_click"
): LocationCountRow[] {
  const totals = new Map<string, number>()

  for (const row of rows) {
    if (row.event_name !== eventName) continue
    const location =
      typeof row.metadata?.location === "string" && row.metadata.location.trim()
        ? row.metadata.location.trim()
        : "unknown"
    totals.set(location, (totals.get(location) ?? 0) + 1)
  }

  return [...totals.entries()]
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
}

export function buildDailyCountsFallback(
  rows: Array<{ event_name: string; created_at?: string }>,
  sinceIso: string
): DailyRow[] {
  const since = new Date(sinceIso).getTime()
  const totals = new Map<string, number>()

  for (const row of rows) {
    if (!row.created_at) continue
    const ts = new Date(row.created_at).getTime()
    if (ts < since) continue
    const day = row.created_at.slice(0, 10)
    const key = `${day}|${row.event_name}`
    totals.set(key, (totals.get(key) ?? 0) + 1)
  }

  return [...totals.entries()].map(([key, count]) => {
    const [day, event_name] = key.split("|")
    return { day, event_name, count }
  })
}
