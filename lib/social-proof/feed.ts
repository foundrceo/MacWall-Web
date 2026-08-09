/**
 * Social proof feed — mixes real recent purchases (with country when known)
 * and 10× synthetic marketing lines so high-traffic visitors always see
 * urgent "someone just…" activity.
 */

import { countryDisplayName } from "@/lib/geo/country-display"

export type SocialProofPlan = "pro" | "pro_plus"

export type SocialProofPurchase = {
  plan: SocialProofPlan
  atIso: string
  /** ISO 3166-1 alpha-2 when known; never city/email/PII. */
  country: string | null
}

export type SocialProofStats = {
  last24h: number
  last7d: number
  allTime: number
}

export type SocialProofFeed = {
  purchases: SocialProofPurchase[]
  stats: SocialProofStats | null
}

export const EMPTY_SOCIAL_PROOF_FEED: SocialProofFeed = {
  purchases: [],
  stats: null,
}

export type SocialProofMessage = {
  /** Stable per event — used to avoid showing the same purchase twice. */
  key: string
  text: string
  /** Relative age for purchases ("just now", "3 min ago"); null for stats. */
  meta: string | null
}

/** Always amplify real volume before aggregates hit the popup. */
export const SOCIAL_PROOF_MULTIPLIER = 10

/** Floor so empty days still feel alive for high-traffic visitors. */
const FLOOR_LAST_24H = 12
const FLOOR_LAST_7D = 48
const FLOOR_ALL_TIME = 500

/**
 * Older purchases still count as social proof, but "someone went Pro" next to
 * "6 days ago" reads as barrel-scraping. Past this age we only use the row in
 * aggregate counts.
 */
const MAX_PURCHASE_AGE_MS = 48 * 60 * 60 * 1000

/** How many synthetic "just now" style lines to rotate through. */
const SYNTHETIC_POOL_SIZE = 36

type Line = {
  text: string
  kind: "purchase" | "activation" | "macbook" | "other"
}

/**
 * Purchase-heavy mix — most slots are "someone just purchased" for conversion.
 * Activations + MacBook lid moments fill the rest.
 */
const MARKETING_LINES: readonly Line[] = [
  // Purchases (majority)
  { kind: "purchase", text: "Someone just bought MacWall Pro" },
  { kind: "purchase", text: "Someone just unlocked MacWall Pro" },
  { kind: "purchase", text: "Someone just claimed lifetime Pro" },
  { kind: "purchase", text: "A new Pro license just landed" },
  { kind: "purchase", text: "Someone just unlocked MacWall Pro" },
  { kind: "purchase", text: "Someone just went Pro" },
  { kind: "purchase", text: "Someone just unlocked the whole catalog" },
  { kind: "purchase", text: "Another Pro purchase just came through" },
  { kind: "purchase", text: "Someone just claimed lifetime access" },
  { kind: "purchase", text: "Someone just bought Pro for their Mac" },
  { kind: "purchase", text: "Someone just picked MacWall Pro" },
  { kind: "purchase", text: "A Pro license was just claimed" },
  { kind: "purchase", text: "Someone just unlocked Pro for life" },
  { kind: "purchase", text: "Someone just bought MacWall" },
  { kind: "purchase", text: "Someone just unlocked every wallpaper" },
  { kind: "purchase", text: "Someone just grabbed the 5-Mac pack" },
  { kind: "purchase", text: "Someone just went Pro on checkout" },
  { kind: "purchase", text: "Someone just unlocked MacWall Pro+" },
  // Activations
  { kind: "activation", text: "Someone just activated MacWall Pro" },
  { kind: "activation", text: "A license was just activated" },
  { kind: "activation", text: "Someone just activated on their Mac" },
  { kind: "activation", text: "Someone just activated their Pro key" },
  { kind: "activation", text: "A new Mac just activated Pro" },
  // MacBook / desktop moments
  { kind: "macbook", text: "Someone just set a live wallpaper on their MacBook" },
  { kind: "macbook", text: "Someone's MacBook lid just went cinematic" },
  { kind: "macbook", text: "A MacBook just got a new live wallpaper" },
  { kind: "macbook", text: "Someone just elevated their Mac desktop" },
  { kind: "macbook", text: "Someone's MacBook just lit up with MacWall" },
  // Other urgency
  { kind: "other", text: "Someone unlocked the complete catalog" },
  { kind: "other", text: "Someone picked lifetime over a subscription" },
  { kind: "other", text: "One more Mac running live wallpapers" },
]

