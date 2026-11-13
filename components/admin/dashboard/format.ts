/** Labels, number formats and day buckets shared by the dashboard sections. */

import { formatRelativeTime } from "@/lib/admin/format"

const numberFormat = new Intl.NumberFormat("en-US")
const compactFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
})

export function formatCount(value: number): string {
  return numberFormat.format(value)
}

/** Axis ticks: 1.2K, 34K. */
export function formatCompact(value: number): string {
  return compactFormat.format(value)
}

export function formatCompactUsd(value: number): string {
  return `$${compactFormat.format(value)}`
}

/** `part` as a percentage of `total`, one decimal, 0 when there is no total. */
export function percentOf(part: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((part / total) * 1000) / 10
}

export function formatPercent(value: number): string {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}%`
}

export function plural(count: number, one: string, many = `${one}s`): string {
  return `${formatCount(count)} ${count === 1 ? one : many}`
}

/* -------------------------------------------------------------------------- */
/* Labels                                                                     */
/* -------------------------------------------------------------------------- */

const EVENT_LABELS: Record<string, string> = {
  page_view: "Page views",
  download_click: "Download clicks",
  download_redirect: "Installer redirects",
  pricing_click: "Pricing clicks",
  cta_click: "CTA clicks",
  checkout_started: "Checkouts started",
  checkout_abandoned: "Checkouts abandoned",
  purchase_complete: "Purchases",
  wallpaper_like: "Wallpaper likes",
}

function sentenceCase(value: string): string {
  const text = value.replace(/[_-]+/g, " ").trim()
  return text ? text[0].toUpperCase() + text.slice(1) : value
}

/** Plural, for totals: "Page views". */
export function eventLabel(name: string): string {
  return EVENT_LABELS[name] ?? sentenceCase(name)
}

const EVENT_NOUNS: Record<string, string> = {
  page_view: "Page view",
  download_click: "Download click",
  download_redirect: "Installer redirect",
  pricing_click: "Pricing click",
  cta_click: "CTA click",
  checkout_started: "Checkout started",
  checkout_abandoned: "Checkout abandoned",
  purchase_complete: "Purchase",
  wallpaper_like: "Wallpaper like",
}

/** Singular, for one event in a feed: "Page view". */
export function eventNoun(name: string): string {
  return EVENT_NOUNS[name] ?? sentenceCase(name)
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
  pricing_card: "Pricing page button",
  india_pricing_offer: "India flash offer",
  bottom_cta: "Bottom call to action",
  footer_shop_buy: "Footer buy (desktop)",
  footer_mobile_shop: "Footer buy (mobile)",
  announcement_bar: "Announcement bar",
}

export function downloadLocationLabel(location: string): string {
  return DOWNLOAD_LOCATION_LABELS[location] ?? sentenceCase(location)
}

/** Pricing and CTA buttons share one set of placements. */
export function pricingLocationLabel(location: string): string {
  return (
    PRICING_LOCATION_LABELS[location] ??
    DOWNLOAD_LOCATION_LABELS[location] ??
    sentenceCase(location)
  )
}

const PLAN_LABELS: Record<string, string> = {
  pro: "Pro",
  pro_plus: "Pro+",
  pro_max: "Pro+",
  annual: "Annual",
}

export function planLabel(slug: string | null | undefined): string {
  if (!slug) return "License"
  return PLAN_LABELS[slug.toLowerCase()] ?? sentenceCase(slug)
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" })

/** "IN" becomes "India"; anything that is not a region code is returned as is. */
export function countryName(code: string | null | undefined): string {
  const value = code?.trim()
  if (!value) return "Unknown"
  if (!/^[A-Za-z]{2}$/.test(value)) return value
  try {
    return regionNames.of(value.toUpperCase()) ?? value.toUpperCase()
  } catch {
    return value.toUpperCase()
  }
}

/** Why Stripe has no data, without echoing the raw API error. */
export function stripeProblem(error: string | undefined): string {
  if (!error) return "Stripe returned no paid charges."
  if (/expired|invalid/i.test(error)) {
    return "The Stripe API key is expired or invalid."
  }
  return "Stripe could not be reached."
}

/** `formatRelativeTime` for the middle of a sentence: "just now", "12m ago". */
export function relativeTime(iso: string): string {
  const text = formatRelativeTime(iso)
  return text === "Just now" ? "just now" : text
}

/** "45s ago", "12m ago" for the live feed, which arrives as seconds. */
export function formatAgo(seconds: number): string {
  if (seconds < 60) return `${Math.max(1, Math.round(seconds))}s ago`
  return `${Math.round(seconds / 60)}m ago`
}

/* -------------------------------------------------------------------------- */
/* Day buckets                                                                */
/* -------------------------------------------------------------------------- */

const DAY_MS = 86_400_000

/** Ranges longer than this are charted by month. */
const MAX_DAILY_POINTS = 120

function dayToMs(day: string): number {
  return Date.parse(`${day}T00:00:00Z`)
}

function msToDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

export function shiftDay(day: string, days: number): string {
  return msToDay(dayToMs(day) + days * DAY_MS)
}

const dayTick = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
})
const dayTitle = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
})
const monthName = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
})
const monthTitle = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

/** "Nov 12", for notes next to a full date. */
export function formatDayShort(day: string): string {
  const ms = dayToMs(day)
  return Number.isNaN(ms) ? day : dayTick.format(ms)
}

export type Granularity = "day" | "month"

export type Bucket = {
  /** `2026-11-12` for a day, `2026-11` for a month. */
  key: string
  /** Axis tick. */
  label: string
  /** Tooltip heading. */
  title: string
}

export type Timeline = {
  granularity: Granularity
  buckets: Bucket[]
  /** Maps a `YYYY-MM-DD` day to its bucket key. */
  keyOf: (day: string) => string
}

const EMPTY_TIMELINE: Timeline = {
  granularity: "day",
  buckets: [],
  keyOf: (day) => day,
}

/**
 * The x axis for a range: every UTC day from the start of the range to the
 * day the data was fetched, so quiet days show as zero instead of vanishing.
 * All time starts at the first day with data and switches to months when the
 * span gets long.
 */
export function buildTimeline(options: {
  rangeDays: number
  since: string
  fetchedAt: number
  /** Days that have data, any order. */
  days: readonly string[]
}): Timeline {
  const { rangeDays, since, fetchedAt, days } = options
  const sorted = [...days].filter((day) => !Number.isNaN(dayToMs(day))).sort()
  const firstData = sorted[0]
  const lastData = sorted[sorted.length - 1]

  let start = rangeDays > 0 ? since.slice(0, 10) : firstData
  if (!start) return EMPTY_TIMELINE
  if (firstData && firstData < start) start = firstData

  let end = msToDay(fetchedAt)
  if (lastData && lastData > end) end = lastData
  if (end < start) end = start

  const span = Math.round((dayToMs(end) - dayToMs(start)) / DAY_MS) + 1

  if (span <= MAX_DAILY_POINTS) {
    const buckets: Bucket[] = []
    for (let index = 0; index < span; index += 1) {
      const ms = dayToMs(start) + index * DAY_MS
      buckets.push({
        key: msToDay(ms),
        label: dayTick.format(ms),
        title: dayTitle.format(ms),
      })
    }
    return { granularity: "day", buckets, keyOf: (day) => day }
  }

  const buckets: Bucket[] = []
  const cursor = new Date(dayToMs(`${start.slice(0, 7)}-01`))
  const endMonth = end.slice(0, 7)
  while (buckets.length < 600) {
    const key = cursor.toISOString().slice(0, 7)
    if (key > endMonth) break
    buckets.push({
      key,
      // "Oct ’25": the apostrophe keeps it from reading as October 25th.
      label: `${monthName.format(cursor)} ’${key.slice(2, 4)}`,
      title: monthTitle.format(cursor),
    })
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }
  return { granularity: "month", buckets, keyOf: (day) => day.slice(0, 7) }
}

/** Sums `rows` into the timeline's buckets, in bucket order. */
export function sumByBucket<T>(
  timeline: Timeline,
  rows: readonly T[],
  dayOf: (row: T) => string,
  valueOf: (row: T) => number
): number[] {
  const totals = new Map<string, number>()
  for (const row of rows) {
    const key = timeline.keyOf(dayOf(row))
    totals.set(key, (totals.get(key) ?? 0) + valueOf(row))
  }
  return timeline.buckets.map((bucket) => totals.get(bucket.key) ?? 0)
}
