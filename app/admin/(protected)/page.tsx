"use client"

/**
 * Analytics — sales, acquisition funnel, traffic and catalog health.
 * The whole dashboard lives in this page so the range control in the top bar
 * and the sections below share one piece of state.
 */

import { useCallback, useEffect, useState, type ReactNode } from "react"
import {
  Activity,
  CircleCheck,
  CreditCard,
  Download,
  Heart,
  Images,
  Laptop,
  MousePointerClick,
  RefreshCw,
  TrendingUp,
  TriangleAlert,
  Users,
} from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import {
  CategoryDonut,
  ConversionFunnelChart,
  DailyActivityChart,
  DownloadActivityChart,
  EventsSummaryList,
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
  /** @deprecated Use activatedDevicesAllTime */
  activatedDevices?: number
  wallpaperCategoryCounts?: Array<{ category: string; count: number }>
  topLikedWallpapers?: Array<{
    id: string
    name: string
    category: string
    likeCount: number
  }>
  sales?: {
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
    daily: Array<{ day: string; sales: number; revenue: number }>
    prevDaily: Array<{ day: string; sales: number; revenue: number }>
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
    /** @deprecated Use downloadToRedirectRate */
    downloadToInstallRate?: number
    installToSaleRate: number
    visitorToSaleRate: number
  }
}

const RANGES = [7, 30, 90] as const

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
  india_pricing_offer: "India flash offer",
  bottom_cta: "Bottom CTA section",
  footer_shop_buy: "Footer buy (desktop)",
  footer_mobile_shop: "Footer buy (mobile)",
}

