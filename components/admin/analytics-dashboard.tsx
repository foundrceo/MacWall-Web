"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {[7, 30, 90].map((value) => (
          <Button
            key={value}
            size="sm"
            variant={days === value ? "default" : "outline"}
            onClick={() => setDays(value)}
          >
            Last {value} days
          </Button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-white/55">Loading analytics…</p>
      ) : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {data ? (
        <>
          <TrackingHealthBanner
            lastEventAt={data.lastEventAt}
            since={data.since}
          />

          <p className="text-xs font-medium tracking-wide text-white/45 uppercase">
            Website analytics · last {data.rangeDays} days
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Download button clicks"
              value={downloadClicks}
              hint="Users who tapped a Download CTA on the site"
            />
            <MetricCard
              title="Installer redirects"
              value={downloadRedirects}
              hint="Hits to /download/latest that reached the DMG"
            />
            <MetricCard
              title="Unique download sessions"
              value={uniqueDownloadSessions}
              hint="Distinct visitors who triggered an installer redirect"
            />
            <MetricCard
              title="Click → redirect rate"
              value={downloadCompletionRate}
              suffix="%"
              hint="Redirects divided by button clicks in this period"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
            <MetricCard title="Pricing clicks" value={pricingClicks} />
            <MetricCard title="Page views" value={pageViews} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <LocationBreakdownCard
              title="Download clicks by button"
              emptyLabel="No download button clicks recorded yet."
              rows={data.downloadClicksByLocation ?? []}
              formatLocation={formatDownloadLocation}
            />

            <LocationBreakdownCard
              title="Pricing / checkout clicks by button"
              emptyLabel="No pricing clicks recorded yet."
              rows={data.pricingClicksByLocation ?? []}
              formatLocation={formatPricingLocation}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-white/10 bg-white/[0.03] text-white">
              <CardHeader>
                <CardTitle className="text-base">
                  Daily download activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {(data.downloadDaily ?? []).length === 0 ? (
                  <p className="text-sm text-white/50">
                    No download events in this range yet.
                  </p>
                ) : (
                  data.downloadDaily?.slice(-14).map((row) => (
                    <div
                      key={`${row.day}-${row.event_name}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-white/65">
                        {row.day} · {formatDownloadEvent(row.event_name)}
                      </span>
                      <span className="font-medium tabular-nums">
                        {row.count}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <p className="pt-2 text-xs font-medium tracking-wide text-white/45 uppercase">
            App catalog & licenses · all time
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Pending uploads"
              value={data.communityUploads.pending}
            />
            <MetricCard
              title="Approved uploads"
              value={data.communityUploads.approved}
            />
            <MetricCard
              title="Rejected uploads"
              value={data.communityUploads.rejected}
            />
            <MetricCard
              title="Catalog wallpapers"
              value={data.catalogWallpaperCount}
            />
            <MetricCard title="Total likes" value={data.totalLikes} />
            <MetricCard
              title="Activated devices"
              value={data.activatedDevices}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-white/10 bg-white/[0.03] text-white">
              <CardHeader>
                <CardTitle className="text-base">All tracked events</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.eventCounts.length === 0 ? (
                  <p className="text-sm text-white/50">
                    No events in this range yet.
                  </p>
                ) : (
                  data.eventCounts.map((row) => (
                    <div
                      key={row.event_name}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-white/75">{row.event_name}</span>
                      <span className="font-medium tabular-nums">
                        {row.count}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/[0.03] text-white">
              <CardHeader>
                <CardTitle className="text-base">
                  Top pages (page views)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.topPages.length === 0 ? (
                  <p className="text-sm text-white/50">
                    No page views recorded yet.
                  </p>
                ) : (
                  data.topPages.map((row) => (
                    <div
                      key={row.path}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="truncate text-white/75">{row.path}</span>
                      <span className="shrink-0 font-medium tabular-nums">
                        {row.count}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-white/10 bg-white/[0.03] text-white">
            <CardHeader>
              <CardTitle className="text-base">Daily activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {data.dailyCounts.length === 0 ? (
                <p className="text-sm text-white/50">No daily breakdown yet.</p>
              ) : (
                data.dailyCounts.slice(-20).map((row) => (
                  <div
                    key={`${row.day}-${row.event_name}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-white/65">
                      {row.day} · {row.event_name}
                    </span>
                    <span className="font-medium tabular-nums">
                      {row.count}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}

function MetricCard({
  title,
  value,
  hint,
  suffix,
}: Readonly<{
  title: string
  value: number
  hint?: string
  suffix?: string
}>) {
  return (
    <Card className="border-white/10 bg-white/[0.03] text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-white/65">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
          {value.toLocaleString()}
          {suffix ? (
            <span className="text-xl text-white/55">{suffix}</span>
          ) : null}
        </p>
        {hint ? <p className="mt-2 text-xs text-white/45">{hint}</p> : null}
      </CardContent>
    </Card>
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

function formatDownloadEvent(eventName: string) {
  if (eventName === "download_click") return "button click"
  if (eventName === "download_redirect") return "installer redirect"
  return eventName
}

function TrackingHealthBanner({
  lastEventAt,
  since,
}: Readonly<{ lastEventAt: string | null; since: string }>) {
  if (!lastEventAt) {
    return (
      <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
        No analytics events stored yet. Visit the public site and click Download
        to verify tracking after deploy.
      </p>
    )
  }

  const lastMs = new Date(lastEventAt).getTime()
  const sinceMs = new Date(since).getTime()
  const isRecent = lastMs >= sinceMs

  return (
    <p
      className={
        isRecent
          ? "text-sm text-emerald-400"
          : "rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100"
      }
    >
      {isRecent
        ? `Tracking active · last event ${formatRelativeTime(lastEventAt)}`
        : `No events in the selected range · last event ${formatRelativeTime(lastEventAt)}`}
    </p>
  )
}

function LocationBreakdownCard({
  title,
  emptyLabel,
  rows,
  formatLocation,
}: Readonly<{
  title: string
  emptyLabel: string
  rows: Array<{ location: string; count: number }>
  formatLocation: (location: string) => string
}>) {
  return (
    <Card className="border-white/10 bg-white/[0.03] text-white">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-sm text-white/50">{emptyLabel}</p>
        ) : (
          rows.map((row) => (
            <div
              key={row.location}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-white/75">
                {formatLocation(row.location)}
              </span>
              <span className="font-medium tabular-nums">{row.count}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
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