const PRO_LINES: ReadonlyArray<{ text: string }> = [
  { text: "Someone just bought MacWall Pro" },
  { text: "Someone just went Pro" },
  { text: "Someone just unlocked the whole catalog" },
  { text: "A new Pro license was activated" },
  { text: "Someone just claimed lifetime Pro" },
]

const PRO_PLUS_LINES: ReadonlyArray<{ text: string }> = [
  { text: "Someone just grabbed the 5-Mac pack" },
  { text: "A 5-Mac Pro license was just activated" },
  { text: "Someone just went Pro on every Mac they own" },
]

/** Recent-feeling ages for synthetic lines only. */
const RECENT_METAS = [
  "just now",
  "just now",
  "just now",
  "1 min ago",
  "1 min ago",
  "2 min ago",
  "2 min ago",
  "3 min ago",
  "4 min ago",
  "5 min ago",
] as const

function hashString(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0
  }
  return Math.abs(hash)
}

function amplifyCount(value: number, floor: number): number {
  return Math.max(floor, Math.round(value * SOCIAL_PROOF_MULTIPLIER))
}

/** 10× real volume (with floors) — for aggregate banners only. */
export function amplifyStats(stats: SocialProofStats | null): SocialProofStats {
  if (!stats) {
    return {
      last24h: FLOOR_LAST_24H,
      last7d: FLOOR_LAST_7D,
      allTime: FLOOR_ALL_TIME,
    }
  }

  return {
    last24h: amplifyCount(stats.last24h, FLOOR_LAST_24H),
    last7d: amplifyCount(stats.last7d, FLOOR_LAST_7D),
    allTime: amplifyCount(stats.allTime, FLOOR_ALL_TIME),
  }
}

export function formatPurchaseAge(atIso: string, nowMs: number): string | null {
  const atMs = Date.parse(atIso)
  if (!Number.isFinite(atMs)) return null

  const diffMs = nowMs - atMs
  if (diffMs < 0) return "just now"

  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 2) return "just now"
  if (minutes < 60) return `${minutes} min ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`

  const days = Math.floor(hours / 24)
  if (days === 1) return "yesterday"
  return `${days} days ago`
}

function realPurchaseMessage(
  purchase: SocialProofPurchase,
  nowMs: number
): SocialProofMessage | null {
  const atMs = Date.parse(purchase.atIso)
  if (!Number.isFinite(atMs)) return null
  if (nowMs - atMs > MAX_PURCHASE_AGE_MS) return null

  const meta = formatPurchaseAge(purchase.atIso, nowMs)
  if (!meta) return null

  const place = countryDisplayName(purchase.country)
  const seed = hashString(purchase.atIso)

  if (place) {
    const countryLines =
      purchase.plan === "pro_plus"
        ? [
            {
              text: `Someone in ${place} just purchased the 5-Mac pack`,
            },
            {
              text: `Someone in ${place} just went Pro on 5 Macs`,
            },
            {
              text: `Someone in ${place} just activated a Pro pack`,
            },
          ]
        : [
            {
              text: `Someone in ${place} just purchased MacWall Pro`,
            },
            { text: `Someone in ${place} just went Pro` },
            {
              text: `Someone in ${place} just unlocked MacWall Pro`,
            },
            {
              text: `Someone in ${place} just bought lifetime Pro`,
            },
            {
              text: `Someone in ${place} just activated Pro`,
            },
          ]

    const line = countryLines[seed % countryLines.length]!
    return {
      key: `real:${purchase.atIso}`,
      text: line.text,
      meta,
    }
  }

  const lines = purchase.plan === "pro_plus" ? PRO_PLUS_LINES : PRO_LINES
  const line = lines[seed % lines.length]
  if (!line) return null

  return {
    key: `real:${purchase.atIso}`,
    text: line.text,
    meta,
  }
}

function weightedLine(seed: number): Line {
  // ~70% purchase, ~15% activation, ~10% macbook, ~5% other
  const bucket = seed % 100
  const kind: Line["kind"] =
    bucket < 70
      ? "purchase"
      : bucket < 85
        ? "activation"
        : bucket < 95
          ? "macbook"
          : "other"

  const pool = MARKETING_LINES.filter((line) => line.kind === kind)
  return pool[seed % pool.length] ?? MARKETING_LINES[0]!
}

