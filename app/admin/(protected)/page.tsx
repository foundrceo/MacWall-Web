"use client"

/**
 * Analytics — Sales, Live Users, License Breakdown, Promos, Funnels,
 * Checkout Recovery, Catalog Health & Community Engagement.
 */

import { useCallback, useEffect, useState, type ReactNode } from "react"
import {
  Activity,
  CircleCheck,
  Clock,
  Cloud,
  CreditCard,
  Download,
  Flame,
  Globe,
  Heart,
  Images,
  Key,
  Laptop,
  Mail,
  MessageSquare,
  MousePointerClick,
  Percent,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Tag,
  TrendingUp,
  TriangleAlert,
  Users,
  Zap,
} from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import {
  CategoryDonut,
  ConversionFunnelChart,
  DailyActivityChart,
  DailySalesBarChart,
  DayOfWeekRadarChart,
  DownloadActivityChart,
  EventsSummaryList,
  FeedbackSentimentPieChart,
  HourlyActivityHeatmapGrid,
  LicensePlanPieChart,
  LicenseStatusDonut,
  PromoCodeBarChart,
  RankedBarList,
  RingGauge,
  SalesComparisonChart,
  StatRing,
  TopPagesList,
} from "@/components/admin/admin-charts"
import {
  AdminBadge,
  AdminStatusDot,
  PanelHeader,
  SectionHeading,
  StatCard,
  StatCardSkeleton,
  type Tone,
} from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatRelativeTime, formatUsd } from "@/lib/admin/format"
import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */

type AnalyticsResponse = {
  rangeDays: number
  since: string
  lastEventAt: string | null
  eventCounts: Array<{ event_name: string; count: number }>
  dailyCounts: Array<{ day: string; event_name: string; count: number }>
  downloadFunnel?: {
    clicks: number
    redirects: number
    uniqueRedirectSessions: number
    completionRate: number
  }
  downloadClicksByLocation?: Array<{ location: string; count: number }>
  pricingClicksByLocation?: Array<{ location: string; count: number }>
  visitorsByCountry?: Array<{ country: string; count: number }>
  indiaAudience?: {
    pageViews: number
    uniqueSessions: number
    pricingClicks: number
    ctaClicks: number
    announcementClicks: number
  }
  downloadDaily?: Array<{ day: string; event_name: string; count: number }>
  topPages: Array<{ path: string; count: number }>
  communityUploads: { pending: number; approved: number; rejected: number }
  catalogWallpaperCount: number
  totalLikes: number
  activatedDevicesAllTime?: number
  activatedDevicesInRange?: number
  wallpaperCategoryCounts?: Array<{ category: string; count: number }>
  topLikedWallpapers?: Array<{
    id: string
    name: string
    category: string
    likeCount: number
  }>
  sales?: {
    source?: "stripe" | "licenses"
    pricePerSale: number
    netPerSale: number
    feePercentAssumed: number
    feeFixedAssumed: number
    usedStripeFees?: boolean
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
    daily: Array<{ day: string; sales: number; revenue: number }>
    prevDaily: Array<{ day: string; sales: number; revenue: number }>
    recentCharges?: Array<{
      sent_at: string
      amountUsd: number
      netUsd: number
      promoCode: string | null
      planSlug: string | null
      country: string | null
    }>
  }
  conversionFunnel?: {
    pageViews: number
    uniqueVisitors: number
    downloadClicks: number
    uniqueDownloadClickSessions?: number
    installerRedirects: number
    uniqueInstallSessions: number
    activatedDevices: number
    sales: number
    visitorToDownloadRate: number
    downloadToRedirectRate?: number
    installToSaleRate: number
    visitorToSaleRate: number
  }
  licenseAnalytics?: {
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
  liveActivity?: {
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
  dayOfWeekSales?: Array<{ dayName: string; sales: number; revenue: number }>
  hourlyHeatmap?: Array<{
    dayOfWeek: string
    dayIndex: number
    hour: number
    count: number
    intensity: number
  }>
  promoDiscount?: {
    totalDiscountClicks: number
    indiaOfferClicks: number
    announcementPromoClicks: number
    checkoutPromoAttempts: number
    promoCodesBreakdown: Array<{ code: string; count: number; label: string }>
    discountLocations: Array<{ location: string; count: number; label: string }>
    effectiveDiscountRate: number
  }
  sessionEngagement?: {
    totalSessions: number
    totalPageViews: number
    avgPagesPerSession: number
    singlePageSessionRate: number
    topExitOrLandingPages: Array<{ path: string; count: number }>
  }
  recoveryStats?: {
    totalQueued?: number
    pending?: number
    skipped?: number
    cancelled?: number
    totalAbandoned: number
    emailsSent: number
    emailsLogged?: number
    emailsOpened: number | null
    emailsClicked: number | null
    recoveredConversions: number
    recoveryRatePercent: number
    recoveredRevenueUsd: number
    opensTracked?: boolean
    funnel: Array<{ stage: string; count: number; rate: number }>
  }
  stripeLive?: {
    balance: {
      availableUsd: number
      pendingUsd: number
      instantAvailableUsd: number
    } | null
    promotions: Array<{
      id: string
      code: string
      active: boolean
      timesRedeemed: number
      maxRedemptions: number | null
    }>
    chargeCount: number
    error?: string
  }
  opsLive?: {
    resend: {
      available: boolean
      error?: string
      sent: number
      delivered: number
      bounced: number
      opened: number
      clicked: number
      deliveryRate: number
    }
    cloudflare: {
      available: boolean
      error?: string
      accountId: string
      buckets: Array<{ name: string; reachable: boolean }>
    }
    vercel: {
      available: boolean
      error?: string
      projectName: string
      productionUrl: string | null
      latest: Array<{
        id: string
        url: string
        state: string
        target: string | null
        createdAt: string
        commit: string | null
      }>
    }
  }
  feedbackTotals?: {
    total: number
    open: number
    resolved: number
    needsReply: number
    sentiments: Array<{ label: string; sentiment: string; count: number; color: string }>
  }
}

const RANGES = [
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "90d", value: 90 },
  { label: "All time", value: 0 },
] as const

const DOWNLOAD_LOCATION_LABELS: Record<string, string> = {
  header_desktop: "Header (desktop)",
  header_mobile: "Header (mobile menu)",
  hero: "Homepage hero",
  announcement_bar: "Announcement bar",
  footer_shop_download: "Footer (desktop)",
  footer_mobile_download: "Footer (mobile)",
}

const PRICING_LOCATION_LABELS: Record<string, string> = {
  pricing_card: "Pricing page CTA",
  india_pricing_offer: "India flash offer (10% off)",
  bottom_cta: "Bottom CTA section",
  footer_shop_buy: "Footer buy (desktop)",
  footer_mobile_shop: "Footer buy (mobile)",
  announcement_bar: "Announcement banner",
}

/* Local layout helpers */

function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: Readonly<{
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}>) {
  return (
    <Card className={cn("gap-0 overflow-hidden py-0", className)}>
      <PanelHeader title={title} description={description} action={action} />
      <div className={cn("px-5 py-4", bodyClassName)}>{children}</div>
    </Card>
  )
}

