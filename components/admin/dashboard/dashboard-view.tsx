"use client"

/**
 * Analytics dashboard (/admin). One request to /api/admin/analytics feeds the
 * whole page; the sections below only shape and draw it.
 */

import { RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"

import { AdminPage } from "@/components/admin/page"
import {
  IconButton,
  Notice,
  Segmented,
  StatusDot,
  type Tone,
} from "@/components/admin/ui"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { CatalogSection } from "./catalog-section"
import { relativeTime } from "./format"
import { GrowthSection } from "./growth-section"
import { LicensesSection } from "./licenses-section"
import { LiveSection } from "./live-section"
import { OverviewSection } from "./overview-section"
import { SalesSection } from "./sales-section"
import { SectionNav } from "./section-nav"
import { ServicesSection } from "./services-section"
import { DashboardSkeleton } from "./skeleton"
import { SupportSection } from "./support-section"
import { TrafficSection } from "./traffic-section"
import type { AnalyticsResponse, Snapshot } from "./types"

type Range = "7" | "30" | "90" | "0"

const RANGES: readonly { value: Range; label: string; ariaLabel: string }[] = [
  { value: "7", label: "7d", ariaLabel: "Last 7 days" },
  { value: "30", label: "30d", ariaLabel: "Last 30 days" },
  { value: "90", label: "90d", ariaLabel: "Last 90 days" },
  { value: "0", label: "All", ariaLabel: "All time" },
]

type LoadState = {
  /** Last payload that loaded; stays on screen while the next one loads. */
  snapshot: Snapshot | null
  error: string | null
  /** The request (`range:attempt`) that `snapshot` or `error` answers. */
  settled: string | null
}

async function fetchAnalytics(
  range: Range,
  signal: AbortSignal
): Promise<AnalyticsResponse> {
  const response = await fetch(`/api/admin/analytics?days=${range}`, {
    cache: "no-store",
    credentials: "same-origin",
    signal,
  })
  const payload = (await response.json().catch(() => null)) as
    (AnalyticsResponse & { error?: string }) | null
  if (response.status === 401) {
    throw new Error("Your session has expired. Sign in again to continue.")
  }
  if (!response.ok || !payload) {
    throw new Error(
      payload?.error ?? `The analytics request failed (${response.status}).`
    )
  }
  return payload
}

export function DashboardView() {
  const [range, setRange] = useState<Range>("30")
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<LoadState>({
    snapshot: null,
    error: null,
    settled: null,
  })

  const request = `${range}:${attempt}`
  const loading = state.settled !== request
  const { snapshot } = state
  const error = loading ? null : state.error

  useEffect(() => {
    const controller = new AbortController()
    fetchAnalytics(range, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return
        setState({
          snapshot: { data, fetchedAt: Date.now() },
          error: null,
          settled: request,
        })
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return
        setState((previous) => ({
          snapshot: previous.snapshot,
          error:
            cause instanceof Error && cause.message
              ? cause.message
              : "The analytics request failed.",
          settled: request,
        }))
      })
    return () => controller.abort()
  }, [range, request])

  const refresh = () => setAttempt((value) => value + 1)

  return (
    <AdminPage
      title="Analytics"
      description="Sales, traffic and product health for MacWall."
      actions={
        <>
          {snapshot ? <TrackingStatus data={snapshot.data} /> : null}
          <Segmented
            label="Date range"
            value={range}
            onChange={setRange}
            options={RANGES}
          />
          <IconButton
            label={loading ? "Refreshing" : "Refresh"}
            variant="outline"
            size="icon-lg"
            side="bottom"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw
              aria-hidden
              className={cn(
                loading && "animate-spin motion-reduce:animate-none"
              )}
            />
          </IconButton>
        </>
      }
    >
      <div className="space-y-8" aria-busy={loading}>
        {error ? (
          <Notice
            title={
              snapshot
                ? "Could not refresh analytics"
                : "Could not load analytics"
            }
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={refresh}
              >
                Try again
              </Button>
            }
          >
            {error}
            {snapshot
              ? ` Still showing ${
                  snapshot.data.rangeDays === 0
                    ? "all time"
                    : `the last ${snapshot.data.rangeDays} days`
                }, loaded ${relativeTime(new Date(snapshot.fetchedAt).toISOString())}.`
              : null}
          </Notice>
        ) : null}

        {snapshot ? (
          <div
            className={cn(
              "space-y-8 transition-opacity duration-200 motion-reduce:transition-none",
              // Dim the old range while the newly picked one loads.
              loading &&
                String(snapshot.data.rangeDays) !== range &&
                "opacity-60"
            )}
          >
            <OverviewSection snapshot={snapshot} />
            <SectionNav />
            <SalesSection snapshot={snapshot} />
            <GrowthSection snapshot={snapshot} />
            <TrafficSection snapshot={snapshot} />
            <LiveSection snapshot={snapshot} />
            <LicensesSection snapshot={snapshot} />
            <SupportSection snapshot={snapshot} />
            <CatalogSection snapshot={snapshot} />
            <ServicesSection snapshot={snapshot} />
          </div>
        ) : loading ? (
          <DashboardSkeleton />
        ) : null}
      </div>
    </AdminPage>
  )
}

/** Whether events are arriving, and how many visitors are on the site now. */
function TrackingStatus({ data }: Readonly<{ data: AnalyticsResponse }>) {
  const { lastEventAt } = data
  const inRange =
    lastEventAt != null &&
    new Date(lastEventAt).getTime() >= new Date(data.since).getTime()
  const activeNow = data.liveActivity.activeUsers5m

  let tone: Tone = "neutral"
  let label = "No events yet"
  if (inRange) {
    tone = "green"
    label =
      activeNow > 0
        ? `${activeNow.toLocaleString("en-US")} active now`
        : "Tracking active"
  } else if (lastEventAt) {
    tone = "amber"
    label = "No events in range"
  }

  return (
    <p
      role="status"
      className="text-soft flex items-center gap-2 text-[12.5px] whitespace-nowrap max-sm:order-last max-sm:w-full sm:pr-1"
    >
      <StatusDot tone={tone} pulse={inRange} />
      <span className="tabular-nums">{label}</span>
      {lastEventAt ? (
        <span className="text-muted-foreground">
          Last event {relativeTime(lastEventAt)}
        </span>
      ) : null}
    </p>
  )
}
