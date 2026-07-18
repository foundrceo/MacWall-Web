import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import {
  buildConversionFunnel,
  buildSalesSummary,
  fetchAllDeviceActivations,
  fetchAllSales,
} from "@/lib/admin/sales"
import {
  buildClicksByLocation,
  buildDailyCountsFallback,
  buildDownloadFunnel,
  buildIndiaAudienceMetrics,
  buildTopPageViews,
  buildVisitorsByCountry,
  fetchDailyCounts,
  fetchEventsInRange,
  fetchLatestEventAt,
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
      Math.max(1, Number.parseInt(searchParams.get("days") ?? "7", 10) || 7)
    )

    const since = new Date()
    since.setUTCDate(since.getUTCDate() - days)
    const sinceIso = since.toISOString()

    const supabase = getSupabaseAdmin()

    const [
      eventRows,
      lastEventAt,
      uploadsResult,
      wallpaperCountResult,
      likesResult,
      categoryCounts,
      topLikedWallpapers,
      dailyCountsRpc,
      allSales,
      allDevices,
    ] = await Promise.all([
      fetchEventsInRange(supabase, sinceIso),
      fetchLatestEventAt(supabase),
      supabase.from("community_uploads").select("status"),
      supabase.from("wallpapers").select("id", { count: "exact", head: true }),
      supabase
        .from("wallpaper_likes")
        .select("id", { count: "exact", head: true }),
      fetchWallpaperCategoryCounts(),
      fetchTopLikedWallpapers(8),
      fetchDailyCounts(supabase, sinceIso),
      fetchAllSales(),
      fetchAllDeviceActivations(sinceIso),
    ])

    if (uploadsResult.error) throw new Error(uploadsResult.error.message)
    if (wallpaperCountResult.error) {
      throw new Error(wallpaperCountResult.error.message)
    }
    if (likesResult.error) throw new Error(likesResult.error.message)

    const eventTotals = new Map<string, number>()
    for (const row of eventRows) {
      eventTotals.set(
        row.event_name,
        (eventTotals.get(row.event_name) ?? 0) + 1
      )
    }
    const eventCounts = [...eventTotals.entries()]
      .map(([event_name, count]) => ({ event_name, count }))
      .sort((a, b) => b.count - a.count)

    const dailyCounts =
      dailyCountsRpc.length > 0
        ? dailyCountsRpc
        : buildDailyCountsFallback(eventRows, sinceIso)

    // Upload moderation totals
    const uploadTotals = { pending: 0, approved: 0, rejected: 0 }
    for (const row of uploadsResult.data ?? []) {
      const status = row.status as keyof typeof uploadTotals
      if (status in uploadTotals) uploadTotals[status] += 1
    }

    // Catalog stats (exact counts + RPC rollups)
    const wallpaperCategoryCounts = categoryCounts
    const topLiked = topLikedWallpapers

    const downloadFunnel = buildDownloadFunnel(eventRows)
    const downloadClicksByLocation = buildClicksByLocation(
      eventRows,
      "download_click"
    )
    const pricingClicksByLocation = buildClicksByLocation(
      eventRows,
      "pricing_click"
    )
    const topPages = buildTopPageViews(eventRows)
    const visitorsByCountry = buildVisitorsByCountry(eventRows)
    const indiaAudience = buildIndiaAudienceMetrics(eventRows)
    const downloadDaily = dailyCounts
      .filter(
        (row) =>
          row.event_name === "download_click" ||
          row.event_name === "download_redirect"
      )
      .sort((a, b) => a.day.localeCompare(b.day))

    const sales = buildSalesSummary(allSales, days)
    const conversionFunnel = buildConversionFunnel(
      eventRows,
      allDevices,
      allSales,
      days
    )

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
      visitorsByCountry,
      indiaAudience,
      communityUploads: uploadTotals,
      catalogWallpaperCount: wallpaperCountResult.count ?? 0,
      totalLikes: likesResult.count ?? 0,
      activatedDevicesAllTime: allDevices.length,
      activatedDevicesInRange: conversionFunnel.activatedDevices,
      wallpaperCategoryCounts,
      topLikedWallpapers: topLiked,
      sales,
      conversionFunnel,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load analytics"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
