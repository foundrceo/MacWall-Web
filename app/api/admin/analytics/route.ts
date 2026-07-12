import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

type EventCountRow = { event_name: string; count: number }
type DailyRow = { day: string; event_name: string; count: number }
type DownloadLocationRow = { location: string; count: number }

type AnalyticsEventRow = {
  event_name: string
  created_at?: string
  metadata?: { location?: string } | null
  session_id?: string | null
}

export async function GET(request: Request) {
  const denied = await requireAdminApi()
  if (denied) return denied

  try {
    const { searchParams } = new URL(request.url)
    const days = Math.min(
      90,
      Math.max(1, Number.parseInt(searchParams.get("days") ?? "30", 10) || 30)
    )

    const since = new Date()
    since.setUTCDate(since.getUTCDate() - days)
    const sinceIso = since.toISOString()

    const supabase = getSupabaseAdmin()

    const [
      eventsResult,
      dailyResult,
      topPathsResult,
      uploadsResult,
      catalogResult,
      likesResult,
      licensesResult,
    ] = await Promise.all([
      supabase
        .from("site_analytics_events")
        .select("event_name,created_at,metadata,session_id")
        .gte("created_at", sinceIso),
      supabase.rpc("admin_analytics_daily_counts", {
        p_since: sinceIso,
      }),
      supabase
        .from("site_analytics_events")
        .select("path")
        .gte("created_at", sinceIso)
        .not("path", "is", null),
      supabase.from("community_uploads").select("status"),
      supabase.from("wallpapers").select("id", { count: "exact", head: true }),
      supabase
        .from("wallpaper_likes")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("macwall_license_devices")
        .select("id", { count: "exact", head: true }),
    ])

    if (eventsResult.error) throw new Error(eventsResult.error.message)

    const eventTotals = new Map<string, number>()
    for (const row of eventsResult.data ?? []) {
      const name = row.event_name as string
      eventTotals.set(name, (eventTotals.get(name) ?? 0) + 1)
    }

    const eventCounts: EventCountRow[] = [...eventTotals.entries()]
      .map(([event_name, count]) => ({ event_name, count }))
      .sort((a, b) => b.count - a.count)

    const uploadTotals = { pending: 0, approved: 0, rejected: 0 }
    for (const row of uploadsResult.data ?? []) {
      const status = row.status as keyof typeof uploadTotals
      if (status in uploadTotals) uploadTotals[status] += 1
    }

    const pathTotals = new Map<string, number>()
    for (const row of topPathsResult.data ?? []) {
      const path = row.path as string
      if (!path) continue
      pathTotals.set(path, (pathTotals.get(path) ?? 0) + 1)
    }

    const topPaths = [...pathTotals.entries()]
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12)

    const eventRows = (eventsResult.data ?? []) as AnalyticsEventRow[]

    let dailyCounts: DailyRow[] = []
    if (!dailyResult.error && Array.isArray(dailyResult.data)) {
      dailyCounts = dailyResult.data as DailyRow[]
    } else {
      dailyCounts = buildDailyCountsFallback(eventRows, sinceIso)
    }

    const downloadFunnel = buildDownloadFunnel(eventRows)
    const downloadClicksByLocation = buildDownloadClicksByLocation(eventRows)
    const downloadDaily = dailyCounts
      .filter(
        (row) =>
          row.event_name === "download_click" ||
          row.event_name === "download_redirect"
      )
      .sort((a, b) => a.day.localeCompare(b.day))

    return NextResponse.json({
      rangeDays: days,
      since: sinceIso,
      eventCounts,
      dailyCounts,
      downloadFunnel,
      downloadClicksByLocation,
      downloadDaily,
      topPaths,
      communityUploads: uploadTotals,
      catalogWallpaperCount: catalogResult.count ?? 0,
      totalLikes: likesResult.count ?? 0,
      activatedDevices: licensesResult.count ?? 0,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load analytics"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function buildDownloadFunnel(rows: AnalyticsEventRow[]) {
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
    clicks > 0
      ? Math.round((redirects / clicks) * 100)
      : redirects > 0
        ? 100
        : 0

  return {
    clicks,
    redirects,
    uniqueRedirectSessions: uniqueRedirectSessions.size,
    completionRate,
  }
}

function buildDownloadClicksByLocation(
  rows: AnalyticsEventRow[]
): DownloadLocationRow[] {
  const totals = new Map<string, number>()

  for (const row of rows) {
    if (row.event_name !== "download_click") continue
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

function buildDailyCountsFallback(
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
