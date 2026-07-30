import type { AnalyticsEventRow } from "@/lib/analytics/admin-metrics"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

/** MacWall Pro one-time price (USD). */
export const PRO_PRICE_USD = 9.99

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

export function netRevenuePerSale(): number {
  const fee = PRO_PRICE_USD * (STRIPE_FEE_PERCENT / 100) + STRIPE_FEE_FIXED
  return Math.max(0, PRO_PRICE_USD - fee)
}

export type SaleRow = { sent_at: string }
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
  const totals = new Map<string, number>()
  for (const row of rows) {
    const day = row.sent_at.slice(0, 10)
    totals.set(day, (totals.get(day) ?? 0) + 1)
  }
  return [...totals.entries()]
    .map(([day, sales]) => ({
      day,
      sales,
      revenue: round2(sales * PRO_PRICE_USD),
    }))
    .sort((a, b) => a.day.localeCompare(b.day))
}

async function fetchSalesFromTable(
  table: "macwall_stripe_license_emails" | "macwall_whop_license_emails"
): Promise<SaleRow[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from(table)
    .select("sent_at")
    .order("sent_at", { ascending: true })
    .limit(10000)

  if (error) {
    if (error.message.includes("does not exist")) return []
    throw new Error(error.message)
  }
  return (data ?? []) as SaleRow[]
}

/** Stripe + legacy Whop sales (low volume tables). */
export async function fetchAllSales(): Promise<SaleRow[]> {
  const [stripeSales, whopSales] = await Promise.all([
    fetchSalesFromTable("macwall_stripe_license_emails"),
    fetchSalesFromTable("macwall_whop_license_emails"),
  ])

  return [...stripeSales, ...whopSales].sort((a, b) =>
    a.sent_at.localeCompare(b.sent_at)
  )
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

  const net = netRevenuePerSale()
  const sales = currentRows.length
  const prevSales = prevRows.length
  const allTimeSales = allSales.length

  let salesChangePercent: number | null = 0
  if (prevSales > 0) {
    salesChangePercent = round1(((sales - prevSales) / prevSales) * 100)
  } else if (sales > 0) {
    salesChangePercent = null
  }

  return {
    pricePerSale: PRO_PRICE_USD,
    netPerSale: round2(net),
    feePercentAssumed: STRIPE_FEE_PERCENT,
    feeFixedAssumed: STRIPE_FEE_FIXED,
    sales,
    grossRevenue: round2(sales * PRO_PRICE_USD),
    netRevenue: round2(sales * net),
    prevSales,
    prevGrossRevenue: round2(prevSales * PRO_PRICE_USD),
    salesChangePercent,
    allTimeSales,
    allTimeGrossRevenue: round2(allTimeSales * PRO_PRICE_USD),
    allTimeNetRevenue: round2(allTimeSales * net),
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