function Section({
  title,
  description,
  action,
  children,
}: Readonly<{
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}>) {
  return (
    <section className="space-y-4">
      <SectionHeading title={title} description={description} action={action} />
      {children}
    </section>
  )
}

/* -------------------------------------------------------------------------- */

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState<number>(7)
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (rangeDays: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/analytics?days=${rangeDays}`, {
        cache: "no-store",
        credentials: "same-origin",
      })
      const json = (await res.json()) as AnalyticsResponse & { error?: string }
      if (!res.ok) throw new Error(json.error ?? "Failed to load analytics")
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void load(days)
    })
  }, [days, load])

  const downloadClicks =
    data?.downloadFunnel?.clicks ??
    data?.eventCounts.find((e) => e.event_name === "download_click")?.count ??
    0
  const downloadRedirects =
    data?.downloadFunnel?.redirects ??
    data?.eventCounts.find((e) => e.event_name === "download_redirect")?.count ??
    0
  const uniqueDownloadSessions =
    data?.conversionFunnel?.uniqueDownloadClickSessions ??
    data?.downloadFunnel?.uniqueRedirectSessions ??
    0
  const pricingClicks =
    data?.eventCounts.find((e) => e.event_name === "pricing_click")?.count ?? 0
  const pageViews =
    data?.eventCounts.find((e) => e.event_name === "page_view")?.count ?? 0

  const uploadTotal = data
    ? data.communityUploads.pending +
      data.communityUploads.approved +
      data.communityUploads.rejected
    : 0
  const uploadApprovalRate =
    uploadTotal > 0
      ? Math.round((data!.communityUploads.approved / uploadTotal) * 100)
      : 0
  const avgLikes =
    data && data.catalogWallpaperCount > 0
      ? Math.round(data.totalLikes / data.catalogWallpaperCount)
      : 0
  const activatedAllTime =
    data?.activatedDevicesAllTime ?? 0
  const chartDays = data?.rangeDays ?? days
  const sales = data?.sales
  const funnel = data?.conversionFunnel
  const licenses = data?.licenseAnalytics
  const live = data?.liveActivity
  const promos = data?.promoDiscount
  const recovery = data?.recoveryStats
  const feedback = data?.feedbackTotals
  const sessions = data?.sessionEngagement

  const rangeLabel =
    data?.rangeDays === 0
      ? "all-time"
      : `last ${data?.rangeDays ?? days} days`

  return (
    <AdminShell
      title="Analytics"
      largeTitle
      actions={
        <>
          {data ? <TrackingPill data={data} /> : null}
          <Tabs
            value={String(days)}
            onValueChange={(value) => setDays(Number(value))}
          >
            <TabsList className="h-8">
              {RANGES.map((range) => (
                <TabsTrigger
                  key={range.value}
                  value={String(range.value)}
                  className="h-full px-3 text-xs"
                >
                  {range.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void load(days)}
            disabled={loading}
            aria-label="Refresh analytics"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </>
      }
    >
      <div className="space-y-10">
        {error ? (
          <div className="flex items-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-red-soft)] px-4 py-3 text-[13px] text-[var(--admin-red)]">
            <TriangleAlert className="size-4 shrink-0" />
            {error}
          </div>
        ) : null}

        {loading && !data ? <DashboardSkeleton /> : null}

        {data ? (
          <>
            <p className="text-[13px] text-[var(--admin-muted)]">
              {data.rangeDays === 0
                ? sales?.source === "stripe"
                  ? "All-time totals from live Stripe charges and first-party events."
                  : "All-time totals from licenses and first-party events."
                : sales?.source === "stripe"
                  ? `Stripe payouts and first-party events for the last ${data.rangeDays} days.`
                  : `Daily totals for the last ${data.rangeDays} days.`}
            </p>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Active now"
                value={live?.activeUsers5m ?? 0}
                hint={`${live?.activeUsers24h ?? 0} in the last 24h`}
                icon={<Radio className="size-4" />}
              />
              <StatCard
                label="Sales"
                value={sales?.sales ?? 0}
                hint={
                  sales
                    ? `${sales.prevSales} in the previous period`
                    : "No sales in this range"
                }
                trend={
                  sales?.salesChangePercent != null
                    ? {
                        value: sales.salesChangePercent,
                        label: `${sales.prevSales} previous period`,
                      }
                    : undefined
                }
                icon={<CreditCard className="size-4" />}
              />
              <StatCard
                label="Net revenue"
                value={sales ? formatUsd(sales.netRevenue) : "$0"}
                hint={
                  sales?.source === "stripe"
                    ? "Paid Stripe Checkout totals, including promo codes"
                    : data.stripeLive?.error
                      ? "Stripe unavailable. License list prices."
                      : "License counts times list prices. Stripe unavailable."
                }
                icon={<TrendingUp className="size-4" />}
              />
              <StatCard
                label="Needs reply"
                value={feedback?.needsReply ?? data.communityUploads.pending}
                hint={
                  feedback
                    ? `${feedback.open} open tickets · ${data.communityUploads.pending} pending uploads`
                    : `${data.communityUploads.pending} pending uploads`
                }
                icon={<MessageSquare className="size-4" />}
              />
            </div>

            {sales ? (
              <Panel
                title="Revenue over time"
                description={
                  sales.source === "stripe"
                    ? "Paid Stripe Checkout amount_total in the selected range"
                    : "License list-price estimate. Stripe Checkout unavailable."
                }
              >
                <SalesComparisonChart
                  daily={sales.daily}
                  prevDaily={sales.prevDaily}
                  days={data.rangeDays}
                  metric="revenue"
                />
              </Panel>
            ) : null}

            {/* 1. Live Real-time Activity Center */}
            {live ? (
              <Section
                title="Live & Real-time Activity"
                description="Instant audience pulse across web and app"
              >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    icon={<Radio className="size-4 text-emerald-500 animate-pulse" />}
                    label="Active now (5m)"
                    value={live.activeUsers5m}
                    hint={`${live.activeUsers15m} in last 15m · ${live.activeUsers1h} in last 1h`}
                  />
                  <StatCard
                    icon={<Zap className="size-4 text-blue-500" />}
                    label="24h Active Users"
                    value={live.activeUsers24h}
                    hint={`${live.eventsLastHour} actions in past hour`}
                  />
                  <StatCard
                    icon={<Flame className="size-4 text-amber-500" />}
                    label="Avg Pages / Visit"
                    value={sessions?.avgPagesPerSession ?? 0}
                    hint={`${sessions?.totalSessions ?? 0} total sessions`}
                  />
                  <StatCard
                    icon={<Laptop className="size-4 text-indigo-500" />}
                    label="Macs Activated"
                    value={activatedAllTime}
                    hint={
                      data.rangeDays === 0
                        ? "All-time activations"
                        : `${data.activatedDevicesInRange ?? 0} in ${data.rangeDays}d window`
                    }
                  />
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
                  <Panel
                    title="Live Actions Breakdown"
                    description="What active users are currently doing on MacWall"
                  >
                    {live.currentActions.length === 0 ? (
                      <p className="text-[13px] text-[var(--admin-muted)] py-6 text-center">
                        No actions in the last hour.
                      </p>
                    ) : (
                      <div className="space-y-3 py-2">
                        {live.currentActions.map((act) => {
                          const totalActs = live.currentActions.reduce((acc, a) => acc + a.count, 0)
                          const pct = totalActs > 0 ? Math.round((act.count / totalActs) * 100) : 0
                          return (
                            <div key={act.action} className="space-y-1.5">
                              <div className="flex items-center justify-between text-[13px]">
                                <span className="flex items-center gap-2 text-[var(--admin-fg-soft)]">
                                  <span className="size-2.5 rounded-full" style={{ backgroundColor: act.color }} />
                                  {act.label}
                                </span>
                                <span className="font-medium text-[var(--admin-fg)] tabular-nums">
                                  {act.count} <span className="text-xs text-[var(--admin-muted)]">({pct}%)</span>
                                </span>
                              </div>
                              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--admin-fill)]">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ width: `${pct}%`, backgroundColor: act.color }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </Panel>

                  <Panel
                    title="Recent Live Stream"
                    description="Latest incoming events with location & timing"
                  >
                    {live.recentLiveFeed.length === 0 ? (
                      <p className="text-[13px] text-[var(--admin-muted)] py-6 text-center">
                        Quiet stream.
                      </p>
                    ) : (
                      <ol className="space-y-2.5">
                        {live.recentLiveFeed.slice(0, 5).map((feed, idx) => (
                          <li
                            key={idx}
                            className="flex items-center justify-between gap-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-canvas)] px-3 py-2 text-[12px]"
                          >
                            <div className="min-w-0 flex-1 truncate">
                              <span className="font-medium text-[var(--admin-fg)]">
                                {feed.eventName.replace(/_/g, " ")}
                              </span>
                              {feed.path ? (
                                <span className="ml-1.5 text-[var(--admin-muted)]">
                                  {feed.path}
                                </span>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {feed.country ? (
                                <AdminBadge tone="neutral">
                                  {feed.country}
                                </AdminBadge>
                              ) : null}
                              <span className="text-[11px] text-[var(--admin-muted)]">
                                {feed.agoSeconds < 60 ? `${feed.agoSeconds}s ago` : `${Math.round(feed.agoSeconds / 60)}m ago`}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ol>
                    )}
                  </Panel>
                </div>
              </Section>
            ) : null}

            {/* 2. License Breakdown & Free vs Paid */}
            {licenses ? (
              <Section
                title="License Base & Free vs Paid"
                description="Paid licenses vs unfinished checkouts from macwall_licenses"
              >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    icon={<Key className="size-4 text-emerald-500" />}
                    label="Active licenses"
                    value={licenses.activeLicenses}
                    hint={`${licenses.proLicenses} Pro · ${licenses.proPlusLicenses} Pro+`}
                  />
                  <StatCard
                    icon={<Clock className="size-4 text-amber-500" />}
                    label="Pending checkouts"
                    value={licenses.pendingLicenses}
                    hint="Checkout started, not paid"
                  />
                  <StatCard
                    icon={<ShieldCheck className="size-4 text-blue-500" />}
                    label="Lifetime vs Annual"
                    value={`${licenses.permanentLicenses} : ${licenses.annualLicenses}`}
                    hint="Paid licenses only"
                  />
                  <StatCard
                    icon={<Globe className="size-4 text-purple-500" />}
                    label="Top buyer country"
                    value={licenses.buyerCountries[0]?.country ?? "—"}
                    hint={
                      licenses.buyerCountries.length > 0
                        ? `${licenses.buyerCountries.length} countries on paid licenses`
                        : "No country on paid licenses"
                    }
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <Panel title="Plan Distribution" description="Paid licenses only. Pro is 3 Macs. Pro+ is 5 or more.">
                    <LicensePlanPieChart rows={licenses.planBreakdown} />
                  </Panel>
                  <Panel title="License Status Breakdown" description="Every row in macwall_licenses">
                    <LicenseStatusDonut rows={licenses.statusBreakdown} />
                  </Panel>
                  <Panel title="Top Buyer Geo-Locations" description="visitor_country on paid licenses">
                    <RankedBarList
                      rows={licenses.buyerCountries.map((b) => ({
                        label: b.country,
                        value: b.count,
                      }))}
                      color="#3b82f6"
                    />
                  </Panel>
                </div>

              </Section>
            ) : null}

            {/* 3. Sales & Revenue */}
            {sales ? (
              <Section
                title="Sales & Revenue"
                description={
                  sales.source === "stripe"
                    ? data.rangeDays === 0
                      ? "Live Stripe Checkout. Amounts are what customers paid, including promos."
                      : `Live Stripe Checkout. Last ${data.rangeDays} days compared with the previous ${data.rangeDays}.`
                    : data.stripeLive?.error
                      ? "Stripe unavailable. Showing license list prices."
                      : "Stripe Checkout unavailable. Showing license list prices."
                }
              >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    icon={<CreditCard className="size-4" />}
                    label="Gross revenue"
                    value={formatUsd(sales.grossRevenue)}
                    hint={`${sales.sales} sales · prev ${formatUsd(sales.prevGrossRevenue)}`}
                    trend={
                      sales.salesChangePercent != null
                        ? { value: sales.salesChangePercent }
                        : undefined
                    }
                  />
                  <StatCard
                    icon={<TrendingUp className="size-4" />}
                    label="Net revenue"
                    value={formatUsd(sales.netRevenue)}
                    hint={`${formatUsd(sales.netPerSale)} average after estimated 2.9% + $0.30 fees`}
                  />
                  <StatCard
                    label="All-time revenue"
                    value={formatUsd(sales.allTimeGrossRevenue)}
                    hint={`${sales.allTimeSales} lifetime sales`}
                  />
                  <StatCard
                    label="Visitor → Sale Rate"
                    value={`${funnel?.visitorToSaleRate ?? 0}%`}
                    hint="Purchases per unique visitor"
                  />
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
                  <Panel
                    title="Revenue Over Time (USD)"
                    description="Solid is this period, dotted is the previous period"
                  >
                    <SalesComparisonChart
                      daily={sales.daily}
                      prevDaily={sales.prevDaily}
                      days={data.rangeDays}
                      metric="revenue"
                    />
                  </Panel>

                  <Panel
                    title="Conversion Funnel"
                    description="Site visit through to activated Pro licence"
                  >
                    {funnel ? (
                      <ConversionFunnelChart
                        steps={[
                          {
                            label: "Unique visitors",
                            value: funnel.uniqueVisitors,
                            hint: `${funnel.pageViews} views`,
                          },
                          {
                            label: "Download clicks",
                            value: funnel.downloadClicks,
                            hint: `${funnel.uniqueDownloadClickSessions ?? 0} sessions`,
                          },
                          {
                            label: "Installer redirects",
                            value: funnel.installerRedirects,
                          },
                          {
                            label: "Devices activated",
                            value: funnel.activatedDevices,
                          },
                          { label: "Pro Purchases", value: funnel.sales },
                        ]}
                      />
                    ) : (
                      <p className="text-[13px] text-[var(--admin-muted)]">
                        No funnel data in range.
                      </p>
                    )}
                  </Panel>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Panel
                    title="Daily Sales Count"
                    description="Number of completed checkouts per day"
                  >
                    <DailySalesBarChart daily={sales.daily} days={data.rangeDays} />
                  </Panel>

                  <Panel
                    title="Sales by Day of Week"
                    description="Weekly purchase volume distribution"
                  >
                    {data.dayOfWeekSales ? (
                      <DayOfWeekRadarChart rows={data.dayOfWeekSales} />
                    ) : (
                      <p className="text-[13px] text-[var(--admin-muted)]">No day volume.</p>
                    )}
                  </Panel>
                </div>

                {(sales.recentCharges ?? []).length > 0 ? (
                  <Panel
                    title="Latest Stripe checkouts"
                    description="amount_total after promo codes"
                  >
                    <ol className="space-y-2">
                      {sales.recentCharges?.map((charge, index) => (
                        <li
                          key={`${charge.sent_at}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-canvas)] px-3 py-2 text-[12px]"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-[var(--admin-fg)] tabular-nums">
                              {formatUsd(charge.amountUsd)}
                              <span className="ml-2 font-normal text-[var(--admin-muted)]">
                                net {formatUsd(charge.netUsd)}
                              </span>
                            </p>
                            <p className="truncate text-[var(--admin-muted)]">
                              {charge.planSlug ?? "license"}
                              {charge.promoCode ? ` · ${charge.promoCode}` : ""}
                              {charge.country ? ` · ${charge.country}` : ""}
                            </p>
                          </div>
                          <span className="shrink-0 text-[11px] text-[var(--admin-muted)]">
                            {formatRelativeTime(charge.sent_at)}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </Panel>
                ) : null}
              </Section>
            ) : null}

            {/* 4. Discounts, Promo Codes & Campaigns */}
            {promos ? (
              <Section
                title="Discounts & Promo Code Intelligence"
                description="Discount redemptions, flash sales, and announcement bar impact"
              >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    icon={<Tag className="size-4 text-amber-500" />}
                    label="Discount Clicks"
                    value={promos.totalDiscountClicks}
                    hint="Visitors interacting with discount CTAs"
                  />
                  <StatCard
                    icon={<Percent className="size-4 text-emerald-500" />}
                    label="Promo Redemptions"
                    value={promos.checkoutPromoAttempts}
                    hint={
                      data.stripeLive?.promotions.length
                        ? "Stripe promotion codes, lifetime redemptions"
                        : "Checkout events that included a promo"
                    }
                  />
                  <StatCard
                    icon={<Sparkles className="size-4 text-purple-500" />}
                    label="India Flash Offer"
                    value={promos.indiaOfferClicks}
                    hint="India pricing discount clicks"
                  />
                  <StatCard
                    icon={<Zap className="size-4 text-blue-500" />}
                    label="Banner CTR"
                    value={promos.announcementPromoClicks}
                    hint="Top announcement banner taps"
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Panel
                    title="Promo Code Redemptions"
                    description={
                      data.stripeLive?.promotions.length
                        ? "Live Stripe promotion_codes.times_redeemed"
                        : "First-party checkout promo events"
                    }
                  >
                    <PromoCodeBarChart rows={promos.promoCodesBreakdown} />
                  </Panel>

                  <Panel
                    title="Discount Origin Locations"
                    description="Where users clicked to claim their discount"
                  >
                    <RankedBarList
                      rows={promos.discountLocations.map((d) => ({
                        label: d.label,
                        value: d.count,
                      }))}
                      color="#f79009"
                    />
                  </Panel>
                </div>
              </Section>
            ) : null}

            {/* 5. Checkout Recovery Email Funnel */}
            {recovery ? (
              <Section
                title="Checkout Abandonment & Recovery"
                description="Supabase recovery queue. Rescued revenue is matched Stripe charges."
              >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    icon={<Mail className="size-4 text-blue-500" />}
                    label="Recovery Emails Sent"
                    value={recovery.emailsSent}
                    hint={`${recovery.totalQueued ?? recovery.totalAbandoned} queued · ${recovery.pending ?? 0} pending · ${recovery.skipped ?? 0} skipped`}
                  />
                  <StatCard
                    icon={<MousePointerClick className="size-4 text-indigo-500" />}
                    label="Email opens"
                    value={
                      recovery.opensTracked && recovery.emailsOpened != null
                        ? `${recovery.emailsOpened}`
                        : "Not tracked"
                    }
                    hint={
                      recovery.emailsLogged
                        ? `${recovery.emailsLogged} rows in payment recovery log`
                        : "Open and click columns are not stored"
                    }
                  />
                  <StatCard
                    icon={<CircleCheck className="size-4 text-emerald-500" />}
                    label="Rescued Sales"
                    value={recovery.recoveredConversions}
                    hint={`${recovery.recoveryRatePercent}% of queued checkouts later paid`}
                  />
                  <StatCard
                    icon={<TrendingUp className="size-4 text-emerald-500" />}
                    label="Rescued Revenue"
                    value={formatUsd(recovery.recoveredRevenueUsd)}
                    hint="Stripe amounts for recovered licenses"
                  />
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
                  <Panel
                    title="Recovery Email Conversion Funnel"
                    description="Abandoned checkout to recovered purchase"
                  >
                    <ConversionFunnelChart
                      steps={recovery.funnel.map((f) => ({
                        label: f.stage,
                        value: f.count,
                        hint: `${f.rate}% step conversion`,
                      }))}
                    />
                  </Panel>

                  <Panel
                    title="Recovery Efficiency"
                    description="Percentage of abandoned carts rescued"
                    bodyClassName="py-6"
                  >
                    <RingGauge
                      value={recovery.recoveryRatePercent}
                      caption={`${recovery.recoveredConversions} of ${recovery.totalQueued ?? recovery.totalAbandoned} queued`}
                      color="#22c55e"
                    />
                  </Panel>
                </div>
              </Section>
            ) : null}

            {data.stripeLive || data.opsLive ? (
              <Section
                title="Live services"
                description="Stripe, Resend, Cloudflare R2, and Vercel. Missing keys stay empty."
              >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <StatCard
                    icon={<CreditCard className="size-4" />}
                    label="Stripe available"
                    value={
                      data.stripeLive?.balance
                        ? formatUsd(data.stripeLive.balance.availableUsd)
                        : "—"
                    }
                    hint={
                      data.stripeLive?.balance
                        ? `${formatUsd(data.stripeLive.balance.pendingUsd)} pending · ${data.stripeLive.chargeCount} paid charges cached`
                        : data.stripeLive?.error
                          ? /expired|invalid/i.test(data.stripeLive.error)
                            ? "Stripe key expired. Balance unavailable."
                            : "Stripe unavailable"
                          : "Stripe balance unavailable"
                    }
                  />
                  <StatCard
                    icon={<Mail className="size-4 text-blue-500" />}
                    label="Resend delivered"
                    value={
                      data.opsLive?.resend.available
                        ? data.opsLive.resend.delivered
                        : "—"
                    }
                    hint={
                      data.opsLive?.resend.available
                        ? `${data.opsLive.resend.sent} sent · ${data.opsLive.resend.deliveryRate}% delivered`
                        : data.opsLive?.resend.error ?? "RESEND_API_KEY not set"
                    }
                  />
                  <StatCard
                    icon={<Cloud className="size-4 text-orange-400" />}
                    label="Cloudflare R2"
                    value={
                      data.opsLive?.cloudflare.available
                        ? `${data.opsLive.cloudflare.buckets.filter((b) => b.reachable).length}/${data.opsLive.cloudflare.buckets.length}`
                        : "—"
                    }
                    hint={
                      data.opsLive?.cloudflare.available
                        ? data.opsLive.cloudflare.buckets
                            .map((bucket) => `${bucket.name}${bucket.reachable ? "" : " down"}`)
                            .join(" · ")
                        : data.opsLive?.cloudflare.error ?? "R2 credentials not set"
                    }
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Panel
                    title="Vercel production"
                    description={
                      data.opsLive?.vercel.available
                        ? data.opsLive.vercel.productionUrl ?? "macwall.app"
                        : data.opsLive?.vercel.error ?? "VERCEL_TOKEN not set"
                    }
                  >
                    {data.opsLive?.vercel.available &&
                    data.opsLive.vercel.latest.length > 0 ? (
                      <ol className="space-y-2">
                        {data.opsLive.vercel.latest.slice(0, 5).map((deploy) => (
                          <li
                            key={deploy.id}
                            className="flex items-start justify-between gap-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-canvas)] px-3 py-2 text-[12px]"
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-[var(--admin-fg)]">
                                {deploy.target ?? "preview"} · {deploy.state}
                              </p>
                              <p className="truncate text-[var(--admin-muted)]">
                                {deploy.commit ?? deploy.url}
                              </p>
                            </div>
                            <span className="shrink-0 text-[11px] text-[var(--admin-muted)]">
                              {deploy.createdAt
                                ? formatRelativeTime(deploy.createdAt)
                                : ""}
                            </span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="py-6 text-center text-[13px] text-[var(--admin-muted)]">
                        {data.opsLive?.vercel.error ?? "No deployments loaded."}
                      </p>
                    )}
                  </Panel>

                  <Panel
                    title="Stripe promotion codes"
                    description="Redemptions from the live Stripe account"
                  >
                    {(data.stripeLive?.promotions ?? []).length > 0 ? (
                      <RankedBarList
                        rows={(data.stripeLive?.promotions ?? []).map((promo) => ({
                          label: promo.code,
                          value: promo.timesRedeemed,
                        }))}
                        color="#22c55e"
                      />
                    ) : (
                      <p className="py-6 text-center text-[13px] text-[var(--admin-muted)]">
                        No Stripe promotion codes loaded.
                      </p>
                    )}
                  </Panel>
                </div>
              </Section>
            ) : null}

            {/* 6. Traffic, Downloads & Heatmap */}
            <Section
              title="Traffic & Downloads"
              description={`First-party telemetry · ${rangeLabel}`}
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  icon={<Activity className="size-4" />}
                  label="Page views"
                  value={pageViews}
                  hint="Tracked marketing pages"
                />
                <StatCard
                  icon={<Download className="size-4" />}
                  label="Download clicks"
                  value={downloadClicks}
                  hint="CTA taps across site"
                />
                <StatCard
                  icon={<MousePointerClick className="size-4" />}
                  label="Installer redirects"
                  value={downloadRedirects}
                  hint="Direct app binary fetches"
                />
                <StatCard
                  icon={<Users className="size-4" />}
                  label="Unique downloaders"
                  value={uniqueDownloadSessions}
                  hint="Unique visitor sessions"
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
                <Panel
                  title="Daily Telemetry Activity"
                  description="All events aggregated across days"
                >
                  <DailyActivityChart
                    rows={data.dailyCounts}
                    days={chartDays}
                  />
                </Panel>

                <Panel
                  title="Download Completion Rate"
                  description="Clicks that initiated the installer"
                  bodyClassName="py-6"
                >
                  <RingGauge
                    value={data.downloadFunnel?.completionRate ?? 0}
                    caption={`${downloadRedirects} of ${downloadClicks} clicks`}
                    color="#22c55e"
                  />
                </Panel>
              </div>

              <Panel
                title="7-Day × 24-Hour Activity Heatmap"
                description="Peak usage hours and event density across the week"
              >
                {data.hourlyHeatmap ? (
                  <HourlyActivityHeatmapGrid rows={data.hourlyHeatmap} />
                ) : (
                  <p className="text-[13px] text-[var(--admin-muted)]">No heatmap data.</p>
                )}
              </Panel>

              <Panel
                title="Download Activity Daily"
                description="Clicks and direct installer redirects"
              >
                <DownloadActivityChart
                  rows={data.downloadDaily ?? []}
                  days={chartDays}
                />
              </Panel>

              <div className="grid gap-4 lg:grid-cols-2">
                <Panel title="Download Clicks by Button Location">
                  <RankedBarList
                    rows={(data.downloadClicksByLocation ?? []).map((row) => ({
                      label: row.location,
                      value: row.count,
                    }))}
                    formatLabel={(label) =>
                      DOWNLOAD_LOCATION_LABELS[label] ?? label
                    }
                    color="#22c55e"
                  />
                </Panel>
                <Panel title="Pricing Clicks by Button Location">
                  <RankedBarList
                    rows={(data.pricingClicksByLocation ?? []).map((row) => ({
                      label: row.location,
                      value: row.count,
                    }))}
                    formatLabel={(label) =>
                      PRICING_LOCATION_LABELS[label] ?? label
                    }
                    color="#f79009"
                  />
                </Panel>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Panel title="Top Visited Pages">
                  <TopPagesList rows={data.topPages} />
                </Panel>
                <Panel title="All Tracked Events Summary">
                  <EventsSummaryList
                    rows={data.eventCounts.map((row) => ({
                      label: row.event_name,
                      value: row.count,
                    }))}
                  />
                </Panel>
              </div>
            </Section>

            {/* 7. Support & Feedback Sentiment */}
            {feedback ? (
              <Section
                title="Support & User Sentiment"
                description="Live support inquiries, issue reports, and visitor feedback"
              >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    icon={<MessageSquare className="size-4 text-blue-500" />}
                    label="Total Support Tickets"
                    value={feedback.total}
                    hint="All live chat & feedback submissions"
                  />
                  <StatCard
                    icon={<CircleCheck className="size-4 text-emerald-500" />}
                    label="Resolved Issues"
                    value={feedback.resolved}
                    hint={`${feedback.open} currently open`}
                  />
                  <StatCard
                    icon={<Clock className="size-4 text-amber-500" />}
                    label="Awaiting Admin Reply"
                    value={feedback.needsReply}
                    hint="Active visitor inquiries"
                  />
                  <StatCard
                    icon={<Heart className="size-4 text-rose-500" />}
                    label="Positive Sentiment Rate"
                    value={
                      feedback.total > 0
                        ? `${Math.round(
                            ((feedback.sentiments.find((s) => s.sentiment === "like")?.count ?? 0) /
                              feedback.total) *
                              100
                          )}%`
                        : "100%"
                    }
                    hint="Based on visitor sentiment ratings"
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Panel
                    title="Feedback Sentiment Distribution"
                    description="Visitor ratings when submitting feedback"
                  >
                    <FeedbackSentimentPieChart sentiments={feedback.sentiments} />
                  </Panel>

                  <Panel
                    title="Support Health & Resolution"
                    description="Ticket resolution performance"
                    bodyClassName="py-6"
                  >
                    <RingGauge
                      value={
                        feedback.total > 0
                          ? Math.round((feedback.resolved / feedback.total) * 100)
                          : 100
                      }
                      caption={`${feedback.resolved} resolved of ${feedback.total} tickets`}
                      color="#3b82f6"
                    />
                  </Panel>
                </div>
              </Section>
            ) : null}

            {/* 8. Catalog & Community Engagement */}
            <Section
              title="Catalog & Community Health"
              description="Wallpaper inventory, likes, and community submissions"
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  icon={<Images className="size-4" />}
                  label="Catalog Wallpapers"
                  value={data.catalogWallpaperCount}
                  hint="Live on MacWall"
                />
                <StatCard
                  icon={<Heart className="size-4" />}
                  label="Total Likes"
                  value={data.totalLikes}
                  hint={`${avgLikes} average per wallpaper`}
                />
                <StatCard
                  icon={<CircleCheck className="size-4" />}
                  label="Pending Submissions"
                  value={data.communityUploads.pending}
                  hint="Awaiting moderation"
                />
                <StatCard
                  icon={<Laptop className="size-4" />}
                  label="Activated Macs"
                  value={activatedAllTime}
                  hint={`${data.activatedDevicesInRange ?? 0} in selected window`}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <Panel
                  title="Upload Moderation"
                  description="Community upload approval rate"
                  bodyClassName="py-6"
                >
                  <RingGauge
                    value={uploadApprovalRate}
                    caption={`${data.communityUploads.approved} approved of ${uploadTotal}`}
                    color="#22c55e"
                  />
                </Panel>
                <Panel
                  title="Wallpaper Engagement"
                  description="Average likes per item"
                  bodyClassName="py-6"
                >
                  <StatRing
                    value={avgLikes}
                    max={Math.max(
                      avgLikes,
                      data.topLikedWallpapers?.[0]?.likeCount ?? 0,
                      1
                    )}
                    caption={`${data.totalLikes.toLocaleString()} likes total`}
                    color="#f04438"
                  />
                </Panel>
                <Panel
                  title="Checkout Interest"
                  description="Pricing CTA taps in window"
                  bodyClassName="py-6"
                >
                  <StatRing
                    value={pricingClicks}
                    max={Math.max(downloadClicks, pricingClicks, 1)}
                    caption={`vs ${downloadClicks.toLocaleString()} download clicks`}
                    color="#f79009"
                  />
                </Panel>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                <Panel title="Catalog by Category">
                  <CategoryDonut
                    rows={(data.wallpaperCategoryCounts ?? []).map((row) => ({
                      label: row.category,
                      value: row.count,
                    }))}
                  />
                </Panel>

                <Panel title="Most Liked Wallpapers">
                  {(data.topLikedWallpapers ?? []).length === 0 ? (
                    <p className="px-3 py-8 text-center text-[13px] text-[var(--admin-muted)]">
                      No likes recorded yet.
                    </p>
                  ) : (
                    <ol className="space-y-0.5">
                      {data.topLikedWallpapers?.map((row, index) => (
                        <li
                          key={row.id}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-[var(--admin-fill)]"
                        >
                          <span className="w-4 shrink-0 text-xs font-medium text-[var(--admin-muted)] tabular-nums">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium text-[var(--admin-fg)]">
                              {row.name}
                            </p>
                            <p className="truncate text-xs text-[var(--admin-muted)]">
                              {row.category}
                            </p>
                          </div>
                          <AdminBadge tone="red">
                            <Heart className="size-3" />
                            {row.likeCount}
                          </AdminBadge>
                        </li>
                      ))}
                    </ol>
                  )}
                </Panel>
              </div>
            </Section>
          </>
        ) : null}
      </div>
    </AdminShell>
  )
}

/* -------------------------------------------------------------------------- */

function TrackingPill({ data }: Readonly<{ data: AnalyticsResponse }>) {
  const lastEventAt = data.lastEventAt
  const isRecent =
    lastEventAt != null &&
    new Date(lastEventAt).getTime() >= new Date(data.since).getTime()

  let tone: Tone = "neutral"
  let label = "No events yet"
  if (isRecent) {
    tone = "green"
    label = "Live Active"
  } else if (lastEventAt) {
    tone = "amber"
    label = "No events in range"
  }

  return (
    <span className="hidden h-8 items-center gap-1.5 rounded-full bg-[var(--admin-fill)] px-2.5 text-xs font-medium text-[var(--admin-fg-soft)] sm:inline-flex">
      <AdminStatusDot tone={tone} pulse={isRecent} />
      {label}
      {lastEventAt ? (
        <span className="hidden text-[var(--admin-muted)] lg:inline">
          · Last event {formatRelativeTime(lastEventAt)}
        </span>
      ) : null}
    </span>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 3 }).map((_, section) => (
        <div key={section} className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-40 rounded-md" />
            <Skeleton className="h-3 w-64 rounded-md" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <StatCardSkeleton key={index} />
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  )
}



