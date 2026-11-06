import type { PublicWallpaper } from "@/lib/public-catalog/types"

/**
 * "More like this" ranking for wallpaper detail pages.
 *
 * The rail is the main detail-to-detail link on the site, so it decides which
 * pages crawlers reach and how often. Ranking by likes alone sent every page
 * in a category to the same six favourites. Instead each candidate is scored
 * on what it shares with the current wallpaper, ties are broken by a hash of
 * the pair (stable for one page, different for the next), and a category's
 * most-liked wallpapers share a single slot.
 */

/** Rail length on detail pages: four rows of the three-column grid. */
export const SIMILAR_WALLPAPER_LIMIT = 12

/** A category's most-liked wallpapers already get links from its first page. */
const POPULAR_PER_CATEGORY = 10
/** How many of those may appear in one rail. */
const POPULAR_SLOTS = 1

const SHARED_COLLECTION_SCORE = 3
const SHARED_TAG_SCORE = 2
const NEAR_PALETTE_SCORE = 1
const SAME_CATEGORY_SCORE = 1

/**
 * Two swatches closer than this ("redmean" RGB distance, 0 to about 765) read
 * as the same colour. Measured on the catalog's palettes, about one random
 * pair in nine is this close, so a palette match is a hint, not a topic.
 */
const NEAR_PALETTE_DISTANCE = 48

/** What the ranking knows about a wallpaper beyond its own fields. */
export type SimilarSignals = {
  /** Slugs of the topic collections the wallpaper belongs to. */
  collections: (wallpaper: PublicWallpaper) => readonly string[]
  /** Descriptive tags, lowercased, generic ones dropped. */
  tags: (wallpaper: PublicWallpaper) => readonly string[]
  /** Measured palette as hex values, most common first; empty when unmeasured. */
  palette: (wallpaper: PublicWallpaper) => readonly string[]
  /** Never linked from the rail, e.g. pages served `noindex`. */
  excluded: (wallpaper: PublicWallpaper) => boolean
}

type Profile = {
  collections: ReadonlySet<string>
  tags: ReadonlySet<string>
  swatches: readonly Rgb[]
}

type Rgb = readonly [number, number, number]

