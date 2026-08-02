import type { AnalyticsEventRow } from "@/lib/analytics/admin-metrics"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

/** Default MacWall Pro permanent price (USD) — most common SKU. */
export const PRO_PRICE_USD = 7.99
/** 5-Mac permanent license. */
export const PRO_PLUS_PRICE_USD = 12.99
/** Legacy annual plan (still active for existing subscribers). */
export const ANNUAL_PRICE_USD = 4.99

export function priceUsdForPlan(
  planSlug: string | null | undefined,
  billingModel: string | null | undefined
): number {
  if (planSlug === "pro_plus") return PRO_PLUS_PRICE_USD
  if (billingModel === "annual") return ANNUAL_PRICE_USD
  return PRO_PRICE_USD
}

/**
 * Stripe fee estimate: ~2.9% + $0.30 processing.
 * Override with STRIPE_FEE_PERCENT / STRIPE_FEE_FIXED env vars if your plan differs.
 */
const STRIPE_FEE_PERCENT = Number.parseFloat(
  process.env.STRIPE_FEE_PERCENT ?? "2.9"
)
const STRIPE_FEE_FIXED = Number.parseFloat(
  process.env.STRIPE_FEE_FIXED ?? "0.30"
)

export function netRevenueForAmount(amountUsd: number): number {
  const fee = amountUsd * (STRIPE_FEE_PERCENT / 100) + STRIPE_FEE_FIXED
  return Math.max(0, amountUsd - fee)
}

export function netRevenuePerSale(): number {
  return netRevenueForAmount(PRO_PRICE_USD)
}

export type SaleRow = { sent_at: string; amountUsd: number }
export type DeviceRow = { activated_at: string }

export type DailySalesRow = { day: string; sales: number; revenue: number }

export type SalesSummary = {
  pricePerSale: number
  netPerSale: number
  feePercentAssumed: number
  feeFixedAssumed: number
  sales: number
  grossRevenue: number
  netRevenue: number
  prevSales: number
  prevGrossRevenue: number
  salesChangePercent: number | null
  allTimeSales: number
  allTimeGrossRevenue: number
  allTimeNetRevenue: number
  firstSaleAt: string | null
  daily: DailySalesRow[]
  prevDaily: DailySalesRow[]
}

