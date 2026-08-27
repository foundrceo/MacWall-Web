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
  const isAllTime = days <= 0 || days >= 3650
  let currentRows: SaleRow[]
  let prevRows: SaleRow[] = []

  if (isAllTime) {
    currentRows = allSales
    prevRows = []
  } else {
    const now = new Date()
    const since = new Date(now)
    since.setUTCDate(since.getUTCDate() - days)
    const prevSince = new Date(since)
    prevSince.setUTCDate(prevSince.getUTCDate() - days)

    const sinceIso = since.toISOString()
    const prevSinceIso = prevSince.toISOString()

    currentRows = allSales.filter((row) => row.sent_at >= sinceIso)
    prevRows = allSales.filter(
      (row) => row.sent_at >= prevSinceIso && row.sent_at < sinceIso
    )
  }

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

export type LicenseDetailedRow = {
  status: string
  plan_slug: string | null
  billing_model: string | null
  visitor_country: string | null
  activated_at: string | null
  max_devices: number | null
}

export type LicenseAnalyticsSummary = {
  totalLicenses: number
  activeLicenses: number
  pendingLicenses: number
  expiredLicenses: number
  revokedLicenses: number
  proLicenses: number
  proPlusLicenses: number
  annualLicenses: number
  permanentLicenses: number
  subscriptionLicenses: number
  statusBreakdown: Array<{ status: string; label: string; count: number; color: string }>
  planBreakdown: Array<{ plan: string; label: string; count: number; color: string }>
  billingBreakdown: Array<{ model: string; label: string; count: number; color: string }>
  buyerCountries: Array<{ country: string; count: number }>
}

export type CheckoutRecoverySummary = {
  totalAbandoned: number
  emailsSent: number
  emailsOpened: number
  emailsClicked: number
  recoveredConversions: number
  recoveryRatePercent: number
  recoveredRevenueUsd: number
  funnel: Array<{ stage: string; count: number; rate: number }>
}

export type DayOfWeekSalesRow = {
  dayName: string
  dayIndex: number
  sales: number
  revenue: number
}

/** Fetches full license table rows for deep breakdown */
export async function fetchAllLicensesDetailed(): Promise<LicenseDetailedRow[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("macwall_licenses")
    .select("status, plan_slug, billing_model, visitor_country, activated_at, max_devices")
    .limit(10000)

  if (error) {
    if (error.message.includes("does not exist")) return []
    console.warn("[analytics] fetchAllLicensesDetailed fallback", error.message)
    return []
  }

  return (data ?? []) as LicenseDetailedRow[]
}

