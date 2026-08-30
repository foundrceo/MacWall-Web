import { NextResponse } from "next/server"

import { requireAdminApi } from "@/lib/admin/auth"
import { fetchOpsLive } from "@/lib/admin/ops-live"
import { withTtlCache } from "@/lib/admin/ttl-cache"
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
import { fetchStripeLive } from "@/lib/admin/stripe-live"
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
  fetchEventNameCounts,
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

    const payload = await withTtlCache(
      `admin-analytics:${days}:${sinceIso.slice(0, 13)}`,
      20_000,
      () => loadAnalytics(days, sinceIso)
    )
    return NextResponse.json(payload)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load analytics"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function loadAnalytics(days: number, sinceIso: string) {
    const supabase = getSupabaseAdmin()

    const liveSinceIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const [
      eventRows,
      liveEventRows,
      eventNameCounts,
      lastEventAt,
      uploadsResult,
      wallpaperCountResult,
      likesResult,
      categoryCounts,
      topLikedWallpapers,
      dailyCountsRpc,
      salesResult,
      allDevices,
      detailedLicenses,
      stripeLive,
      opsLive,
      feedbackResult,
    ] = await Promise.all([
      fetchEventsInRange(supabase, sinceIso, [
        "page_view",
        "download_click",
        "download_redirect",
        "pricing_click",
        "cta_click",
        "checkout_started",
        "checkout_abandoned",
      ]),
      fetchEventsInRange(supabase, liveSinceIso),
      fetchEventNameCounts(supabase, sinceIso),
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
      fetchStripeLive(),
      fetchOpsLive(sinceIso),
      supabase
        .from("app_feedback")
        .select("sentiment, is_resolved, needs_admin_reply, created_at")
        .limit(2000),
    ])

    const allSales = salesResult.rows
    const recoveryStats = await fetchCheckoutRecoveryStats(
      sinceIso,
      stripeLive.charges
    )

    if (uploadsResult.error) throw new Error(uploadsResult.error.message)
    if (wallpaperCountResult.error) {
      throw new Error(wallpaperCountResult.error.message)
    }
    if (likesResult.error) throw new Error(likesResult.error.message)

    const eventTotals = new Map<string, number>()
    for (const row of eventNameCounts) {
      eventTotals.set(row.event_name, row.count)
    }
    for (const row of eventRows) {
      if (!eventTotals.has(row.event_name)) {
        eventTotals.set(
          row.event_name,
          (eventTotals.get(row.event_name) ?? 0) + 1
        )
      }
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

    const sales = buildSalesSummary(allSales, days, {
      source: salesResult.source,
      charges: stripeLive.charges,
    })
    const conversionFunnel = buildConversionFunnel(
      eventRows,
      allDevices,
      allSales,
      days
    )

    const licenseAnalytics = buildLicenseAnalytics(detailedLicenses, allSales.length)
    const liveActivity = buildLiveActivity(liveEventRows)
    const dayOfWeekSales = buildDayOfWeekSales(allSales)
    const hourlyHeatmap = buildHourlyActivityHeatmap(eventRows)
    const promoDiscount = buildPromoDiscountAnalytics(eventRows)
    if (stripeLive.promotions.length > 0) {
      promoDiscount.promoCodesBreakdown = stripeLive.promotions.map((promo) => ({
        code: promo.code,
        count: promo.timesRedeemed,
        label: promo.active ? promo.code : `${promo.code} (off)`,
      }))
      promoDiscount.checkoutPromoAttempts = stripeLive.promotions.reduce(
        (sum, promo) => sum + promo.timesRedeemed,
        0
      )
    }
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

    return {
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
      stripeLive: {
        balance: stripeLive.balance,
        promotions: stripeLive.promotions,
        chargeCount: stripeLive.charges.length,
        error: stripeLive.error,
      },
      opsLive,
    }
}

