import { Cloud, Maximize2 } from "lucide-react"
import type { ReactNode } from "react"

import { LandingSectionHeader } from "@/components/macwall-marketing/landing-section-header"
import {
  LANDING_SECTION_END,
  MarketingSection,
} from "@/components/macwall-marketing/marketing-section"
import { macwallPlaybackModes, macwallSocialProof } from "@/lib/macwall-site"
import type { PublicStats, ServedStats } from "@/lib/public-stats"
import { cn } from "@/lib/utils"

import {
  CountUp,
  CpuDrop,
  LockGlass,
  MacOrbit,
  RuleRows,
} from "./built-for-mac-client"

/*
 * Based on Tailark's "Features 8" and "Features 9" (21st.dev). Content is real:
 * installer downloads, Cloudflare's bytes served (lib/public-stats.ts), the
 * pause rules from /docs/performance-and-battery, and reviewers already on
 * the site.
 *
 * A server component: every number and the served chart are in the HTML as
 * final values. The animated and interactive bits come from
 * built-for-mac-client.tsx.
 */

const DOWNLOADS = Number(macwallSocialProof.downloadsLabel.replace(/\D/g, ""))

const CARD =
  "relative min-w-0 overflow-hidden rounded-[24px] bg-surface-1 p-6 squircle"
const TOP = "col-span-full sm:col-span-3 lg:col-span-2"
const BOTTOM = "col-span-full lg:col-span-3"
const TITLE = "text-[19px] leading-7 font-medium tracking-tight text-ink"
const BODY = "text-[14px] leading-[22px] text-ink-2"
const LABEL = "text-[13px] leading-5 text-ink-3"

const nativeMode = macwallPlaybackModes.systemWallpaper

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** "3.4 TB" / "812 GB". */
function formatBytes(bytes: number) {
  if (bytes >= 1e12) {
    const tb = bytes / 1e12
    return tb >= 100
      ? { value: Math.round(tb), unit: "TB", decimals: 0 }
      : { value: Math.round(tb * 10) / 10, unit: "TB", decimals: 1 }
  }
  return { value: Math.round(bytes / 1e9), unit: "GB", decimals: 0 }
}

/** "1,693" / "4.2", the number part of `formatBytes`. */
function formatBytesValue({
  value,
  decimals,
}: Readonly<{ value: number; decimals: number }>) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** "1,693 TB" / "4.2 TB" / "812 GB", for the chart's tooltips. */
function bytesLabel(bytes: number) {
  const parts = formatBytes(bytes)
  return `${formatBytesValue(parts)} ${parts.unit}`
}

/** "Oct 27, 2026", for the chart's tooltips. */
const fullDay = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })

/** Bytes served by the end of each day: a series that only ever rises. */
const runningTotal = (served: ServedStats) =>
  served.daily.reduce<number[]>(
    (acc, d) => [...acc, (acc.at(-1) ?? 0) + d.bytes],
    []
  )

/* ------------------------------------------------------------------ */
/* Tailark pieces                                                      */
/* ------------------------------------------------------------------ */

function Ring({
  children,
  size = "md",
}: Readonly<{ children: ReactNode; size?: "md" | "lg" }>) {
  return (
    <div
      className={cn(
        "relative flex aspect-square rounded-full border border-white/10 before:absolute before:-inset-2 before:rounded-full before:border before:border-white/5",
        size === "lg" ? "size-32" : "size-12"
      )}
    >
      <span className="m-auto text-ink">{children}</span>
    </div>
  )
}