/** Builds comprehensive license metrics and status/plan breakdowns */
export function buildLicenseAnalytics(
  licenses: LicenseDetailedRow[],
  activeSalesCount: number
): LicenseAnalyticsSummary {
  let active = 0
  let pending = 0
  let expired = 0
  let revoked = 0

  let pro = 0
  let proPlus = 0
  let annual = 0

  let permanent = 0
  let subscription = 0

  const countryTotals = new Map<string, number>()

  for (const row of licenses) {
    const st = (row.status || "active").toLowerCase()
    if (st === "active") active++
    else if (st === "pending") pending++
    else if (st === "expired") expired++
    else if (st === "revoked") revoked++
    else active++

    const plan = (row.plan_slug || "pro").toLowerCase()
    if (plan.includes("plus") || (row.max_devices && row.max_devices > 1)) proPlus++
    else if (plan.includes("annual")) annual++
    else pro++

    const billing = (row.billing_model || "permanent").toLowerCase()
    if (billing === "annual" || billing === "subscription") subscription++
    else permanent++

    if (row.visitor_country && /^[A-Z]{2}$/i.test(row.visitor_country)) {
      const c = row.visitor_country.toUpperCase()
      countryTotals.set(c, (countryTotals.get(c) ?? 0) + 1)
    }
  }

  // Fallback if licenses table has minimal rows but sales exists
  if (active === 0 && activeSalesCount > 0) {
    active = activeSalesCount
    pro = activeSalesCount
    permanent = activeSalesCount
  }

  const total = active + pending + expired + revoked

  const statusBreakdown = [
    { status: "active", label: "Active Pro", count: active, color: "#17b26a" },
    { status: "pending", label: "Pending Checkout", count: pending, color: "#f79009" },
    { status: "expired", label: "Expired", count: expired, color: "#98a2b3" },
    { status: "revoked", label: "Revoked", count: revoked, color: "#f04438" },
  ].filter((s) => s.count > 0 || total === 0)

  const planBreakdown = [
    { plan: "pro", label: "MacWall Pro ($7.99)", count: pro, color: "#0071e3" },
    { plan: "pro_plus", label: "Pro Plus 5-Mac ($12.99)", count: proPlus, color: "#7a5af8" },
    { plan: "annual", label: "Legacy Annual ($4.99/yr)", count: annual, color: "#06aed4" },
  ].filter((p) => p.count > 0 || total === 0)

  const billingBreakdown = [
    { model: "permanent", label: "One-time / Lifetime", count: permanent, color: "#17b26a" },
    { model: "subscription", label: "Subscription / Annual", count: subscription, color: "#f79009" },
  ].filter((b) => b.count > 0 || total === 0)

  const buyerCountries = [...countryTotals.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return {
    totalLicenses: total || active,
    activeLicenses: active,
    pendingLicenses: pending,
    expiredLicenses: expired,
    revokedLicenses: revoked,
    proLicenses: pro,
    proPlusLicenses: proPlus,
    annualLicenses: annual,
    permanentLicenses: permanent,
    subscriptionLicenses: subscription,
    statusBreakdown,
    planBreakdown,
    billingBreakdown,
    buyerCountries,
  }
}

/** Fetches abandoned checkout & recovery email metrics */
export async function fetchCheckoutRecoveryStats(): Promise<CheckoutRecoverySummary> {
  const supabase = getSupabaseAdmin()

  try {
    const [queueRes, emailRes] = await Promise.all([
      supabase.from("macwall_checkout_recovery_queue").select("id, email, created_at"),
      supabase.from("macwall_payment_recovery_emails").select("id, opened_at, clicked_at, converted_at"),
    ])

    const queueRows = queueRes.data ?? []
    const emailRows = emailRes.data ?? []

    const totalAbandoned = queueRows.length
    const emailsSent = emailRows.length
    const emailsOpened = emailRows.filter((r) => Boolean(r.opened_at)).length
    const emailsClicked = emailRows.filter((r) => Boolean(r.clicked_at)).length
    const recoveredConversions = emailRows.filter((r) => Boolean(r.converted_at)).length

    const recoveryRate = emailsSent > 0 ? round1((recoveredConversions / emailsSent) * 100) : 0
    const recoveredRevenueUsd = round2(recoveredConversions * PRO_PRICE_USD)

    const funnel = [
      { stage: "Abandoned Checkout", count: Math.max(totalAbandoned, emailsSent), rate: 100 },
      { stage: "Recovery Email Sent", count: emailsSent, rate: totalAbandoned > 0 ? round1((emailsSent / totalAbandoned) * 100) : 100 },
      { stage: "Email Opened", count: emailsOpened, rate: emailsSent > 0 ? round1((emailsOpened / emailsSent) * 100) : 0 },
      { stage: "Discount Clicked", count: emailsClicked, rate: emailsOpened > 0 ? round1((emailsClicked / emailsOpened) * 100) : 0 },
      { stage: "Recovered Sale", count: recoveredConversions, rate: emailsClicked > 0 ? round1((recoveredConversions / emailsClicked) * 100) : 0 },
    ]

    return {
      totalAbandoned,
      emailsSent,
      emailsOpened,
      emailsClicked,
      recoveredConversions,
      recoveryRatePercent: recoveryRate,
      recoveredRevenueUsd,
      funnel,
    }
  } catch {
    return {
      totalAbandoned: 0,
      emailsSent: 0,
      emailsOpened: 0,
      emailsClicked: 0,
      recoveredConversions: 0,
      recoveryRatePercent: 0,
      recoveredRevenueUsd: 0,
      funnel: [],
    }
  }
}

/** Computes day-of-week sales volume for radar / bar chart */
export function buildDayOfWeekSales(salesRows: SaleRow[]): DayOfWeekSalesRow[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const counts = Array.from({ length: 7 }, (_, i) => ({
    dayName: days[i],
    dayIndex: i,
    sales: 0,
    revenue: 0,
  }))

  for (const row of salesRows) {
    const d = new Date(row.sent_at)
    if (!Number.isNaN(d.getTime())) {
      const idx = d.getUTCDay()
      counts[idx].sales += 1
      counts[idx].revenue = round2(counts[idx].revenue + row.amountUsd)
    }
  }

  // Rotate starting Monday for better business presentation (Mon..Sun)
  return [...counts.slice(1), counts[0]]
}

/** Pure: computes the install→sale funnel from already-fetched rows. */
export function buildConversionFunnel(
  eventRows: AnalyticsEventRow[],
  deviceRows: DeviceRow[],
  saleRows: SaleRow[],
  days: number
): ConversionFunnel {
  const isAllTime = days <= 0 || days >= 3650
  const sinceIso = isAllTime
    ? "1970-01-01T00:00:00.000Z"
    : (() => {
        const since = new Date()
        since.setUTCDate(since.getUTCDate() - days)
        return since.toISOString()
      })()

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