/* Local layout helpers — kept in-page so the dashboard reads top to bottom. */

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
    <Card className={cn("gap-0 py-0", className)}>
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
    data?.eventCounts.find((e) => e.event_name === "download_redirect")
      ?.count ??
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
    data?.activatedDevicesAllTime ?? data?.activatedDevices ?? 0
  const chartDays = data?.rangeDays ?? days
  const sales = data?.sales
  const funnel = data?.conversionFunnel

  return (
    <AdminShell
      title="Analytics"
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
                  key={range}
                  value={String(range)}
                  className="h-full px-3 text-xs"
                >
                  {range}d
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
      <div className="space-y-8">
        {error ? (
          <div className="flex items-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-red-soft)] px-4 py-3 text-[13px] text-[var(--admin-red)]">
            <TriangleAlert className="size-4 shrink-0" />
            {error}
          </div>
        ) : null}

        {loading && !data ? <DashboardSkeleton /> : null}

        {data ? (
          <>
            {sales ? (
              <Section
                title="Sales & revenue"
                description={`Stripe · last ${data.rangeDays} days compared with the previous ${data.rangeDays}`}
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
                    label="Net revenue (est.)"
                    value={formatUsd(sales.netRevenue)}
                    hint={`≈ ${formatUsd(sales.netPerSale)} per sale after fees`}
                  />
                  <StatCard
                    label="All-time revenue"
                    value={formatUsd(sales.allTimeGrossRevenue)}
                    hint={`${sales.allTimeSales} lifetime sales`}
                  />
                  <StatCard
                    label="Visitor → sale"
                    value={`${funnel?.visitorToSaleRate ?? 0}%`}
                    hint="Purchases per unique visitor"
                  />
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
                  <Panel
                    title="Revenue over time"
                    description="Solid is this period, dotted is the previous one"
                  >
                    <SalesComparisonChart
                      daily={sales.daily}
                      prevDaily={sales.prevDaily}
                      days={data.rangeDays}
                      metric="revenue"
                    />
                  </Panel>

                  <Panel
                    title="Conversion funnel"
                    description="Site visit through to paid licence"
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
                          { label: "Purchases", value: funnel.sales },
                        ]}
                      />
                    ) : (
                      <p className="text-[13px] text-[var(--admin-muted)]">
                        No funnel data in range.
                      </p>
                    )}
                  </Panel>
                </div>
              </Section>
            ) : null}

            <Section
              title="Traffic & downloads"
              description={`First-party events from the marketing site · last ${data.rangeDays} days`}
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
                  hint="CTA taps across the site"
                />
                <StatCard
                  icon={<MousePointerClick className="size-4" />}
                  label="Installer redirects"
                  value={downloadRedirects}
                  hint="Successful /download/latest hits"
                />
                <StatCard
                  icon={<Users className="size-4" />}
                  label="Download sessions"
                  value={uniqueDownloadSessions}
                  hint="Unique visitors who tapped download"
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
                <Panel
                  title="Daily activity"
                  description="All tracked events aggregated by day"
                >
                  <DailyActivityChart
                    rows={data.dailyCounts}
                    days={chartDays}
                  />
                </Panel>

                <Panel
                  title="Download completion"
                  description="Clicks that reached the installer"
                  bodyClassName="py-6"
                >
                  <RingGauge
                    value={data.downloadFunnel?.completionRate ?? 0}
                    caption={`${downloadRedirects} of ${downloadClicks} clicks`}
                    color="#17b26a"
                  />
                </Panel>
              </div>

              <Panel
                title="Download activity"
                description="Clicks and installer redirects per day"
              >
                <DownloadActivityChart
                  rows={data.downloadDaily ?? []}
                  days={chartDays}
                />
              </Panel>

              <div className="grid gap-4 lg:grid-cols-2">
                <Panel title="Download clicks by button">
                  <RankedBarList
                    rows={(data.downloadClicksByLocation ?? []).map((row) => ({
                      label: row.location,
                      value: row.count,
                    }))}
                    formatLabel={(label) =>
                      DOWNLOAD_LOCATION_LABELS[label] ?? label
                    }
                    color="#17b26a"
                  />
                </Panel>
                <Panel title="Pricing clicks by button">
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
                <Panel title="Top pages">
                  <TopPagesList rows={data.topPages} />
                </Panel>
                <Panel title="All tracked events">
                  <EventsSummaryList
                    rows={data.eventCounts.map((row) => ({
                      label: row.event_name,
                      value: row.count,
                    }))}
                  />
                </Panel>
              </div>

              {data.indiaAudience ? (
                <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                  <Panel
                    title="India audience"
                    description="Geo-tagged visitors and the INDIA promo funnel"
                  >
                    <div className="grid gap-4 sm:grid-cols-3">
                      <StatCard
                        label="Page views"
                        value={data.indiaAudience.pageViews}
                        className="shadow-none ring-0"
                      />
                      <StatCard
                        label="Sessions"
                        value={data.indiaAudience.uniqueSessions}
                        className="shadow-none ring-0"
                      />
                      <StatCard
                        label="Pricing clicks"
                        value={data.indiaAudience.pricingClicks}
                        className="shadow-none ring-0"
                      />
                      <StatCard
                        label="Banner taps"
                        value={data.indiaAudience.announcementClicks}
                        className="shadow-none ring-0"
                      />
                      <StatCard
                        label="CTA clicks"
                        value={data.indiaAudience.ctaClicks}
                        className="shadow-none ring-0"
                      />
                    </div>
                  </Panel>
                  <Panel title="Visitors by country">
                    <RankedBarList
                      rows={(data.visitorsByCountry ?? []).map((row) => ({
                        label: row.country,
                        value: row.count,
                      }))}
                    />
                  </Panel>
                </div>
              ) : null}
            </Section>

            <Section
              title="Catalog & community"
              description="All-time totals from the database"
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  icon={<Images className="size-4" />}
                  label="Catalog wallpapers"
                  value={data.catalogWallpaperCount}
                  hint="Published to the app"
                />
                <StatCard
                  icon={<Heart className="size-4" />}
                  label="Total likes"
                  value={data.totalLikes}
                  hint={`${avgLikes} average per wallpaper`}
                />
                <StatCard
                  icon={<CircleCheck className="size-4" />}
                  label="Pending uploads"
                  value={data.communityUploads.pending}
                  hint="Awaiting moderation"
                />
                <StatCard
                  icon={<Laptop className="size-4" />}
                  label="Activated devices"
                  value={activatedAllTime}
                  hint={`${data.activatedDevicesInRange ?? 0} in selected range`}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <Panel
                  title="Upload approval"
                  description="Community moderation outcome"
                  bodyClassName="py-6"
                >
                  <RingGauge
                    value={uploadApprovalRate}
                    caption={`${data.communityUploads.approved} approved of ${uploadTotal}`}
                    color="#17b26a"
                  />
                </Panel>
                <Panel
                  title="Engagement"
                  description="Average likes per wallpaper"
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
                  title="Pricing interest"
                  description="Checkout CTA taps in range"
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
                <Panel title="Catalog by category">
                  <CategoryDonut
                    rows={(data.wallpaperCategoryCounts ?? []).map((row) => ({
                      label: row.category,
                      value: row.count,
                    }))}
                  />
                </Panel>

                <Panel title="Most liked wallpapers" bodyClassName="p-2">
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
    label = "Tracking active"
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
      {Array.from({ length: 2 }).map((_, section) => (
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
