import type { ContentFaq } from "@/lib/content/types"
import {
  macwall,
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersion,
} from "@/lib/macwall-site"
import {
  isCommunitySubmission,
  wallpaperNamedAuthor,
} from "@/lib/public-catalog/attribution"
import { aspectRatioLabel } from "@/lib/public-catalog/format"
import type { PublicWallpaper } from "@/lib/public-catalog/types"
import { wallpaperCategoryAltLabel } from "@/lib/public-catalog/wallpaper-alt"
import {
  collectionsForWallpaper,
  wallpaperCollections,
  type WallpaperCollection,
} from "@/lib/seo/wallpaper-collections"
import {
  isNameEchoTag,
  isRenameLeftoverTag,
  loopLengthAdjective,
  loopLengthPhrase,
  macFitRows,
  macFitSummary,
  matchingDisplayPage,
  resolutionLabel,
  wallpaperHeadingSuffix,
  wallpaperMetaDescription,
  wallpaperQualityLabel,
  wallpaperTitles,
  withIndefiniteArticle,
  type MacFitRow,
} from "@/lib/seo/wallpaper-detail-copy"
import {
  wallpaperColors,
  type WallpaperColor,
} from "@/lib/seo/wallpaper-palette"

export { wallpaperQualityLabel }

/**
 * Per-wallpaper copy for detail pages, metadata, and structured data.
 *
 * Everything is derived from the wallpaper's own fields (resolution, length,
 * tags, category, collections, measured colours), so each page carries facts
 * no other page has: how the loop fits each current Mac, its colours and its
 * collections. The wording rules live in wallpaper-detail-copy.ts.
 */

export type WallpaperDetailLink = { href: string; label: string }

export type WallpaperDetailTag = {
  /** Lowercase tag as stored ("spider man"). */
  label: string
  /** How copy shows it: proper names keep their casing ("Spider-Man"). */
  display: string
  /** The name already says it ("gojo" on "Gojo Domain"). */
  echo: boolean
}

export type WallpaperDetailContent = {
  /** "8K", "4K", "1440p", "1080p", or null when unknown. */
  qualityLabel: string | null
  /** H1: "{Name} Live Wallpaper for Mac". */
  heading: string
  /** What follows the name in the H1, shown muted. */
  headingSuffix: string
  /** Muted line under the H1: quality, loop length, a named author only. */
  metaLine: string[]
  lead: string
  /** Encoded size, loop length and how it fits current Macs; may be empty. */
  detail: string
  /** Lead and detail, untruncated: the description for structured data. */
  summary: string
  /** Collections the wallpaper is in, topics named in its title first. */
  collections: WallpaperCollection[]
  /** Colours measured from the poster, most common first. */
  colors: WallpaperColor[]
  /** Tag chips: display tags without leftovers from a rename. */
  tags: WallpaperDetailTag[]
  /** "3840 × 2160", or "" when unknown. */
  resolutionLabel: string
  /** "Fits these Macs" rows; empty when the resolution is unknown. */
  fits: MacFitRow[]
  fitSummary: string | null
  setup: { intro: string; links: WallpaperDetailLink[] }
  faq: ContentFaq[]
  metaDescription: string
  /** Title without the brand suffix. */
  pageTitle: string
  /** `<title>`: with " | MacWall" when it fits in 60 characters. */
  documentTitle: string
  /**
   * Nothing on the page beyond the template: no themes and no collection.
   * These stay out of the index and the sitemap until they get tags, so a
   * thousand near-identical pages don't read as scaled content.
   */
  thin: boolean
}