function statMessages(stats: SocialProofStats): SocialProofMessage[] {
  return [
    {
      key: `stat:24h:${stats.last24h}`,
      text: `${stats.last24h.toLocaleString("en-US")} people downloaded MacWall in the last 24 hours`,
      meta: null,
    },
    {
      key: `stat:live:${stats.last24h}`,
      text: `${stats.last24h.toLocaleString("en-US")} people are using MacWall right now`,
      meta: null,
    },
    {
      key: `stat:7d:${stats.last7d}`,
      text: `${stats.last7d.toLocaleString("en-US")} people joined MacWall this week`,
      meta: null,
    },
    {
      key: `stat:all:${stats.allTime}`,
      text: `${stats.allTime.toLocaleString("en-US")} people are running MacWall on their Mac`,
      meta: null,
    },
  ]
}

function buildSyntheticQueue(
  feed: SocialProofFeed,
  nowMs: number
): SocialProofMessage[] {
  const stats = amplifyStats(feed.stats)
  const statsPool = statMessages(stats)
  const seedBase =
    hashString(
      `${stats.last24h}:${stats.last7d}:${stats.allTime}:${feed.purchases.length}`
    ) + Math.floor(nowMs / 60_000)

  const queue: SocialProofMessage[] = []
  let statIndex = 0

  for (let index = 0; index < SYNTHETIC_POOL_SIZE; index += 1) {
    if ((index + 1) % 4 === 0) {
      // Advance a dedicated counter — slot indexes are all ≡ 3 mod 4, so
      // `index % statsPool.length` would stick on one aggregate forever.
      const stat = statsPool[statIndex % statsPool.length]
      statIndex += 1
      if (stat) {
        queue.push({
          ...stat,
          key: `${stat.key}:slot:${index}`,
        })
      }
      continue
    }

    const seed = seedBase + index * 17
    const line = weightedLine(seed)
    const meta = RECENT_METAS[seed % RECENT_METAS.length] ?? "just now"

    queue.push({
      key: `synth:${seedBase}:${index}`,
      text: line.text,
      meta,
    })
  }

  return queue
}

/**
 * Real purchases first (with country when available), then synthetic 10× lines.
 * Real rows are never invented — only copy + country phrasing is derived.
 */
export function buildSocialProofQueue(
  feed: SocialProofFeed,
  nowMs: number
): SocialProofMessage[] {
  const real = feed.purchases
    .map((purchase) => realPurchaseMessage(purchase, nowMs))
    .filter((message): message is SocialProofMessage => message !== null)

  const synthetic = buildSyntheticQueue(feed, nowMs)
  if (real.length === 0) return synthetic

  // Lead with real activity, then keep the feed dense with synthetics.
  const queue: SocialProofMessage[] = []
  let synthIndex = 0

  for (const purchase of real) {
    queue.push(purchase)
    // One synthetic after each real so country popups stay frequent.
    const filler = synthetic[synthIndex]
    if (filler) {
      queue.push(filler)
      synthIndex += 1
    }
  }

  while (synthIndex < synthetic.length) {
    const filler = synthetic[synthIndex]
    if (filler) queue.push(filler)
    synthIndex += 1
  }

  return queue
}

/** Keep rotating marketing lines after the first pool is exhausted. */
export function socialProofFallbackMessages(
  feed: SocialProofFeed
): SocialProofMessage[] {
  const stats = amplifyStats(feed.stats)
  const statsPool = statMessages(stats)
  const messages: SocialProofMessage[] = []

  for (let index = 0; index < MARKETING_LINES.length; index += 1) {
    const line = MARKETING_LINES[index]!
    const meta = RECENT_METAS[index % RECENT_METAS.length] ?? "just now"
    messages.push({
      key: `fallback:${line.kind}:${index}`,
      text: line.text,
      meta,
    })

    if ((index + 1) % 5 === 0) {
      const stat = statsPool[Math.floor(index / 5) % statsPool.length]
      if (stat) {
        messages.push({
          ...stat,
          key: `${stat.key}:fallback:${index}`,
        })
      }
    }
  }

  return messages
}
