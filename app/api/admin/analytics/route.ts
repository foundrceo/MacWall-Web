import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import {
  buildConversionFunnel,
  buildDayOfWeekSales,
  buildLicenseAnalytics,
  buildSalesSummary,
  fetchAllDeviceActivations,
  fetchAllLicensesDetailed,
  fetchAllSales,
  fetchCheckoutRecoveryStats,
} from "@/lib/admin/sales"
import {
  buildClicksByLocation,
  buildDailyCountsFallback,
  buildDownloadFunnel,
  buildHourlyActivityHeatmap,
  buildIndiaAudienceMetrics,
  buildLiveActivity,
  buildPromoDiscountAnalytics,
  buildSessionEngagement,
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
    const rawDays = searchParams.get("days") ?? "7"
    const isAllTime =
      rawDays === "0" ||
      rawDays.toLowerCase() === "all" ||
      Number.parseInt(rawDays, 10) === 0 ||
      Number.parseInt(rawDays, 10) >= 3650
    const days = isAllTime
      ? 0
      : Math.min(365, Math.max(1, Number.parseInt(rawDays, 10) || 7))

    const sinceIso = isAllTime
      ? "1970-01-01T00:00:00.000Z"
      : (() => {
          const since = new Date()
          since.setUTCDate(since.getUTCDate() - days)
          return since.toISOString()
        })()

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
      detailedLicenses,
      recoveryStats,
      feedbackResult,
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
      fetchAllLicensesDetailed(),
      fetchCheckoutRecoveryStats(),
      supabase
        .from("app_feedback")
        .select("sentiment, is_resolved, needs_admin_reply, created_at")
        .limit(2000),
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

    // Catalog stats
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

    const licenseAnalytics = buildLicenseAnalytics(detailedLicenses, allSales.length)
    const liveActivity = buildLiveActivity(eventRows)
    const dayOfWeekSales = buildDayOfWeekSales(allSales)
    const hourlyHeatmap = buildHourlyActivityHeatmap(eventRows)
    const promoDiscount = buildPromoDiscountAnalytics(eventRows)
    const sessionEngagement = buildSessionEngagement(eventRows)

    // Support / feedback sentiment stats
    const feedbackRows = feedbackResult.data ?? []
    const feedbackTotals = {
      total: feedbackRows.length,
      open: feedbackRows.filter((r) => !r.is_resolved).length,
      resolved: feedbackRows.filter((r) => r.is_resolved).length,
      needsReply: feedbackRows.filter((r) => r.needs_admin_reply && !r.is_resolved).length,
      sentiments: [
        { label: "Positive", sentiment: "like", count: feedbackRows.filter((r) => r.sentiment === "like").length, color: "#17b26a" },
        { label: "Neutral", sentiment: "neutral", count: feedbackRows.filter((r) => r.sentiment === "neutral").length, color: "#f79009" },
        { label: "Issues / Bug", sentiment: "dislike", count: feedbackRows.filter((r) => r.sentiment === "dislike").length, color: "#f04438" },
      ],
    }

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
      licenseAnalytics,
      liveActivity,
      dayOfWeekSales,
      hourlyHeatmap,
      promoDiscount,
      sessionEngagement,
      recoveryStats,
      feedbackTotals,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load analytics"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

