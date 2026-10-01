import type { ContentFaq } from "@/lib/content/types"
import {
  macwall,
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersion,
} from "@/lib/macwall-site"
import { aspectRatioLabel, parseResolution } from "@/lib/public-catalog/format"
import type { PublicWallpaper } from "@/lib/public-catalog/types"
import {
  collectionsForWallpaper,
  type WallpaperCollection,
} from "@/lib/seo/wallpaper-collections"

/**
 * Per-wallpaper copy for detail pages, metadata, and structured data.
 *
 * Everything is derived from the wallpaper's own fields (resolution, length,
 * tags, category, collections), so each of the ~800 detail pages says
 * something specific about its loop instead of repeating one template line.
 */

export type WallpaperDetailContent = {
  /** "4K", "1440p", "1080p", or null when unknown. */
  qualityLabel: string | null
  lead: string
  detail: string
  collections: WallpaperCollection[]
  steps: string[]
  faq: ContentFaq[]
  metaDescription: string
}

export function wallpaperQualityLabel(resolution: string): string | null {
  const dims = parseResolution(resolution)
  if (!dims) return null
  const longEdge = Math.max(dims.width, dims.height)
  const shortEdge = Math.min(dims.width, dims.height)
  if (longEdge >= 5000) return "5K"
  if (longEdge >= 3800 || shortEdge >= 2100) return "4K"
  if (shortEdge >= 1400) return "1440p"
  if (shortEdge >= 1000) return "1080p"
  return null
}

/** Human tag list: dedupes case variants and drops the generic ones. */
export function displayTags(wallpaper: PublicWallpaper, limit = 6): string[] {
  const skip = new Set([
    "community",
    "others",
    "other",
    "the",
    "and",
    "of",
    wallpaper.category.toLowerCase(),
  ])
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of wallpaper.tags) {
    const tag = raw.replace(/-/g, " ").trim()
    const key = tag.toLowerCase()
    if (key.length < 3 || skip.has(key) || seen.has(key)) continue
    seen.add(key)
    out.push(key)
    if (out.length >= limit) break
  }
  return out
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("")
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`
}

/** "12 seconds", "1 minute 30 seconds". */
function loopLengthPhrase(seconds: number): string {
  const total = Math.max(0, Math.round(seconds))
  const mins = Math.floor(total / 60)
  const secs = total % 60
  const parts: string[] = []
  if (mins > 0) parts.push(`${mins} ${mins === 1 ? "minute" : "minutes"}`)
  if (secs > 0) parts.push(`${secs} ${secs === 1 ? "second" : "seconds"}`)
  return parts.join(" ")
}

/** "a 4K anime", "an anime", "a" (for the catch-all Others bucket). */
function describedKind(category: string, qualityLabel: string | null): string {
  const kind = [qualityLabel, category === "others" ? null : category]
    .filter(Boolean)
    .join(" ")
  if (!kind) return "a"
  return `${/^[aeiou]/i.test(kind) ? "an" : "a"} ${kind}`
}

function clampDescription(text: string, max = 158): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(" ")
  return `${cut.slice(0, lastSpace > 80 ? lastSpace : cut.length).replace(/[,.;:\s]+$/, "")}…`
}

export function buildWallpaperDetailContent(
  wallpaper: PublicWallpaper
): WallpaperDetailContent {
  const name = wallpaper.name
  const category = wallpaper.category.toLowerCase()
  const qualityLabel = wallpaperQualityLabel(wallpaper.resolution)
  const aspect = aspectRatioLabel(wallpaper.resolution)
  const hasResolution =
    wallpaper.resolution.length > 0 && wallpaper.resolution !== "—"
  const hasDuration = wallpaper.durationSeconds > 0
  const tags = displayTags(wallpaper)
  const collections = collectionsForWallpaper(wallpaper)
  const primaryCollection = collections[0]

  const kind = describedKind(category, qualityLabel)
  const leadParts = [`${name} is ${kind} live wallpaper for Mac`]
  if (primaryCollection) {
    leadParts.push(`from the ${primaryCollection.name} collection`)
  }
  const lead = `${leadParts.join(" ")} in the ${macwall.name} catalog.`

  const facts: string[] = []
  if (hasResolution) {
    facts.push(
      `It is encoded at ${wallpaper.resolution}${aspect ? ` (${aspect})` : ""}`
    )
  }
  if (hasDuration) {
    facts.push(
      `${facts.length ? "and" : "It"} loops every ${loopLengthPhrase(wallpaper.durationSeconds)} without a visible cut`
    )
  }
  const factsSentence = facts.length ? `${facts.join(" ")}.` : ""
  const tagSentence = tags.length ? ` Themes: ${tags.join(", ")}.` : ""
  const detail =
    `${factsSentence}${tagSentence} Preview it above, then set it on your MacBook, iMac, or external display with ${macwall.name}.`.trim()

  const steps = [
    `Download ${macwall.name} for macOS (${macwallMinimumMacOSVersion} or later) and open it.`,
    `Choose Set on Mac on this page, or search "${name}" in the app.`,
    `Pick one display or all of them. ${name} starts playing as your desktop wallpaper.`,
    `Optional: with Pro on ${macwallLockScreenMacOSVersion} or later, also use it on the Lock Screen and as a Screen Saver.`,
  ]

  const faq: ContentFaq[] = [
    {
      question: `How do I set ${name} as my Mac wallpaper?`,
      answer: `Install ${macwall.name}, then choose Set on Mac on this page or search "${name}" in the app. It plays behind your windows as a live desktop wallpaper on any connected display.`,
    },
    {
      question: `Is ${name} a video or a still wallpaper?`,
      answer: `It is a video loop${hasResolution ? ` at ${wallpaper.resolution}` : ""}${hasDuration ? ` that repeats every ${loopLengthPhrase(wallpaper.durationSeconds)}` : ""}, played with hardware decoding so it stays smooth without slowing your Mac.`,
    },
    {
      question: `Will the ${name} live wallpaper drain my MacBook battery?`,
      answer: `${macwall.name} pauses playback on battery power, in full-screen apps, and when the display sleeps, so ${name} costs very little in everyday use.`,
    },
    {
      question: `Can I use ${name} on the Mac Lock Screen?`,
      answer: `Yes, with ${macwall.name} Pro on ${macwallLockScreenMacOSVersion} or later. Pro is a one-time ${macwall.pro.price} payment that unlocks the full catalog, with no subscription.`,
    },
  ]

  const metaDescription = clampDescription(
    `${name}: ${kind.replace(/^an? ?/, "")}${kind === "a" ? "" : " "}live wallpaper for Mac${
      hasDuration
        ? `, looping every ${loopLengthPhrase(wallpaper.durationSeconds)}`
        : ""
    }${tags.length ? ` featuring ${joinList(tags.slice(0, 3))}` : ""}. Preview it and set it on your Mac with ${macwall.name}.`
  )

  return {
    qualityLabel,
    lead,
    detail,
    collections,
    steps,
    faq,
    metaDescription,
  }
}
