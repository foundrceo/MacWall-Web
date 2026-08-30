import type { SupabaseClient } from "@supabase/supabase-js"

export type AnalyticsEventRow = {
  event_name: string
  created_at?: string
  path?: string | null
  metadata?: {
    location?: string
    page?: string
    country?: string
    audience?: string
    promo_code?: string
  } | null
  session_id?: string | null
}

export type DailyRow = { day: string; event_name: string; count: number }
export type LocationCountRow = { location: string; count: number }
export type CountryCountRow = { country: string; count: number }

export type IndiaAudienceMetrics = {
  pageViews: number
  uniqueSessions: number
  pricingClicks: number
  ctaClicks: number
  announcementClicks: number
}

const PAGE_SIZE = 1000

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

const COUNTED_EVENTS = [
  "page_view",
  "download_click",
  "download_redirect",
  "pricing_click",
  "cta_click",
  "checkout_started",
  "checkout_abandoned",
  "purchase_complete",
  "wallpaper_like",
] as const

export async function fetchEventNameCounts(
  supabase: SupabaseClient,
  sinceIso: string
): Promise<Array<{ event_name: string; count: number }>> {
  const counts = await Promise.all(
    COUNTED_EVENTS.map(async (eventName) => {
      const { count, error } = await supabase
        .from("site_analytics_events")
        .select("id", { count: "exact", head: true })
        .eq("event_name", eventName)
        .gte("created_at", sinceIso)
      if (error) throw new Error(error.message)
      return { event_name: eventName, count: count ?? 0 }
    })
  )
  return counts.filter((row) => row.count > 0).sort((a, b) => b.count - a.count)
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

  const completionRate = clicks > 0 ? Math.round((redirects / clicks) * 100) : 0

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

function rowCountry(row: AnalyticsEventRow): string | null {
  const country =
    typeof row.metadata?.country === "string" ? row.metadata.country.trim() : ""
  if (country) return country.toUpperCase()

  if (row.metadata?.audience === "india") return "IN"
  return null
}

export function buildVisitorsByCountry(
  rows: AnalyticsEventRow[],
  limit = 12
): CountryCountRow[] {
  const totals = new Map<string, number>()

  for (const row of rows) {
    if (row.event_name !== "page_view") continue
    const country = rowCountry(row)
    if (!country) continue
    totals.set(country, (totals.get(country) ?? 0) + 1)
  }

  return [...totals.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export function buildIndiaAudienceMetrics(
  rows: AnalyticsEventRow[]
): IndiaAudienceMetrics {
  const uniqueSessions = new Set<string>()
  let pageViews = 0
  let pricingClicks = 0
  let ctaClicks = 0
  let announcementClicks = 0

  for (const row of rows) {
    const isIndia = rowCountry(row) === "IN"
    if (!isIndia) continue

    if (row.session_id) uniqueSessions.add(row.session_id)

    if (row.event_name === "page_view") pageViews += 1
    if (row.event_name === "pricing_click") pricingClicks += 1
    if (row.event_name === "cta_click") {
      ctaClicks += 1
      if (row.metadata?.location === "announcement_bar") {
        announcementClicks += 1
      }
    }
  }

  return {
    pageViews,
    uniqueSessions: uniqueSessions.size,
    pricingClicks,
    ctaClicks,
    announcementClicks,
  }
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

export type LiveActivityMetrics = {
  activeUsers5m: number
  activeUsers15m: number
  activeUsers1h: number
  activeUsers24h: number
  eventsLastHour: number
  currentActions: Array<{
    action: string
    count: number
    label: string
    color: string
  }>
  recentLiveFeed: Array<{
    eventName: string
    path?: string
    location?: string
    country?: string
    agoSeconds: number
  }>
}

export type HourlyHeatmapCell = {
  dayOfWeek: string
  dayIndex: number
  hour: number
  count: number
  intensity: number // 0 to 1
}

export type PromoDiscountAnalytics = {
  totalDiscountClicks: number
  indiaOfferClicks: number
  announcementPromoClicks: number
  checkoutPromoAttempts: number
  promoCodesBreakdown: Array<{ code: string; count: number; label: string }>
  discountLocations: Array<{ location: string; count: number; label: string }>
  effectiveDiscountRate: number
}

export type UserSessionEngagement = {
  totalSessions: number
  totalPageViews: number
  avgPagesPerSession: number
  singlePageSessionRate: number
  topExitOrLandingPages: Array<{ path: string; count: number }>
}

/** Computes live active sessions and event velocity */
export function buildLiveActivity(rows: AnalyticsEventRow[]): LiveActivityMetrics {
  const now = Date.now()
  const ms5m = 5 * 60 * 1000
  const ms15m = 15 * 60 * 1000
  const ms1h = 60 * 60 * 1000
  const ms24h = 24 * 60 * 60 * 1000

  const sessions5m = new Set<string>()
  const sessions15m = new Set<string>()
  const sessions1h = new Set<string>()
  const sessions24h = new Set<string>()

  let eventsLastHour = 0
  const actionCounts = new Map<string, number>()
  const recentFeed: LiveActivityMetrics["recentLiveFeed"] = []

  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i]
    if (!row.created_at) continue
    const ts = new Date(row.created_at).getTime()
    const diff = now - ts
    if (diff < 0) continue

    const sid = row.session_id || `anon_${i}`

    if (diff <= ms5m) sessions5m.add(sid)
    if (diff <= ms15m) sessions15m.add(sid)
    if (diff <= ms1h) {
      sessions1h.add(sid)
      eventsLastHour++
      actionCounts.set(row.event_name, (actionCounts.get(row.event_name) ?? 0) + 1)
    }
    if (diff <= ms24h) sessions24h.add(sid)

    if (recentFeed.length < 10 && diff <= ms1h) {
      recentFeed.push({
        eventName: row.event_name,
        path: row.path || row.metadata?.page || undefined,
        location: row.metadata?.location || undefined,
        country: rowCountry(row) || undefined,
        agoSeconds: Math.max(1, Math.round(diff / 1000)),
      })
    }
  }

  const actionLabels: Record<string, { label: string; color: string }> = {
    page_view: { label: "Browsing Wallpapers", color: "#0071e3" },
    download_click: { label: "Downloading App", color: "#17b26a" },
    download_redirect: { label: "Starting Installer", color: "#06aed4" },
    pricing_click: { label: "Checking Pricing / Pro", color: "#f79009" },
    cta_click: { label: "Interacting with CTAs", color: "#7a5af8" },
    wallpaper_like: { label: "Liking Wallpapers", color: "#f04438" },
  }

  const currentActions = [...actionCounts.entries()].map(([name, count]) => ({
    action: name,
    count,
    label: actionLabels[name]?.label || name.replace(/_/g, " "),
    color: actionLabels[name]?.color || "#667085",
  }))

  return {
    activeUsers5m: sessions5m.size,
    activeUsers15m: sessions15m.size,
    activeUsers1h: sessions1h.size,
    activeUsers24h: sessions24h.size,
    eventsLastHour,
    currentActions,
    recentLiveFeed: recentFeed,
  }
}

/** Computes 24h x 7d heatmap of activity */
export function buildHourlyActivityHeatmap(rows: AnalyticsEventRow[]): HourlyHeatmapCell[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  // map key: dayIndex (0..6, 0=Mon) | hour (0..23)
  const counts = new Map<string, number>()
  let maxCount = 1

  for (const row of rows) {
    if (!row.created_at) continue
    const date = new Date(row.created_at)
    if (Number.isNaN(date.getTime())) continue

    const jsDay = date.getUTCDay() // 0=Sun..6=Sat
    const dayIdx = jsDay === 0 ? 6 : jsDay - 1 // 0=Mon..6=Sun
    const hour = date.getUTCHours()

    const key = `${dayIdx}_${hour}`
    const next = (counts.get(key) ?? 0) + 1
    counts.set(key, next)
    if (next > maxCount) maxCount = next
  }

  const result: HourlyHeatmapCell[] = []
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const key = `${d}_${h}`
      const val = counts.get(key) ?? 0
      result.push({
        dayOfWeek: days[d],
        dayIndex: d,
        hour: h,
        count: val,
        intensity: Math.min(1, val / maxCount),
      })
    }
  }

  return result
}