function hexToRgb(hex: string): Rgb | null {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return null
  const n = Number.parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Weighted ("redmean") RGB distance, closer to perceived difference. */
function colorDistance(a: Rgb, b: Rgb): number {
  const meanRed = (a[0] + b[0]) / 2
  const dr = a[0] - b[0]
  const dg = a[1] - b[1]
  const db = a[2] - b[2]
  return Math.sqrt(
    (2 + meanRed / 256) * dr * dr +
      4 * dg * dg +
      (2 + (255 - meanRed) / 256) * db * db
  )
}

/** Black or charcoal (the `colorName` thresholds): often letterbox bars. */
function isNearBlack([r, g, b]: Rgb): boolean {
  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  const lightness = (max + min) / 2
  if (lightness < 0.1) return true
  const spread = max - min
  const saturation =
    spread === 0 ? 0 : spread / (1 - Math.abs(2 * lightness - 1))
  return saturation < 0.15 && lightness <= 0.35
}

/**
 * The swatches that describe the frame: the first two after near-black
 * letterbox swatches are dropped (one when the frame leads with two dark
 * swatches, so it reads as mostly dark), or the most common swatch of a
 * frame that is dark throughout.
 */
function paletteSwatches(hexes: readonly string[]): Rgb[] {
  const swatches = hexes.flatMap((hex) => {
    const rgb = hexToRgb(hex)
    return rgb ? [rgb] : []
  })
  const mostlyDark =
    swatches.length > 1 && isNearBlack(swatches[0]) && isNearBlack(swatches[1])
  const colours = swatches.filter((rgb) => !isNearBlack(rgb))
  if (colours.length === 0) return swatches.slice(0, 1)
  return colours.slice(0, mostlyDark ? 1 : 2)
}

function profileOf(
  wallpaper: PublicWallpaper,
  signals: SimilarSignals
): Profile {
  return {
    collections: new Set(signals.collections(wallpaper)),
    tags: new Set(signals.tags(wallpaper)),
    swatches: paletteSwatches(signals.palette(wallpaper)),
  }
}

function sharesAny(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  const [small, large] = a.size <= b.size ? [a, b] : [b, a]
  for (const value of small) if (large.has(value)) return true
  return false
}

function nearPalette(a: readonly Rgb[], b: readonly Rgb[]): boolean {
  return a.some((x) =>
    b.some((y) => colorDistance(x, y) < NEAR_PALETTE_DISTANCE)
  )
}

/** 32-bit FNV-1a of the ordered pair: a fixed but page-specific tie order. */
export function similarPairHash(
  currentId: string,
  candidateId: string
): number {
  let hash = 0x811c9dc5
  const text = `${currentId}\u0000${candidateId}`
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/** Ids of each category's most-liked eligible wallpapers. */
function popularIds(
  catalog: readonly PublicWallpaper[],
  isEligible: (wallpaper: PublicWallpaper) => boolean
): Set<string> {
  const byCategory = new Map<string, PublicWallpaper[]>()
  for (const wallpaper of catalog) {
    if (!isEligible(wallpaper)) continue
    const list = byCategory.get(wallpaper.category)
    if (list) list.push(wallpaper)
    else byCategory.set(wallpaper.category, [wallpaper])
  }
  const ids = new Set<string>()
  for (const list of byCategory.values()) {
    list
      .sort(
        (a, b) =>
          b.likeCount - a.likeCount || b.createdAt.localeCompare(a.createdAt)
      )
      .slice(0, POPULAR_PER_CATEGORY)
      .forEach((wallpaper) => ids.add(wallpaper.id))
  }
  return ids
}

/**
 * Up to `limit` wallpapers like `current`, best match first.
 *
 * Score: shared collection +3, same category +1, and, for a wallpaper related
 * by either, shared descriptive tag +2 and near palette +1. Equal scores are
 * ordered by `similarPairHash`, so pages in the same category show different
 * sets instead of one shared top list. Excluded wallpapers never appear, and
 * at most one of the categories' most-liked wallpapers does unless nothing
 * else is left to fill the rail.
 */
export function rankSimilarWallpapers(
  current: PublicWallpaper,
  catalog: readonly PublicWallpaper[],
  signals: SimilarSignals,
  limit = SIMILAR_WALLPAPER_LIMIT
): PublicWallpaper[] {
  const safeLimit = Number.isFinite(limit)
    ? Math.min(24, Math.max(1, Math.floor(limit)))
    : SIMILAR_WALLPAPER_LIMIT

  const excludedIds = new Set<string>()
  for (const wallpaper of catalog) {
    if (signals.excluded(wallpaper)) excludedIds.add(wallpaper.id)
  }
  const isEligible = (wallpaper: PublicWallpaper) =>
    wallpaper.id !== current.id && !excludedIds.has(wallpaper.id)

  const own = profileOf(current, signals)
  const seen = new Set<string>()
  const scored: { wallpaper: PublicWallpaper; score: number; tie: number }[] =
    []
  for (const candidate of catalog) {
    if (!isEligible(candidate) || seen.has(candidate.id)) continue
    seen.add(candidate.id)
    const other = profileOf(candidate, signals)
    const sameCategory = candidate.category === current.category
    const sharedCollection = sharesAny(own.collections, other.collections)
    let score = 0
    if (sharedCollection) score += SHARED_COLLECTION_SCORE
    if (sameCategory) score += SAME_CATEGORY_SCORE
    // Catalog tags are mostly title words ("night", "crimson"), so across
    // categories they match unrelated scenes. Tags and colours only refine
    // the order among wallpapers already related by category or collection.
    if (sameCategory || sharedCollection) {
      if (sharesAny(own.tags, other.tags)) score += SHARED_TAG_SCORE
      if (nearPalette(own.swatches, other.swatches)) score += NEAR_PALETTE_SCORE
    }
    scored.push({
      wallpaper: candidate,
      score,
      tie: similarPairHash(current.id, candidate.id),
    })
  }
  scored.sort((a, b) => b.score - a.score || a.tie - b.tie)

  const popular = popularIds(
    catalog,
    (wallpaper) => !excludedIds.has(wallpaper.id)
  )
  const picked: PublicWallpaper[] = []
  const held: PublicWallpaper[] = []
  let popularUsed = 0
  for (const { wallpaper } of scored) {
    if (picked.length >= safeLimit) break
    if (popular.has(wallpaper.id)) {
      if (popularUsed >= POPULAR_SLOTS) {
        held.push(wallpaper)
        continue
      }
      popularUsed += 1
    }
    picked.push(wallpaper)
  }
  // A catalog too small to fill the rail otherwise gets the held-back
  // favourites, best match first, rather than a short rail.
  return [...picked, ...held].slice(0, safeLimit)
}