export type ConversionFunnel = {
  pageViews: number
  uniqueVisitors: number
  downloadClicks: number
  uniqueDownloadClickSessions: number
  installerRedirects: number
  uniqueInstallSessions: number
  activatedDevices: number
  sales: number
  visitorToDownloadRate: number
  downloadToRedirectRate: number
  installToSaleRate: number
  visitorToSaleRate: number
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function rate(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0
  return round1((numerator / denominator) * 100)
}

function bucketByDay(rows: SaleRow[]): DailySalesRow[] {
  const totals = new Map<string, { sales: number; revenue: number }>()
  for (const row of rows) {
    const day = row.sent_at.slice(0, 10)
    const prev = totals.get(day) ?? { sales: 0, revenue: 0 }
    totals.set(day, {
      sales: prev.sales + 1,
      revenue: prev.revenue + row.amountUsd,
    })
  }
  return [...totals.entries()]
    .map(([day, { sales, revenue }]) => ({
      day,
      sales,
      revenue: round2(revenue),
    }))
    .sort((a, b) => a.day.localeCompare(b.day))
}

function sumGross(rows: SaleRow[]): number {
  return round2(rows.reduce((sum, row) => sum + row.amountUsd, 0))
}

function sumNet(rows: SaleRow[]): number {
  return round2(
    rows.reduce((sum, row) => sum + netRevenueForAmount(row.amountUsd), 0)
  )
}

/**
 * Active licenses with plan-aware pricing (falls back to license-email tables).
 */
export async function fetchAllSales(): Promise<SaleRow[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("macwall_licenses")
    .select("activated_at, plan_slug, billing_model, status")
    .eq("status", "active")
    .not("activated_at", "is", null)
    .order("activated_at", { ascending: true })
    .limit(10000)

  if (error) {
    if (error.message.includes("does not exist")) {
      return fetchSalesFromEmailFallback()
    }
    throw new Error(error.message)
  }

  const rows = (data ?? [])
    .filter((row) => typeof row.activated_at === "string")
    .map((row) => ({
      sent_at: row.activated_at as string,
      amountUsd: priceUsdForPlan(
        row.plan_slug as string | null,
        row.billing_model as string | null
      ),
    }))

  if (rows.length > 0) return rows
  return fetchSalesFromEmailFallback()
}

async function fetchSalesFromEmailFallback(): Promise<SaleRow[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("macwall_stripe_license_emails")
    .select("sent_at")
    .order("sent_at", { ascending: true })
    .limit(10000)

  if (error) {
    if (error.message.includes("does not exist")) return []
    throw new Error(error.message)
  }

  return (data ?? [])
    .filter((row) => typeof row.sent_at === "string")
    .map((row) => ({
      sent_at: row.sent_at as string,
      amountUsd: PRO_PRICE_USD,
    }))
}

/**
 * Device activations (low volume table). Pass `sinceIso` to filter in SQL —
 * the conversion funnel only needs the current window, so we avoid scanning
 * all-time rows.
 */
export async function fetchAllDeviceActivations(
  sinceIso?: string
): Promise<DeviceRow[]> {
  const supabase = getSupabaseAdmin()
  let query = supabase
    .from("macwall_license_devices")
    .select("activated_at")
    .order("activated_at", { ascending: true })
    .limit(10000)

  if (sinceIso) {
    query = query.gte("activated_at", sinceIso)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as DeviceRow[]
}

/** Pure: computes the full sales summary from all sale rows. */
export function buildSalesSummary(
  allSales: SaleRow[],
  days: number
): SalesSummary {
  const now = new Date()
  const since = new Date(now)
  since.setUTCDate(since.getUTCDate() - days)
  const prevSince = new Date(since)
  prevSince.setUTCDate(prevSince.getUTCDate() - days)

  const sinceIso = since.toISOString()
  const prevSinceIso = prevSince.toISOString()

  const currentRows = allSales.filter((row) => row.sent_at >= sinceIso)
  const prevRows = allSales.filter(
    (row) => row.sent_at >= prevSinceIso && row.sent_at < sinceIso
  )

  const sales = currentRows.length
  const prevSales = prevRows.length
  const allTimeSales = allSales.length
  const grossRevenue = sumGross(currentRows)
  const avgPrice = sales > 0 ? round2(grossRevenue / sales) : PRO_PRICE_USD
  const net = netRevenueForAmount(avgPrice)

  let salesChangePercent: number | null = 0
  if (prevSales > 0) {
    salesChangePercent = round1(((sales - prevSales) / prevSales) * 100)
  } else if (sales > 0) {
    salesChangePercent = null
  }

  return {
    pricePerSale: avgPrice,
    netPerSale: round2(net),
    feePercentAssumed: STRIPE_FEE_PERCENT,
    feeFixedAssumed: STRIPE_FEE_FIXED,
    sales,
    grossRevenue,
    netRevenue: sumNet(currentRows),
    prevSales,
    prevGrossRevenue: sumGross(prevRows),
    salesChangePercent,
    allTimeSales,
    allTimeGrossRevenue: sumGross(allSales),
    allTimeNetRevenue: sumNet(allSales),
    firstSaleAt: allSales[0]?.sent_at ?? null,
    daily: bucketByDay(currentRows),
    prevDaily: bucketByDay(prevRows),
  }
}

/** Pure: computes the install→sale funnel from already-fetched rows. */
export function buildConversionFunnel(
  eventRows: AnalyticsEventRow[],
  deviceRows: DeviceRow[],
  saleRows: SaleRow[],
  days: number
): ConversionFunnel {
  const since = new Date()
  since.setUTCDate(since.getUTCDate() - days)
  const sinceIso = since.toISOString()

  let pageViews = 0
  let downloadClicks = 0
  let installerRedirects = 0
  const visitorSessions = new Set<string>()
  const downloadClickSessions = new Set<string>()
  const installSessions = new Set<string>()

  for (const row of eventRows) {
    if (row.event_name === "page_view") {
      pageViews += 1
      if (row.session_id) visitorSessions.add(row.session_id)
    } else if (row.event_name === "download_click") {
      downloadClicks += 1
      if (row.session_id) downloadClickSessions.add(row.session_id)
    } else if (row.event_name === "download_redirect") {
      installerRedirects += 1
      if (row.session_id) installSessions.add(row.session_id)
    }
  }

  const activatedDevices = deviceRows.filter(
    (row) => row.activated_at >= sinceIso
  ).length
  const sales = saleRows.filter((row) => row.sent_at >= sinceIso).length

  const uniqueVisitors = visitorSessions.size
  const uniqueDownloadClickSessions = downloadClickSessions.size
  const uniqueInstallSessions = installSessions.size

  return {
    pageViews,
    uniqueVisitors,
    downloadClicks,
    uniqueDownloadClickSessions,
    installerRedirects,
    uniqueInstallSessions,
    activatedDevices,
    sales,
    visitorToDownloadRate: rate(uniqueDownloadClickSessions, uniqueVisitors),
    downloadToRedirectRate: rate(installerRedirects, downloadClicks),
    installToSaleRate: rate(sales, activatedDevices),
    visitorToSaleRate: rate(sales, uniqueVisitors),
  }
}