/** Computes promo and discount engagement */
export function buildPromoDiscountAnalytics(rows: AnalyticsEventRow[]): PromoDiscountAnalytics {
  let totalDiscountClicks = 0
  let indiaOfferClicks = 0
  let announcementPromoClicks = 0
  let checkoutPromoAttempts = 0

  const promoCodeMap = new Map<string, number>()
  const locMap = new Map<string, number>()

  for (const row of rows) {
    const loc = row.metadata?.location || ""
    if (row.event_name === "pricing_click" || row.event_name === "cta_click") {
      if (loc.includes("india") || loc.includes("flash") || row.metadata?.audience === "india") {
        indiaOfferClicks++
        totalDiscountClicks++
      }
      if (loc.includes("announcement") || loc.includes("banner")) {
        announcementPromoClicks++
        totalDiscountClicks++
      }
      if (loc) {
        locMap.set(loc, (locMap.get(loc) ?? 0) + 1)
      }
    }

    const promoCode =
      typeof row.metadata?.promo_code === "string"
        ? row.metadata.promo_code.trim().toUpperCase()
        : ""
    if (promoCode) {
      promoCodeMap.set(promoCode, (promoCodeMap.get(promoCode) ?? 0) + 1)
      checkoutPromoAttempts++
    }
  }

  const promoCodesBreakdown = [...promoCodeMap.entries()].map(([code, count]) => ({
    code,
    count,
    label: code,
  }))

  const discountLocations = [...locMap.entries()]
    .map(([location, count]) => ({
      location,
      count,
      label: location.replace(/_/g, " "),
    }))
    .sort((a, b) => b.count - a.count)

  const effectiveRate =
    totalDiscountClicks > 0
      ? Math.round((checkoutPromoAttempts / Math.max(totalDiscountClicks, 1)) * 100)
      : 0

  return {
    totalDiscountClicks,
    indiaOfferClicks,
    announcementPromoClicks,
    checkoutPromoAttempts,
    promoCodesBreakdown,
    discountLocations,
    effectiveDiscountRate: effectiveRate,
  }
}

/** Computes session engagement & pages visited */
export function buildSessionEngagement(rows: AnalyticsEventRow[]): UserSessionEngagement {
  const sessionPageCounts = new Map<string, number>()
  let totalPageViews = 0

  for (const row of rows) {
    if (row.event_name === "page_view") {
      totalPageViews++
      const sid = row.session_id || "anon"
      sessionPageCounts.set(sid, (sessionPageCounts.get(sid) ?? 0) + 1)
    }
  }

  const totalSessions = sessionPageCounts.size
  let singlePageCount = 0
  for (const count of sessionPageCounts.values()) {
    if (count === 1) singlePageCount++
  }

  const avgPages =
    totalSessions > 0
      ? Math.round((totalPageViews / totalSessions) * 10) / 10
      : 0
  const bounceRate =
    totalSessions > 0
      ? Math.round((singlePageCount / totalSessions) * 100)
      : 0

  const topPages = buildTopPageViews(rows, 6)

  return {
    totalSessions,
    totalPageViews,
    avgPagesPerSession: avgPages,
    singlePageSessionRate: bounceRate,
    topExitOrLandingPages: topPages,
  }
}

