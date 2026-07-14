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
  buildTopPageViews,
  fetchEventsInRange,
  fetchLatestEventAt,
} from "@/lib/analytics/admin-metrics"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export const runtime = "nodejs"

type WallpaperLiteRow = {
  id: string
  name: string
  category: string
  like_count: number
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

    // One round-trip per dataset; all metrics derived locally from these rows.
    const [
      eventRows,
      lastEventAt,
      uploadsResult,
      wallpapersResult,
      likesResult,
      allSales,
      allDevices,
    ] = await Promise.all([
      fetchEventsInRange(supabase, sinceIso),
      fetchLatestEventAt(supabase),
      supabase.from("community_uploads").select("status"),
      supabase
        .from("wallpapers")
        .select("id,name,category,like_count")
        .limit(2000),
      supabase
        .from("wallpaper_likes")
        .select("id", { count: "exact", head: true }),
      fetchAllSales(),
      fetchAllDeviceActivations(),
    ])

    if (uploadsResult.error) throw new Error(uploadsResult.error.message)
    if (wallpapersResult.error) throw new Error(wallpapersResult.error.message)
    if (likesResult.error) throw new Error(likesResult.error.message)

    // Event tallies (replaces one head-count query per event name)
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

    const dailyCounts = buildDailyCountsFallback(eventRows, sinceIso)

    // Upload moderation totals
    const uploadTotals = { pending: 0, approved: 0, rejected: 0 }
    for (const row of uploadsResult.data ?? []) {
      const status = row.status as keyof typeof uploadTotals
      if (status in uploadTotals) uploadTotals[status] += 1
    }

    // Catalog stats from a single wallpapers fetch
    const wallpapers = (wallpapersResult.data ?? []) as WallpaperLiteRow[]
    const categoryTotals = new Map<string, number>()
    for (const row of wallpapers) {
      categoryTotals.set(
        row.category,
        (categoryTotals.get(row.category) ?? 0) + 1
      )
    }
    const wallpaperCategoryCounts = [...categoryTotals.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
    const topLikedWallpapers = [...wallpapers]
      .sort((a, b) => b.like_count - a.like_count)
      .slice(0, 8)
      .map((row) => ({
        id: row.id,
        name: row.name,
        category: row.category,
        likeCount: row.like_count,
      }))

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
      communityUploads: uploadTotals,
      catalogWallpaperCount: wallpapers.length,
      totalLikes: likesResult.count ?? 0,
      activatedDevices: allDevices.length,
      wallpaperCategoryCounts,
      topLikedWallpapers,
      sales,
      conversionFunnel,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load analytics"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
