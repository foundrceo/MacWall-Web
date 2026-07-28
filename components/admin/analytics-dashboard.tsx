"use client"

import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ActivityIcon,
  Calendar01Icon,
  CreditCardIcon,
  Download01Icon,
  Globe02Icon,
  HeartIcon,
  ImageIcon,
  LayersIcon,
  ArrowReloadHorizontalIcon,
  FullSignalIcon,
  NoSignalIcon,
  ArrowUpRightIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"

import {
  CategoryDonut,
  ConversionFunnelChart,
  DailyActivityChart,
  DownloadActivityChart,
  EventsSummaryChart,
  HorizontalBarChart,
  RingGauge,
  SalesComparisonChart,
  StatRing,
  TopPagesChart,
} from "@/components/admin/admin-charts"
import {
  AdminBadge,
  AdminFadeIn,
  AdminMetricTile,
  AdminNotice,
  AdminPill,
  AdminSectionHeading,
  AdminSkeleton,
  AdminSurface,
  AdminSurfaceBody,
  AdminSurfaceHeader,
  AdminToolbar,
} from "@/components/admin/admin-ui"

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

function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function AnalyticsDashboard() {
  const [days, setDays] = useState(7)
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      setData(null)
      try {
        const res = await fetch(`/api/admin/analytics?days=${days}`, {
          cache: "no-store",
          credentials: "same-origin",
        })
        const json = (await res.json()) as AnalyticsResponse & {
          error?: string
        }
        if (!res.ok) throw new Error(json.error ?? "Failed to load analytics")
        if (!cancelled) setData(json)
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load analytics"
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [days, refreshKey])

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
  const downloadCompletionRate = data?.downloadFunnel?.completionRate ?? 0
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

  const avgLikesPerWallpaper =
    data && data.catalogWallpaperCount > 0
      ? Math.round(data.totalLikes / data.catalogWallpaperCount)
      : 0

  const engagementRingMax = Math.max(
    avgLikesPerWallpaper,
    data?.topLikedWallpapers?.[0]?.likeCount ?? 0,
    1
  )
  const pricingRingMax = Math.max(downloadClicks, pricingClicks, 1)

  const activatedDevicesAllTime =
    data?.activatedDevicesAllTime ?? data?.activatedDevices ?? 0

  const chartDays = data?.rangeDays ?? days

  return (
    <div className="space-y-5 sm:space-y-6 lg:space-y-8">
      <AdminToolbar>
        {[7, 30, 90].map((value) => (
          <AdminPill
            key={value}
            active={days === value}
            onClick={() => setDays(value)}
          >
            <HugeiconsIcon icon={Calendar01Icon} className="size-3.5" />
            Last {value} days
          </AdminPill>
        ))}
        <AdminPill
          active={false}
          onClick={() => setRefreshKey((key) => key + 1)}
          disabled={loading}
        >
          <HugeiconsIcon
            icon={ArrowReloadHorizontalIcon}
            className={`size-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </AdminPill>
      </AdminToolbar>

      {loading && !data ? <AnalyticsSkeleton /> : null}
      {error ? <AdminNotice tone="warning">{error}</AdminNotice> : null}

      {data ? (
        <AdminFadeIn
          key={`${days}-${refreshKey}`}
          className="space-y-8 sm:space-y-10"
        >
          <TrackingHealthBanner
            lastEventAt={data.lastEventAt}
            since={data.since}
          />

          {data.sales ? (
            <SalesSection
              sales={data.sales}
              funnel={data.conversionFunnel}
              rangeDays={data.rangeDays}
            />
          ) : null}

          <section className="space-y-5 sm:space-y-6">
            <AdminSectionHeading
              eyebrow={`Last ${data.rangeDays} days`}
              title="Website performance"
              icon={
                <HugeiconsIcon
                  icon={Globe02Icon}
                  className="size-5 text-[#86868b]"
                />
              }
            />

            <div className="grid gap-4 lg:grid-cols-4 lg:gap-5">
              <AdminMetricTile
                icon={
                  <HugeiconsIcon
                    icon={Download01Icon}
                    className="size-4 text-[#86868b]"
                  />
                }
                label="Download clicks"
                value={downloadClicks}
                hint="CTA taps across the site"
              />
              <AdminMetricTile
                icon={
                  <HugeiconsIcon
                    icon={ActivityIcon}
                    className="size-4 text-[#86868b]"
                  />
                }
                label="Installer redirects"
                value={downloadRedirects}
                hint="Successful /download/latest hits"
              />
              <AdminMetricTile
                icon={
                  <HugeiconsIcon
                    icon={UserGroupIcon}
                    className="size-4 text-[#86868b]"
                  />
                }
                label="Download click sessions"
                value={uniqueDownloadSessions}
                hint="Unique visitors who tapped download"
              />
              <AdminMetricTile
                icon={
                  <HugeiconsIcon
                    icon={ActivityIcon}
                    className="size-4 text-[#86868b]"
                  />
                }
                label="Page views"
                value={pageViews}
                hint="Tracked marketing page views"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
              <AdminSurface>
                <AdminSurfaceHeader
                  title="Download funnel"
                  description="Click-to-redirect completion in this period"
                />
                <AdminSurfaceBody className="flex justify-center pb-6 sm:pb-8">
                  <RingGauge
                    value={downloadCompletionRate}
                    label="Completion rate"
                    sublabel={`${downloadRedirects} / ${downloadClicks} redirects`}
                  />
                </AdminSurfaceBody>
              </AdminSurface>

              <AdminSurface className="lg:col-span-2">
                <AdminSurfaceHeader
                  title="Daily activity"
                  description="All tracked events aggregated by day"
                />
                <AdminSurfaceBody>
                  <DailyActivityChart
                    rows={data.dailyCounts}
                    days={chartDays}
                  />
                </AdminSurfaceBody>
              </AdminSurface>
            </div>

            <AdminSurface>
              <AdminSurfaceHeader
                title="Download activity"
                description="Download clicks and installer redirects per day"
              />
              <AdminSurfaceBody>
                <DownloadActivityChart
                  rows={data.downloadDaily ?? []}
                  days={chartDays}
                />
              </AdminSurfaceBody>
            </AdminSurface>

            <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
              <AdminSurface>
                <AdminSurfaceHeader title="Download clicks by button" />
                <AdminSurfaceBody>
                  <HorizontalBarChart
                    rows={(data.downloadClicksByLocation ?? []).map((row) => ({
                      label: row.location,
                      value: row.count,
                    }))}
                    formatLabel={formatDownloadLocation}
                  />
                </AdminSurfaceBody>
              </AdminSurface>

              <AdminSurface>
                <AdminSurfaceHeader title="Pricing clicks by button" />
                <AdminSurfaceBody>
                  <HorizontalBarChart
                    rows={(data.pricingClicksByLocation ?? []).map((row) => ({
                      label: row.location,
                      value: row.count,
                    }))}
                    formatLabel={formatPricingLocation}
                  />
                </AdminSurfaceBody>
              </AdminSurface>
            </div>

            {data.indiaAudience ? (
              <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr] lg:gap-5">
                <AdminSurface>
                  <AdminSurfaceHeader
                    title="India audience (INDIA promo)"
                    description="Visitors from India tracked via geo + promo funnel"
                  />
                  <AdminSurfaceBody>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <AdminMetricTile
                        label="India page views"
                        value={data.indiaAudience.pageViews}
                        hint="Geo-tagged page views"
                      />
                      <AdminMetricTile
                        label="India sessions"
                        value={data.indiaAudience.uniqueSessions}
                        hint="Unique visitors from IN"
                      />
                      <AdminMetricTile
                        label="India pricing clicks"
                        value={data.indiaAudience.pricingClicks}
                        hint="Includes india_pricing_offer"
                      />
                      <AdminMetricTile
                        label="Banner taps"
                        value={data.indiaAudience.announcementClicks}
                        hint="India flash banner clicks"
                      />
                      <AdminMetricTile
                        label="India CTA clicks"
                        value={data.indiaAudience.ctaClicks}
                        hint="All India-tagged CTAs"
                      />
                    </div>
                  </AdminSurfaceBody>
                </AdminSurface>

                <AdminSurface>
                  <AdminSurfaceHeader title="Visitors by country" />
                  <AdminSurfaceBody>
                    <HorizontalBarChart
                      rows={(data.visitorsByCountry ?? []).map((row) => ({
                        label: row.country,
                        value: row.count,
                      }))}
                    />
                  </AdminSurfaceBody>
                </AdminSurface>
              </div>
            ) : null}
          </section>

          <section className="space-y-5 sm:space-y-6">
            <AdminSectionHeading
              eyebrow="All-time database totals"
              title="Catalog & community"
              icon={
                <HugeiconsIcon
                  icon={LayersIcon}
                  className="size-5 text-[#86868b]"
                />
              }
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              <AdminMetricTile
                icon={
                  <HugeiconsIcon
                    icon={ImageIcon}
                    className="size-4 text-[#86868b]"
                  />
                }
                label="Catalog wallpapers"
                value={data.catalogWallpaperCount}
                hint="All-time total"
              />
              <AdminMetricTile
                icon={
                  <HugeiconsIcon
                    icon={HeartIcon}
                    className="size-4 text-[#86868b]"
                  />
                }
                label="Total likes"
                value={data.totalLikes}
                hint="All-time total"
              />
              <AdminMetricTile
                label="Pending uploads"
                value={data.communityUploads.pending}
                hint="Awaiting moderation"
              />
              <AdminMetricTile
                label="Activated devices"
                value={activatedDevicesAllTime}
                hint={`${data.activatedDevicesInRange ?? 0} in selected range`}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
              <AdminSurface>
                <AdminSurfaceHeader
                  title="Upload health"
                  description="Community moderation status"
                />
                <AdminSurfaceBody className="flex justify-center pb-6 sm:pb-8">
                  <RingGauge
                    value={uploadApprovalRate}
                    label="Approval rate"
                    sublabel={`${data.communityUploads.approved} approved`}
                    color="#34c759"
                  />
                </AdminSurfaceBody>
              </AdminSurface>

              <AdminSurface>
                <AdminSurfaceHeader
                  title="Engagement"
                  description="Average likes per wallpaper"
                />
                <AdminSurfaceBody className="flex justify-center pb-6 sm:pb-8">
                  <StatRing
                    value={avgLikesPerWallpaper}
                    max={engagementRingMax}
                    label="Avg likes"
                    sublabel={`${data.totalLikes} total`}
                    color="#ff2d55"
                  />
                </AdminSurfaceBody>
              </AdminSurface>

              <AdminSurface>
                <AdminSurfaceHeader
                  title="Pricing interest"
                  description="Checkout CTA taps"
                />
                <AdminSurfaceBody className="flex justify-center pb-6 sm:pb-8">
                  <StatRing
                    value={pricingClicks}
                    max={pricingRingMax}
                    label="Pricing clicks"
                    sublabel={`Last ${data.rangeDays} days`}
                    color="#ff9500"
                  />
                </AdminSurfaceBody>
              </AdminSurface>
            </div>

            <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
              <AdminSurface>
                <AdminSurfaceHeader title="Catalog by category" />
                <AdminSurfaceBody>
                  <CategoryDonut
                    rows={(data.wallpaperCategoryCounts ?? []).map((row) => ({
                      label: row.category,
                      value: row.count,
                    }))}
                  />
                </AdminSurfaceBody>
              </AdminSurface>

              <AdminSurface>
                <AdminSurfaceHeader title="Top liked wallpapers" />
                <AdminSurfaceBody className="space-y-2">
                  {(data.topLikedWallpapers ?? []).length === 0 ? (
                    <p className="text-[14px] text-[#86868b]">
                      No likes recorded yet.
                    </p>
                  ) : (
                    data.topLikedWallpapers?.map((row, index) => (
                      <div
                        key={row.id}
                        className="flex items-center justify-between gap-3 rounded-2xl bg-[#f5f5f7] px-3.5 py-2.5 transition-colors duration-200 hover:bg-[#ebebed]"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-medium text-[#1d1d1f]">
                            {index + 1}. {row.name}
                          </p>
                          <p className="text-[12px] text-[#86868b]">
                            {row.category}
                          </p>
                        </div>
                        <AdminBadge tone="red">
                          <HugeiconsIcon
                            icon={HeartIcon}
                            className="mr-1 size-3"
                          />
                          {row.likeCount}
                        </AdminBadge>
                      </div>
                    ))
                  )}
                </AdminSurfaceBody>
              </AdminSurface>
            </div>

            <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
              <AdminSurface>
                <AdminSurfaceHeader title="All tracked events" />
                <AdminSurfaceBody>
                  <EventsSummaryChart
                    rows={data.eventCounts.map((row) => ({
                      label: row.event_name,
                      value: row.count,
                    }))}
                  />
                </AdminSurfaceBody>
              </AdminSurface>

              <AdminSurface>
                <AdminSurfaceHeader title="Top pages" />
                <AdminSurfaceBody>
                  <TopPagesChart rows={data.topPages} />
                </AdminSurfaceBody>
              </AdminSurface>
            </div>
          </section>
        </AdminFadeIn>
      ) : null}
    </div>
  )
}

function SalesSection({
  sales,
  funnel,
  rangeDays,
}: Readonly<{
  sales: NonNullable<AnalyticsResponse["sales"]>
  funnel: AnalyticsResponse["conversionFunnel"]
  rangeDays: number
}>) {
  const change = sales.salesChangePercent
  const changeUp = change != null && change >= 0

  return (
    <section className="space-y-5 sm:space-y-6">
      <AdminSectionHeading
        eyebrow={`Stripe · last ${rangeDays} days vs previous ${rangeDays}`}
        title="Sales & revenue"
        icon={
          <HugeiconsIcon
            icon={ArrowUpRightIcon}
            className="size-5 text-[#86868b]"
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        <AdminMetricTile
          icon={
            <HugeiconsIcon
              icon={CreditCardIcon}
              className="size-4 text-[#86868b]"
            />
          }
          label="Gross revenue"
          value={formatUsd(sales.grossRevenue)}
          hint={`${sales.sales} sales · prev ${formatUsd(sales.prevGrossRevenue)}${
            change != null
              ? ` · ${changeUp ? "+" : "-"}${Math.abs(change)}%`
              : sales.sales > 0
                ? " · new"
                : ""
          }`}
        />

        <AdminMetricTile
          label="Net revenue (est.)"
          value={formatUsd(sales.netRevenue)}
          hint={`≈ ${formatUsd(sales.netPerSale)}/sale after ~${sales.feePercentAssumed}% + $${sales.feeFixedAssumed.toFixed(2)} Stripe fees`}
        />
        <AdminMetricTile
          label="All-time revenue"
          value={formatUsd(sales.allTimeGrossRevenue)}
          hint={`${sales.allTimeSales} lifetime sales · ${formatUsd(sales.allTimeNetRevenue)} net est.`}
        />
        <AdminMetricTile
          label="Visitor → sale"
          value={`${funnel?.visitorToSaleRate ?? 0}%`}
          hint="Purchases per unique visitor in range"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
        <AdminSurface className="lg:col-span-2">
          <AdminSurfaceHeader
            title="Revenue over time"
            description={`Daily gross revenue · solid = this period, dotted = previous ${rangeDays} days`}
          />
          <AdminSurfaceBody>
            <SalesComparisonChart
              daily={sales.daily}
              prevDaily={sales.prevDaily}
              days={rangeDays}
              metric="revenue"
            />
          </AdminSurfaceBody>
        </AdminSurface>

        <AdminSurface>
          <AdminSurfaceHeader
            title="Conversion funnel"
            description="From site visit to paid license"
          />
          <AdminSurfaceBody>
            {funnel ? (
              <ConversionFunnelChart
                steps={[
                  {
                    label: "Unique visitors",
                    value: funnel.uniqueVisitors,
                    hint: `${funnel.pageViews} page views`,
                  },
                  {
                    label: "Download clicks",
                    value: funnel.downloadClicks,
                    hint: `${funnel.uniqueDownloadClickSessions ?? 0} unique sessions`,
                  },
                  {
                    label: "Installer redirects",
                    value: funnel.installerRedirects,
                    hint: `${funnel.uniqueInstallSessions} matched sessions`,
                  },
                  {
                    label: "Devices activated",
                    value: funnel.activatedDevices,
                  },
                  {
                    label: "Purchases",
                    value: funnel.sales,
                  },
                ]}
              />
            ) : (
              <p className="text-[14px] text-[#86868b]">
                No funnel data in range.
              </p>
            )}
          </AdminSurfaceBody>
        </AdminSurface>
      </div>
    </section>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid gap-4 lg:grid-cols-4 lg:gap-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <AdminSkeleton key={index} className="h-28" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
        <AdminSkeleton className="h-64" />
        <AdminSkeleton className="h-64 lg:col-span-2" />
      </div>
    </div>
  )
}

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
  india_pricing_offer: "India flash offer card",
  bottom_cta: "Bottom CTA section",
  footer_shop_buy: "Footer buy link (desktop)",
  footer_mobile_shop: "Footer buy link (mobile)",
}

function formatDownloadLocation(location: string) {
  return DOWNLOAD_LOCATION_LABELS[location] ?? location
}

function formatPricingLocation(location: string) {
  return PRICING_LOCATION_LABELS[location] ?? location
}

function TrackingHealthBanner({
  lastEventAt,
  since,
}: Readonly<{ lastEventAt: string | null; since: string }>) {
  if (!lastEventAt) {
    return (
      <AdminNotice tone="warning">
        <span className="inline-flex items-center gap-1.5">
          <HugeiconsIcon icon={NoSignalIcon} className="size-4 shrink-0" />
          No analytics events stored yet. Visit the public site and click
          Download to verify tracking after deploy.
        </span>
      </AdminNotice>
    )
  }

  const lastMs = new Date(lastEventAt).getTime()
  const sinceMs = new Date(since).getTime()
  const isRecent = lastMs >= sinceMs

  if (isRecent) {
    return (
      <AdminNotice tone="success">
        <span className="inline-flex items-center gap-1.5">
          <HugeiconsIcon icon={FullSignalIcon} className="size-4 shrink-0" />
          Tracking active · last event {formatRelativeTime(lastEventAt)}
        </span>
      </AdminNotice>
    )
  }

  return (
    <AdminNotice tone="warning">
      <span className="inline-flex items-center gap-1.5">
        <HugeiconsIcon icon={NoSignalIcon} className="size-4 shrink-0" />
        No events in the selected range · last event{" "}
        {formatRelativeTime(lastEventAt)}
      </span>
    </AdminNotice>
  )
}

function formatRelativeTime(iso: string) {
  const deltaMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.max(0, Math.round(deltaMs / 60_000))
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 48) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return `${days}d ago`
}