/** Tailark's little app window, peeking in from the card's corner. */
function PeekWindow({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="relative -mr-6 -mb-6 rounded-tl-2xl border-t border-l border-white/10 bg-black/30 p-5 pt-8 sm:ml-6">
      <div className="absolute top-3 left-4 flex gap-1" aria-hidden>
        <span className="size-2 rounded-full bg-white/10" />
        <span className="size-2 rounded-full bg-white/10" />
        <span className="size-2 rounded-full bg-white/10" />
      </div>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Cards                                                               */
/* ------------------------------------------------------------------ */

/**
 * The top row's shared layout, after Tailark's Features 9: the same height of
 * moving visual in every card, then a centred title and line at the same place.
 * A title that is a statistic is a paragraph, not a heading.
 */
function TopCard({
  visual,
  title,
  titleAs: Title = "h3",
  children,
}: Readonly<{
  visual: ReactNode
  title: ReactNode
  titleAs?: "h3" | "p"
  children: ReactNode
}>) {
  return (
    <div className={cn(CARD, TOP, "flex flex-col")}>
      <div className="relative flex h-[232px] items-center justify-center">
        {visual}
      </div>
      <div className="mt-4 text-center">
        <Title className={TITLE}>{title}</Title>
        <p className={cn(BODY, "mx-auto mt-2 max-w-[19rem]")}>{children}</p>
      </div>
    </div>
  )
}

function CpuCard() {
  return (
    <TopCard visual={<CpuDrop />} title="0% CPU from MacWall after you quit">
      With {nativeMode.marketing} ({nativeMode.setting}) on{" "}
      {nativeMode.minimumMacOS}, your desktop keeps playing after MacWall quits.
      macOS still decodes the video.
    </TopCard>
  )
}

function QuietCard() {
  return (
    <div className={cn(CARD, BOTTOM, "grid sm:grid-cols-2")}>
      <div className="flex flex-col justify-between gap-10">
        <Ring>
          <Maximize2 className="size-5" strokeWidth={1.25} aria-hidden />
        </Ring>
        <div className="space-y-2">
          <h3 className={TITLE}>Gets out of the way</h3>
          <p className={BODY}>
            It pauses for full-screen apps and sleep on its own, and on battery
            or under heavy work if you turn that on.
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-col justify-end sm:mt-0">
        <PeekWindow>
          <RuleRows />
        </PeekWindow>
      </div>
    </div>
  )
}

function UsersNarrowCard() {
  return (
    <TopCard
      visual={<MacOrbit />}
      titleAs="p"
      title={
        <>
          <CountUp
            to={DOWNLOADS}
            label={macwallSocialProof.downloadsLabel}
            suffix="+"
          />{" "}
          downloads
        </>
      }
    >
      Installer downloads from macwall.app. A few of the people using it, from
      our reviews.
    </TopCard>
  )
}

/** Chart drawing box; the SVG stretches to its cell (`preserveAspectRatio="none"`). */
const CHART_W = 400
const CHART_H = 160
const CHART_PAD_TOP = 8
const CHART_PAD_BOTTOM = 4
/** Hover targets along the line, each with a native tooltip. */
const CHART_HOVER_POINTS = 40

const round1 = (n: number) => Math.round(n * 10) / 10

/**
 * The running total as an area chart, drawn on the server: no chart library
 * on the page. Hovering a band shows that day's total as a tooltip.
 */
function ServedChart({ served }: Readonly<{ served: ServedStats }>) {
  const totals = runningTotal(served)
  // Start the day before traffic first reached a gigabyte, so the line rises
  // from zero instead of sitting flat through the quiet early weeks.
  const first = served.daily.findIndex((d) => d.bytes >= 1e9)
  const start = Math.max(first - 1, 0)
  const days = served.daily.slice(start).map((d, i) => ({
    date: d.date,
    total: totals[start + i] ?? 0,
  }))
  if (days.length < 2) return null

  const max = Math.max(...days.map((d) => d.total), 1)
  const span = CHART_H - CHART_PAD_TOP - CHART_PAD_BOTTOM
  const points = days.map((d, i) => ({
    ...d,
    x: round1((i / (days.length - 1)) * CHART_W),
    y: round1(CHART_PAD_TOP + (1 - d.total / max) * span),
  }))
  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`)
    .join("")
  const area = `${line}L${CHART_W} ${CHART_H}L0 ${CHART_H}Z`

  // Evenly spaced days (always the last one), each owning the band halfway
  // to its neighbours.
  const step = Math.max(1, Math.ceil(points.length / CHART_HOVER_POINTS))
  const picked = points.filter(
    (_, i) => i % step === 0 || i === points.length - 1
  )
  const bands = picked.map((p, i) => {
    const left = i === 0 ? 0 : (picked[i - 1]!.x + p.x) / 2
    const right =
      i === picked.length - 1 ? CHART_W : (p.x + picked[i + 1]!.x) / 2
    return { ...p, left: round1(left), width: round1(right - left) }
  })
  const last = points[points.length - 1]!

  return (
    <div className="relative min-h-32 w-full self-stretch">
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Total data served, rising to ${bytesLabel(last.total)} by ${fullDay(last.date)}`}
        className="absolute inset-0 size-full overflow-visible"
      >
        <defs>
          <linearGradient id="served-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="white" stopOpacity={0.22} />
            <stop offset="1" stopColor="white" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#served-fill)" />
        <path
          d={line}
          fill="none"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth={1.5}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {bands.map((band) => (
          <rect
            key={band.date}
            x={band.left}
            y={0}
            width={band.width}
            height={CHART_H}
            className="fill-transparent transition-colors hover:fill-white/[0.06]"
          >
            <title>{`${fullDay(band.date)}: ${bytesLabel(band.total)} served in total`}</title>
          </rect>
        ))}
      </svg>
    </div>
  )
}

/** Design A's wide bottom card: total data served, as a running total that only rises. */
function ServedTotalCard({ served }: Readonly<{ served: ServedStats | null }>) {
  const total = served ? formatBytes(served.bytes) : null
  return (
    <div className={cn(CARD, BOTTOM, "grid gap-8 sm:grid-cols-2")}>
      <div className="flex flex-col justify-between gap-10">
        <Ring>
          <Cloud className="size-5" strokeWidth={1.25} aria-hidden />
        </Ring>
        <div className="space-y-2">
          <h3 className={LABEL}>Data served</h3>
          <p className="text-[28px] leading-none font-semibold tracking-tight text-ink tabular-nums">
            {total ? (
              <>
                <CountUp
                  to={total.value}
                  label={formatBytesValue(total)}
                  decimals={total.decimals}
                />{" "}
                {total.unit}
              </>
            ) : (
              "Served worldwide"
            )}
          </p>
          <p className={BODY}>
            Wallpapers and pages from Cloudflare&rsquo;s network. Counted live,
            updated hourly.
          </p>
        </div>
      </div>
      {served ? <ServedChart served={served} /> : null}
    </div>
  )
}

function LockRingCard() {
  return (
    <TopCard visual={<LockGlass />} title="Lock Screen ready">
      Desktop, Lock Screen and screen saver, set in one click.
    </TopCard>
  )
}

/**
 * The homepage's "Light on your Mac" bento: three cards above (CPU, Lock Screen,
 * users), two wide ones below (pause rules, data served), all one height.
 */
export function BuiltForMac({
  stats,
}: Readonly<{ stats: PublicStats | null }>) {
  return (
    <MarketingSection
      sectionClassName={LANDING_SECTION_END}
      aria-label="Light on your Mac"
    >
      <LandingSectionHeader
        title="Light on your Mac"
        lead="Keeps playing after you quit and pauses while you work."
      />
      <div className="grid grid-cols-6 gap-3 lg:auto-rows-fr">
        <CpuCard />
        <LockRingCard />
        <UsersNarrowCard />
        <QuietCard />
        <ServedTotalCard served={stats?.served ?? null} />
      </div>
    </MarketingSection>
  )
}
