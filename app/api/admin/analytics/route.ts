import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import {
  buildClicksByLocation,
  buildDailyCountsFallback,
  buildDownloadFunnel,
  buildTopPageViews,
  countEventsByName,
  fetchEventsInRange,
  fetchLatestEventAt,
  type DailyRow,
} from "@/lib/analytics/admin-metrics"
import {
  fetchTopLikedWallpapers,
  fetchWallpaperCategoryCounts,
} from "@/lib/admin/wallpapers"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export const runtime = "nodejs"

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
      eventCounts,
      dailyResult,
      funnelRows,
      pageViewRows,
      lastEventAt,
      uploadsResult,
      catalogResult,
      likesResult,
      licensesResult,
      categoryCounts,
      topLikedWallpapers,
    ] = await Promise.all([
      countEventsByName(supabase, sinceIso),
      supabase.rpc("admin_analytics_daily_counts", { p_since: sinceIso }),
      fetchEventsInRange(supabase, sinceIso, [
        "download_click",
        "download_redirect",
        "pricing_click",
      ]),
      fetchEventsInRange(supabase, sinceIso, ["page_view"]),
      fetchLatestEventAt(supabase),
      supabase.from("community_uploads").select("status"),
      supabase.from("wallpapers").select("id", { count: "exact", head: true }),
      supabase
        .from("wallpaper_likes")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("macwall_license_devices")
        .select("id", { count: "exact", head: true }),
      fetchWallpaperCategoryCounts(),
      fetchTopLikedWallpapers(8),
    ])

    const uploadTotals = { pending: 0, approved: 0, rejected: 0 }
    for (const row of uploadsResult.data ?? []) {
      const status = row.status as keyof typeof uploadTotals
      if (status in uploadTotals) uploadTotals[status] += 1
    }

    let dailyCounts: DailyRow[] = []
    if (!dailyResult.error && Array.isArray(dailyResult.data)) {
      dailyCounts = dailyResult.data as DailyRow[]
    } else {
      dailyCounts = buildDailyCountsFallback(
        await fetchEventsInRange(supabase, sinceIso),
        sinceIso
      )
    }

    const downloadFunnel = buildDownloadFunnel(funnelRows)
    const downloadClicksByLocation = buildClicksByLocation(
      funnelRows,
      "download_click"
    )
    const pricingClicksByLocation = buildClicksByLocation(
      funnelRows,
      "pricing_click"
    )
    const topPages = buildTopPageViews(pageViewRows)
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
      lastEventAt,
      eventCounts,
      dailyCounts,
      downloadFunnel,
      downloadClicksByLocation,
      pricingClicksByLocation,
      downloadDaily,
      topPages,
      communityUploads: uploadTotals,
      catalogWallpaperCount: catalogResult.count ?? 0,
      totalLikes: likesResult.count ?? 0,
      activatedDevices: licensesResult.count ?? 0,
      wallpaperCategoryCounts: categoryCounts,
      topLikedWallpapers,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load analytics"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
