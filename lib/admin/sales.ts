import "server-only"

import type { AnalyticsEventRow } from "@/lib/analytics/admin-metrics"
import { netRevenueForAmount } from "@/lib/admin/sales-math"
import { fetchStripeLive, type StripePaidCharge } from "@/lib/admin/stripe-live"
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

const STRIPE_FEE_PERCENT = Number.parseFloat(
  process.env.STRIPE_FEE_PERCENT ?? "2.9"
)
const STRIPE_FEE_FIXED = Number.parseFloat(
  process.env.STRIPE_FEE_FIXED ?? "0.30"
)

export { netRevenueForAmount } from "@/lib/admin/sales-math"

export function netRevenuePerSale(): number {
  return netRevenueForAmount(PRO_PRICE_USD)
}

export type SaleRow = {
  sent_at: string
  amountUsd: number
  netUsd?: number
  feeUsd?: number
  paymentIntentId?: string | null
  promoCode?: string | null
}
export type DeviceRow = { activated_at: string }

export type DailySalesRow = { day: string; sales: number; revenue: number }

export type SalesRevenueSource = "stripe" | "licenses"

export type SalesSummary = {
  source: SalesRevenueSource
  pricePerSale: number
  netPerSale: number
  feePercentAssumed: number
  feeFixedAssumed: number
  usedStripeFees: boolean
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
  recentCharges: Array<{
    sent_at: string
    amountUsd: number
    netUsd: number
    promoCode: string | null
    planSlug: string | null
    country: string | null
  }>
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

function rowNet(row: SaleRow): number {
  if (typeof row.netUsd === "number") return row.netUsd
  return netRevenueForAmount(row.amountUsd)
}

function sumNet(rows: SaleRow[]): number {
  return round2(rows.reduce((sum, row) => sum + rowNet(row), 0))
}

function chargeToSaleRow(charge: StripePaidCharge): SaleRow {
  return {
    sent_at: charge.sent_at,
    amountUsd: charge.amountUsd,
    netUsd: charge.netUsd,
    feeUsd: charge.feeUsd,
    paymentIntentId: charge.paymentIntentId,
    promoCode: charge.promoCode,
  }
}

/**
 * Paid Stripe charges first. License counts are not a price source.
 */
export async function fetchAllSales(): Promise<{
  rows: SaleRow[]
  source: SalesRevenueSource
  charges: StripePaidCharge[]
}> {
  try {
    const live = await fetchStripeLive()
    if (live.charges.length > 0) {
      return {
        rows: live.charges.map(chargeToSaleRow),
        source: "stripe",
        charges: live.charges,
      }
    }
  } catch (error) {
    console.warn(
      "[analytics] Stripe sales unavailable",
      error instanceof Error ? error.message : error
    )
  }

  const fallback = await fetchSalesFromLicenses()
  return { rows: fallback, source: "licenses", charges: [] }
}

async function fetchSalesFromLicenses(): Promise<SaleRow[]> {
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
  days: number,
  options?: {
    source?: SalesRevenueSource
    charges?: StripePaidCharge[]
  }
): SalesSummary {
  const source = options?.source ?? "licenses"
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
  const netRevenue = sumNet(currentRows)
  const avgPrice = sales > 0 ? round2(grossRevenue / sales) : PRO_PRICE_USD
  const avgNet = sales > 0 ? round2(netRevenue / sales) : netRevenueForAmount(avgPrice)
  const usedStripeFees = false

  let salesChangePercent: number | null = 0
  if (prevSales > 0) {
    salesChangePercent = round1(((sales - prevSales) / prevSales) * 100)
  } else if (sales > 0) {
    salesChangePercent = null
  }

  const recentCharges = (options?.charges ?? [])
    .slice()
    .sort((a, b) => b.sent_at.localeCompare(a.sent_at))
    .slice(0, 8)
    .map((charge) => ({
      sent_at: charge.sent_at,
      amountUsd: charge.amountUsd,
      netUsd: charge.netUsd,
      promoCode: charge.promoCode,
      planSlug: charge.planSlug,
      country: charge.country,
    }))

  return {
    source,
    pricePerSale: avgPrice,
    netPerSale: avgNet,
    feePercentAssumed: STRIPE_FEE_PERCENT,
    feeFixedAssumed: STRIPE_FEE_FIXED,
    usedStripeFees,
    sales,
    grossRevenue,
    netRevenue,
    prevSales,
    prevGrossRevenue: sumGross(prevRows),
    salesChangePercent,
    allTimeSales,
    allTimeGrossRevenue: sumGross(allSales),
    allTimeNetRevenue: sumNet(allSales),
    firstSaleAt: allSales[0]?.sent_at ?? null,
    daily: bucketByDay(currentRows),
    prevDaily: bucketByDay(prevRows),
    recentCharges,
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
  totalQueued: number
  pending: number
  skipped: number
  cancelled: number
  totalAbandoned: number
  emailsSent: number
  emailsLogged: number
  emailsOpened: number | null
  emailsClicked: number | null
  recoveredConversions: number
  recoveryRatePercent: number
  recoveredRevenueUsd: number
  opensTracked: boolean
  funnel: Array<{ stage: string; count: number; rate: number }>
}

export type DayOfWeekSalesRow = {
  dayName: string
  dayIndex: number
  sales: number
  revenue: number
}

const LICENSE_PAGE_SIZE = 1000

function isPaidActive(row: LicenseDetailedRow): boolean {
  return (row.status || "").toLowerCase() === "active"
}

/** Pro is 3 Macs. Pro+ is 5+ Macs. max_devices > 1 is not Plus. */
function isProPlusLicense(row: LicenseDetailedRow): boolean {
  const plan = (row.plan_slug || "").toLowerCase()
  if (plan === "pro_plus" || plan === "pro_max" || plan.includes("plus")) {
    return true
  }
  return (row.max_devices ?? 0) >= 5
}

/** Fetches every license row. PostgREST caps a single select at 1000. */
export async function fetchAllLicensesDetailed(): Promise<LicenseDetailedRow[]> {
  const supabase = getSupabaseAdmin()
  const rows: LicenseDetailedRow[] = []
  let offset = 0

  while (true) {
    const { data, error } = await supabase
      .from("macwall_licenses")
      .select(
        "status, plan_slug, billing_model, visitor_country, activated_at, max_devices"
      )
      .order("id", { ascending: true })
      .range(offset, offset + LICENSE_PAGE_SIZE - 1)

    if (error) {
      if (error.message.includes("does not exist")) return []
      console.warn("[analytics] fetchAllLicensesDetailed", error.message)
      return rows
    }

    const batch = (data ?? []) as LicenseDetailedRow[]
    rows.push(...batch)
    if (batch.length < LICENSE_PAGE_SIZE) break
    offset += LICENSE_PAGE_SIZE
  }

  return rows
}

/** Builds license metrics. Plan mix and geo are paid (active) licenses only. */
export function buildLicenseAnalytics(
  licenses: LicenseDetailedRow[],
  _activeSalesCount?: number
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
    const st = (row.status || "").toLowerCase()
    if (st === "active") active++
    else if (st === "pending") pending++
    else if (st === "expired") expired++
    else if (st === "revoked") revoked++

    if (!isPaidActive(row)) continue

    const billing = (row.billing_model || "permanent").toLowerCase()
    const isAnnual =
      billing === "annual" ||
      billing === "subscription" ||
      (row.plan_slug || "").toLowerCase().includes("annual")

    if (isAnnual) {
      annual++
      subscription++
    } else if (isProPlusLicense(row)) {
      proPlus++
      permanent++
    } else {
      pro++
      permanent++
    }

    if (row.visitor_country && /^[A-Z]{2}$/i.test(row.visitor_country)) {
      const c = row.visitor_country.toUpperCase()
      countryTotals.set(c, (countryTotals.get(c) ?? 0) + 1)
    }
  }

  const total = active + pending + expired + revoked

  const statusBreakdown = [
    { status: "active", label: "Active Pro", count: active, color: "#17b26a" },
    { status: "pending", label: "Pending Checkout", count: pending, color: "#f79009" },
    { status: "expired", label: "Expired", count: expired, color: "#98a2b3" },
    { status: "revoked", label: "Revoked", count: revoked, color: "#f04438" },
  ].filter((s) => s.count > 0 || total === 0)

  const planBreakdown = [
    { plan: "pro", label: "MacWall Pro", count: pro, color: "#0071e3" },
    { plan: "pro_plus", label: "Pro Plus 5-Mac", count: proPlus, color: "#7a5af8" },
    { plan: "annual", label: "Legacy Annual", count: annual, color: "#06aed4" },
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
export async function fetchCheckoutRecoveryStats(
  sinceIso: string,
  charges: StripePaidCharge[]
): Promise<CheckoutRecoverySummary> {
  const empty: CheckoutRecoverySummary = {
    totalQueued: 0,
    pending: 0,
    skipped: 0,
    cancelled: 0,
    totalAbandoned: 0,
    emailsSent: 0,
    emailsLogged: 0,
    emailsOpened: null,
    emailsClicked: null,
    recoveredConversions: 0,
    recoveryRatePercent: 0,
    recoveredRevenueUsd: 0,
    opensTracked: false,
    funnel: [],
  }

  const supabase = getSupabaseAdmin()

  const [queueRangeRes, queueIdsRes, emailRes, recoveredRes] = await Promise.all([
    supabase
      .from("macwall_checkout_recovery_queue")
      .select("status")
      .gte("created_at", sinceIso)
      .limit(20000),
    supabase
      .from("macwall_checkout_recovery_queue")
      .select("checkout_session_id")
      .limit(20000),
    supabase
      .from("macwall_payment_recovery_emails")
      .select("id, created_at")
      .gte("created_at", sinceIso)
      .limit(5000),
    supabase
      .from("macwall_licenses")
      .select(
        "stripe_checkout_session_id, stripe_payment_intent_id, activated_at"
      )
      .eq("status", "active")
      .not("activated_at", "is", null)
      .gte("activated_at", sinceIso)
      .limit(10000),
  ])

  if (queueRangeRes.error) {
    console.warn("[analytics] recovery queue", queueRangeRes.error.message)
    return empty
  }

  const queueRows = queueRangeRes.data ?? []
  const emailRows = emailRes.data ?? []
  const recoveredLicenses = recoveredRes.data ?? []

  let pending = 0
  let skipped = 0
  let cancelled = 0
  let emailsSent = 0
  const queuedSessionIds = new Set<string>()

  for (const row of queueIdsRes.data ?? []) {
    if (typeof row.checkout_session_id === "string") {
      queuedSessionIds.add(row.checkout_session_id)
    }
  }

  for (const row of queueRows) {
    const status = (row.status || "").toLowerCase()
    if (status === "pending") pending += 1
    else if (status === "skipped") skipped += 1
    else if (status === "cancelled") cancelled += 1
    else if (status === "sent") emailsSent += 1
  }

  const recovered = recoveredLicenses.filter((row) => {
    const sessionId = row.stripe_checkout_session_id
    return typeof sessionId === "string" && queuedSessionIds.has(sessionId)
  })

  const recoveredIntentIds = new Set(
    recovered
      .map((row) => row.stripe_payment_intent_id)
      .filter((id): id is string => typeof id === "string")
  )
  const recoveredSessionIds = new Set(
    recovered
      .map((row) => row.stripe_checkout_session_id)
      .filter((id): id is string => typeof id === "string")
  )
  const stripeRecovered = charges.filter(
    (charge) =>
      Boolean(charge.recoveredFrom) ||
      (charge.paymentIntentId != null &&
        recoveredIntentIds.has(charge.paymentIntentId)) ||
      (charge.checkoutSessionId != null &&
        recoveredSessionIds.has(charge.checkoutSessionId))
  )
  const recoveredRevenueUsd = round2(
    stripeRecovered.reduce((sum, charge) => sum + charge.amountUsd, 0)
  )

  const totalQueued = queueRows.length
  const emailsLogged = emailRows.length
  const recoveredConversions = Math.max(recovered.length, stripeRecovered.length)
  const recoveryRate =
    totalQueued > 0 ? round1((recoveredConversions / totalQueued) * 100) : 0

  const funnel = [
    { stage: "Queued for recovery", count: totalQueued, rate: 100 },
    {
      stage: "Recovery email sent",
      count: emailsSent,
      rate: totalQueued > 0 ? round1((emailsSent / totalQueued) * 100) : 0,
    },
    {
      stage: "Later became a paid license",
      count: recoveredConversions,
      rate:
        totalQueued > 0
          ? round1((recoveredConversions / totalQueued) * 100)
          : 0,
    },
  ]

  return {
    totalQueued,
    pending,
    skipped,
    cancelled,
    totalAbandoned: pending + emailsSent,
    emailsSent,
    emailsLogged,
    emailsOpened: null,
    emailsClicked: null,
    recoveredConversions,
    recoveryRatePercent: recoveryRate,
    recoveredRevenueUsd,
    opensTracked: false,
    funnel,
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
