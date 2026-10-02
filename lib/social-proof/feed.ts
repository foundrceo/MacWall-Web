/**
 * Social proof feed — only real recent purchases (with country when known)
 * and real license counts. Nothing is synthesized or inflated: invented
 * "someone just bought" lines are deceptive marketing under card-network
 * and payment-processor rules.
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

/**
 * Older purchases still count in the totals, but a purchase popup is only
 * shown for purchases from the last 24 hours.
 */
const MAX_PURCHASE_AGE_MS = 24 * 60 * 60 * 1000

/** Below these real counts the aggregate line is not worth showing. */
const MIN_WEEK_FOR_STAT = 5
const MIN_ALL_TIME_FOR_STAT = 50

const PRO_LINES: ReadonlyArray<{ text: string }> = [
  { text: "Someone bought MacWall Pro" },
  { text: "Someone went Pro" },
  { text: "Someone unlocked the whole catalog" },
]

const PRO_PLUS_LINES: ReadonlyArray<{ text: string }> = [
  { text: "Someone bought a multi-Mac Pro pack" },
  { text: "Someone went Pro on every Mac they own" },
]

function hashString(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0
  }
  return Math.abs(hash)
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
              text: `Someone in ${place} bought a multi-Mac Pro pack`,
            },
            {
              text: `Someone in ${place} activated a Pro pack`,
            },
          ]
        : [
            {
              text: `Someone in ${place} purchased MacWall Pro`,
            },
            { text: `Someone in ${place} went Pro` },
            {
              text: `Someone in ${place} unlocked MacWall Pro`,
            },
            {
              text: `Someone in ${place} activated Pro`,
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

/**
 * Aggregate lines from real license counts only — never multiplied, never
 * padded with a floor, and hidden while the numbers are small.
 */
function statMessages(stats: SocialProofStats | null): SocialProofMessage[] {
  if (!stats) return []
  const messages: SocialProofMessage[] = []
  if (stats.last7d >= MIN_WEEK_FOR_STAT) {
    messages.push({
      key: `stat:7d:${stats.last7d}`,
      text: `${stats.last7d.toLocaleString("en-US")} people bought MacWall Pro this week`,
      meta: null,
    })
  }
  if (stats.allTime >= MIN_ALL_TIME_FOR_STAT) {
    messages.push({
      key: `stat:all:${stats.allTime}`,
      text: `${stats.allTime.toLocaleString("en-US")} people have bought MacWall Pro`,
      meta: null,
    })
  }
  return messages
}

/**
 * Real purchases from the last 24 hours (with country when known), with a
 * real aggregate line after every few. Nothing here is invented: when there
 * is no recent activity, the queue is short or empty and no popup shows.
 */
export function buildSocialProofQueue(
  feed: SocialProofFeed,
  nowMs: number
): SocialProofMessage[] {
  const real = feed.purchases
    .map((purchase) => realPurchaseMessage(purchase, nowMs))
    .filter((message): message is SocialProofMessage => message !== null)
  const stats = statMessages(feed.stats)

  const queue: SocialProofMessage[] = []
  let statIndex = 0
  real.forEach((message, index) => {
    queue.push(message)
    if ((index + 1) % 3 === 0 && stats.length > 0) {
      const stat = stats[statIndex % stats.length]!
      queue.push({ ...stat, key: `${stat.key}:after:${index}` })
      statIndex += 1
    }
  })
  if (real.length === 0) queue.push(...stats)
  return queue
}

/** After the queue runs out, only the real aggregate lines repeat. */
export function socialProofFallbackMessages(
  feed: SocialProofFeed
): SocialProofMessage[] {
  return statMessages(feed.stats).map((message) => ({
    ...message,
    key: `${message.key}:fallback`,
  }))
}
