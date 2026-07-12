"use client"

import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type AnalyticsResponse = {
  rangeDays: number
  eventCounts: Array<{ event_name: string; count: number }>
  dailyCounts: Array<{ day: string; event_name: string; count: number }>
  downloadFunnel?: {
    clicks: number
    redirects: number
    uniqueRedirectSessions: number
    completionRate: number
  }
  downloadClicksByLocation?: Array<{ location: string; count: number }>
  downloadDaily?: Array<{ day: string; event_name: string; count: number }>
  topPaths: Array<{ path: string; count: number }>
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
            <Card className="border-white/10 bg-white/[0.03] text-white">
              <CardHeader>
                <CardTitle className="text-base">
                  Download clicks by button
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(data.downloadClicksByLocation ?? []).length === 0 ? (
                  <p className="text-sm text-white/50">
                    No download button clicks recorded yet.
                  </p>
                ) : (
                  data.downloadClicksByLocation?.map((row) => (
                    <div
                      key={row.location}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-white/75">
                        {formatDownloadLocation(row.location)}
                      </span>
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Pending uploads"
              value={data.communityUploads.pending}
            />
            <MetricCard
              title="Approved uploads"
              value={data.communityUploads.approved}
            />
            <MetricCard
              title="Catalog wallpapers"
              value={data.catalogWallpaperCount}
            />
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
                <CardTitle className="text-base">Top pages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.topPaths.length === 0 ? (
                  <p className="text-sm text-white/50">
                    No page paths recorded yet.
                  </p>
                ) : (
                  data.topPaths.map((row) => (
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

function formatDownloadLocation(location: string) {
  return DOWNLOAD_LOCATION_LABELS[location] ?? location
}

function formatDownloadEvent(eventName: string) {
  if (eventName === "download_click") return "button click"
  if (eventName === "download_redirect") return "installer redirect"
  return eventName
}
