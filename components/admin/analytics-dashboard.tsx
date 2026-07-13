"use client"

import { useEffect, useState } from "react"
import { Activity, Download, Heart, ImageIcon, Users } from "lucide-react"

import {
  CategoryDonut,
  DailyActivityChart,
  DownloadActivityChart,
  EventsSummaryChart,
  HorizontalBarChart,
  RingGauge,
  StatRing,
  TopPagesChart,
} from "@/components/admin/admin-charts"
import {
  AdminBadge,
  AdminMetricTile,
  AdminNotice,
  AdminPill,
  AdminSectionHeading,
  AdminSkeleton,
  AdminSurface,
  AdminSurfaceBody,
  AdminSurfaceHeader,
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
  downloadDaily?: Array<{ day: string; event_name: string; count: number }>
  topPages: Array<{ path: string; count: number }>
  communityUploads: { pending: number; approved: number; rejected: number }
  catalogWallpaperCount: number
  totalLikes: number
  activatedDevices: number
  wallpaperCategoryCounts?: Array<{ category: string; count: number }>
  topLikedWallpapers?: Array<{
    id: string
    name: string
    category: string
    likeCount: number
  }>
}

export function AnalyticsDashboard() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
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
  }, [days])

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
    data?.downloadFunnel?.uniqueRedirectSessions ?? 0
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

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {[7, 30, 90].map((value) => (
          <AdminPill
            key={value}
            active={days === value}
            onClick={() => setDays(value)}
          >
            Last {value} days
          </AdminPill>
        ))}
      </div>

      {loading ? <AnalyticsSkeleton /> : null}
      {error ? <AdminNotice tone="warning">{error}</AdminNotice> : null}

      {data ? (
        <>
          <TrackingHealthBanner
            lastEventAt={data.lastEventAt}
            since={data.since}
          />

          <section className="space-y-4">
            <AdminSectionHeading
              eyebrow={`Last ${data.rangeDays} days`}
              title="Website performance"
            />

            <div className="grid gap-4 lg:grid-cols-4">
              <AdminMetricTile
                icon={<Download className="size-4 text-[#86868b]" />}
                label="Download clicks"
                value={downloadClicks}
                hint="CTA taps across the site"
              />
              <AdminMetricTile
                icon={<Activity className="size-4 text-[#86868b]" />}
                label="Installer redirects"
                value={downloadRedirects}
                hint="Successful /download/latest hits"
              />
              <AdminMetricTile
                icon={<Users className="size-4 text-[#86868b]" />}
                label="Unique sessions"
                value={uniqueDownloadSessions}
                hint="Distinct download visitors"
              />
              <AdminMetricTile
                icon={<Activity className="size-4 text-[#86868b]" />}
                label="Page views"
                value={pageViews}
                hint="Tracked marketing page views"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <AdminSurface>
                <AdminSurfaceHeader
                  title="Download funnel"
                  description="Click-to-redirect completion in this period"
                />
                <AdminSurfaceBody className="flex justify-center pb-8">
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
                  <DailyActivityChart rows={data.dailyCounts} days={14} />
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
                  days={14}
                />
              </AdminSurfaceBody>
            </AdminSurface>

            <div className="grid gap-4 lg:grid-cols-2">
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
          </section>

          <section className="space-y-4">
            <AdminSectionHeading
              eyebrow="All-time database totals"
              title="Catalog & community"
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <AdminMetricTile
                icon={<ImageIcon className="size-4 text-[#86868b]" />}
                label="Catalog wallpapers"
                value={data.catalogWallpaperCount}
              />
              <AdminMetricTile
                icon={<Heart className="size-4 text-[#86868b]" />}
                label="Total likes"
                value={data.totalLikes}
              />
              <AdminMetricTile
                label="Pending uploads"
                value={data.communityUploads.pending}
              />
              <AdminMetricTile
                label="Activated devices"
                value={data.activatedDevices}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <AdminSurface>
                <AdminSurfaceHeader
                  title="Upload health"
                  description="Community moderation status"
                />
                <AdminSurfaceBody className="flex justify-center pb-8">
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
                <AdminSurfaceBody className="flex justify-center pb-8">
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
                <AdminSurfaceBody className="flex justify-center pb-8">
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

            <div className="grid gap-4 lg:grid-cols-2">
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
                        className="flex items-center justify-between gap-3 rounded-2xl bg-[#f5f5f7] px-3.5 py-2.5"
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
                          <Heart className="mr-1 size-3" />
                          {row.likeCount}
                        </AdminBadge>
                      </div>
                    ))
                  )}
                </AdminSurfaceBody>
              </AdminSurface>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
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
        </>
      ) : null}
    </div>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <AdminSkeleton key={index} className="h-28" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
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
        No analytics events stored yet. Visit the public site and click Download
        to verify tracking after deploy.
      </AdminNotice>
    )
  }

  const lastMs = new Date(lastEventAt).getTime()
  const sinceMs = new Date(since).getTime()
  const isRecent = lastMs >= sinceMs

  if (isRecent) {
    return (
      <AdminNotice tone="success">
        Tracking active · last event {formatRelativeTime(lastEventAt)}
      </AdminNotice>
    )
  }

  return (
    <AdminNotice tone="warning">
      No events in the selected range · last event{" "}
      {formatRelativeTime(lastEventAt)}
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