/** Human tag list: dedupes case variants and drops the generic ones. */
export function displayTags(
  wallpaper: Pick<PublicWallpaper, "tags" | "category">,
  limit = 6
): string[] {
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

/** No themes and no collection: nothing on the page beyond the template. */
export function isThinWallpaper(
  wallpaper: Pick<PublicWallpaper, "name" | "tags" | "category">
): boolean {
  return (
    displayTags(wallpaper).length === 0 &&
    collectionsForWallpaper(wallpaper).length === 0
  )
}

/** Tags without the ones a rename left behind (see `isRenameLeftoverTag`). */
export function currentWallpaperTags(
  wallpaper: Pick<PublicWallpaper, "id" | "name" | "tags">
): string[] {
  return wallpaper.tags.filter((tag) => !isRenameLeftoverTag(tag, wallpaper))
}

/** Tag or name as a lookup key: "Spider-Man" and "spider man" match. */
function themeKey(text: string): string {
  return text.toLowerCase().replace(/-/g, " ").trim()
}

/**
 * Proper names keep their casing in copy ("bmw" reads as "BMW", "naruto" as
 * "Naruto"): a collection about a franchise or brand, or one whose name has
 * capitals inside it. Generic topics ("rain", "football") stay lowercase.
 * `rights` is read defensively; collections without it use the capitals rule.
 */
const properThemeNames = new Map(
  wallpaperCollections.flatMap((entry) => {
    const rights = (entry as { rights?: string }).rights
    const proper =
      rights === "franchise" ||
      rights === "trademark" ||
      /[A-Z0-9]/.test(entry.name.slice(1))
    return proper ? [[themeKey(entry.name), entry.name] as const] : []
  })
)

function themeLabel(tag: string): string {
  return properThemeNames.get(themeKey(tag)) ?? tag
}

const SETUP_GUIDE: WallpaperDetailLink = {
  href: "/blog/how-to-set-live-wallpaper-mac",
  label: "How to set a live wallpaper on Mac",
}
const LOCK_SCREEN_GUIDE: WallpaperDetailLink = {
  href: "/blog/how-to-change-lock-screen-on-mac",
  label: "How to change the Lock Screen on Mac",
}
const BATTERY_DOC: WallpaperDetailLink = {
  href: "/docs/performance-and-battery",
  label: "Performance and battery settings",
}
const COMPARE_APPS: WallpaperDetailLink = {
  href: "/best-live-wallpaper-mac",
  label: "The best live wallpaper apps for Mac",
}

export function buildWallpaperDetailContent(
  wallpaper: PublicWallpaper
): WallpaperDetailContent {
  const name = wallpaper.name
  const qualityLabel = wallpaperQualityLabel(wallpaper.resolution)
  const categoryLabel = wallpaperCategoryAltLabel(wallpaper.category)
  const size = resolutionLabel(wallpaper.resolution)
  // Only a named ratio ("16:9", "21:9"); an odd size has none worth quoting.
  const ratio = aspectRatioLabel(wallpaper.resolution)
  const aspect = ratio && /^\d{1,2}:\d{1,2}$/.test(ratio) ? ratio : null
  const loop = loopLengthPhrase(wallpaper.durationSeconds)
  const loopAdjective = loopLengthAdjective(wallpaper.durationSeconds)
  const namedAuthor = wallpaperNamedAuthor(wallpaper)

  const tagsNow = currentWallpaperTags(wallpaper)
  const collections = collectionsForWallpaper({ name, tags: tagsNow })
  const primaryCollection = collections[0]
  const tags = displayTags(
    { tags: tagsNow, category: wallpaper.category },
    12
  ).map((label) => ({
    label,
    display: themeLabel(label),
    echo: isNameEchoTag(label, name),
  }))
  const themes = tags.filter((tag) => !tag.echo).map((tag) => tag.display)
  const colors = wallpaperColors(wallpaper.id)

  const headingSuffix = wallpaperHeadingSuffix(name)
  const metaLine = [
    qualityLabel,
    loopAdjective ? `${loopAdjective} loop` : null,
    namedAuthor ? `by ${namedAuthor}` : null,
  ].filter((part): part is string => Boolean(part))

  // An unnamed community submission is described, never credited to
  // "Community"; MacWall's own loops say so.
  const kindWords = [
    isCommunitySubmission(wallpaper) && !namedAuthor
      ? "community-submitted"
      : null,
    qualityLabel,
    categoryLabel || null,
  ]
    .filter(Boolean)
    .join(" ")
  const kind = withIndefiniteArticle(
    `${kindWords ? `${kindWords} ` : ""}live wallpaper`
  )
  const credit = namedAuthor
    ? ` by ${namedAuthor}`
    : wallpaper.originType === "macwall_original"
      ? ` made by ${macwall.name}`
      : ""
  const lead = `${name} is ${kind} for Mac${credit}${
    primaryCollection
      ? `, part of the ${primaryCollection.name} collection`
      : ""
  }.`

  const fits = macFitRows(wallpaper.resolution)
  const fitSummary = macFitSummary(
    fits,
    wallpaper.resolution,
    size ? "At that size" : undefined
  )
  const facts = size
    ? `It is encoded at ${size}${aspect ? ` (${aspect})` : ""}${
        loop ? ` and loops every ${loop}` : ""
      }.`
    : loop
      ? `It loops every ${loop}.`
      : ""
  const detail = [facts, fitSummary].filter(Boolean).join(" ")

  const displayPage = matchingDisplayPage(wallpaper.resolution, fits)
  const setup = {
    intro: `Set on Mac opens ${name} in ${macwall.name} (${macwallMinimumMacOSVersion} or later); click Set Wallpaper there to put it on your desktop. These guides cover the rest.`,
    links: [
      SETUP_GUIDE,
      LOCK_SCREEN_GUIDE,
      ...(displayPage ? [displayPage] : []),
      BATTERY_DOC,
      COMPARE_APPS,
    ],
  }

  // Two questions with answers specific to this loop. No price (it changes
  // with sales and region) and no battery promise (the docs cover settings).
  const faq: ContentFaq[] = [
    {
      question: `How do I set ${name} as my Mac wallpaper?`,
      answer: `Download ${macwall.name} for ${macwallMinimumMacOSVersion} or later, choose Set on Mac on this page or search "${name}" in the app, then click Set Wallpaper. On ${macwallLockScreenMacOSVersion} or later it can also play on the Lock Screen and as the screen saver.`,
    },
    {
      question: `Is ${name} a video or a still wallpaper?`,
      answer: `A video. ${name} is ${withIndefiniteArticle(
        loopAdjective ? `${loopAdjective} loop` : "video loop"
      )}${size ? ` encoded at ${size}` : ""}, and ${macwall.name} plays it behind your windows as a moving desktop rather than a still image.`,
    },
  ]

  const { pageTitle, documentTitle } = wallpaperTitles(
    name,
    qualityLabel,
    macwall.name
  )

  return {
    qualityLabel,
    heading: `${name}${headingSuffix}`,
    headingSuffix,
    metaLine,
    lead,
    detail,
    summary: [lead, detail].filter(Boolean).join(" "),
    collections,
    colors,
    tags,
    resolutionLabel: size,
    fits,
    fitSummary,
    setup,
    faq,
    metaDescription: wallpaperMetaDescription({
      name,
      qualityLabel,
      categoryLabel,
      durationSeconds: wallpaper.durationSeconds,
      colorNames: colors.map((color) => color.name),
      themes,
      brand: macwall.name,
    }),
    pageTitle,
    documentTitle,
    thin: isThinWallpaper(wallpaper),
  }
}
