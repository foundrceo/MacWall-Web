import { parseResolution } from "@/lib/public-catalog/format"
import { isUuidWallpaperId } from "@/lib/public-catalog/urls"
import {
  displayPageDef,
  displayPageDefs,
  displayPagePath,
  upscaleToCover,
} from "@/lib/seo/display-pages"
import { macDisplays, type MacDisplay } from "@/lib/seo/mac-displays"

/**
 * Wording rules for wallpaper detail pages: titles, the meta description,
 * loop lengths, colours, themes and the "Fits these Macs" table. Pure
 * functions over a wallpaper's own fields, so every rule is unit-tested
 * (tests/wallpaper-detail-copy.test.mjs) without the catalog.
 */

/** Titles longer than this lose the " | MacWall" suffix (never words of the name). */
export const WALLPAPER_TITLE_MAX = 60

/** Meta descriptions are whole clauses up to this length: no ellipsis, ever. */
export const WALLPAPER_DESCRIPTION_MAX = 155

/** Below this a description reads thin, so the trial line is added. */
export const WALLPAPER_DESCRIPTION_MIN = 110

/** "A, B and C" (the site's list style, no serial comma). */
export function joinList(items: readonly string[]): string {
  if (items.length <= 1) return items.join("")
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`
}

/** "a 4K anime live wallpaper", "an anime live wallpaper", "an 8-second loop". */
export function withIndefiniteArticle(phrase: string): string {
  // Spoken "an": vowels, and numbers read "eight…", "eleven", "eighteen"
  // ("an 8K", "an 80-second", "an 18-second"; "a 1080p", "a 110-second").
  const an = /^(?:[aeiou]|8|1[18](?!\d))/i.test(phrase)
  return `${an ? "an" : "a"} ${phrase}`
}

/**
 * Quality from the encoded size, judged on both edges, so a 5760 × 1080
 * triple-wide is 1080p rather than "5K" and 7680 × 4320 is 8K. Slightly
 * cropped 4K encodes (3812 × 2160, 3840 × 1712) still count as 4K.
 */
export function wallpaperQualityLabel(resolution: string): string | null {
  const dims = parseResolution(resolution)
  if (!dims) return null
  const longEdge = Math.max(dims.width, dims.height)
  const shortEdge = Math.min(dims.width, dims.height)
  if (longEdge >= 7600 && shortEdge >= 3200) return "8K"
  if (longEdge >= 5900 && shortEdge >= 3000) return "6K"
  if (longEdge >= 5000 && shortEdge >= 2100) return "5K"
  if ((longEdge >= 3800 && shortEdge >= 1600) || shortEdge >= 2100) return "4K"
  if (shortEdge >= 1400) return "1440p"
  if (shortEdge >= 1000) return "1080p"
  return null
}

/** The quality word a title may carry: 4K and up, never 1080p or 1440p. */
export function titleQualityWord(qualityLabel: string | null): string | null {
  return qualityLabel && /^\dK$/.test(qualityLabel) ? qualityLabel : null
}

/** "3840 × 2160", whatever separator the catalog stored; "" when unknown. */
export function resolutionLabel(resolution: string): string {
  const dims = parseResolution(resolution)
  return dims ? `${dims.width} × ${dims.height}` : ""
}

/**
 * What follows the name in the H1 and the title: " Live Wallpaper for Mac",
 * or " for Mac" when the name already says "wallpaper".
 */
export function wallpaperHeadingSuffix(name: string): string {
  return /\bwallpaper\b/i.test(name) ? " for Mac" : " Live Wallpaper for Mac"
}

/**
 * Document title: "{Name} 4K Live Wallpaper for Mac | MacWall". When that is
 * over 60 characters the brand suffix goes first; the name is never cut.
 */
export function wallpaperTitles(
  name: string,
  qualityLabel: string | null,
  brand: string
): { pageTitle: string; documentTitle: string } {
  const quality = titleQualityWord(qualityLabel)
  const suffix = wallpaperHeadingSuffix(name)
  const pageTitle = `${name}${quality ? ` ${quality}` : ""}${suffix}`
  const branded = `${pageTitle} | ${brand}`
  return {
    pageTitle,
    documentTitle: branded.length <= WALLPAPER_TITLE_MAX ? branded : pageTitle,
  }
}

function loopParts(seconds: number): {
  mins: number
  secs: number
  total: number
} {
  const total = Math.max(0, Math.round(seconds))
  return { mins: Math.floor(total / 60), secs: total % 60, total }
}

/** "12 seconds", "95 seconds", "2 minutes", "4 minutes 13 seconds"; "" when unknown. */
export function loopLengthPhrase(seconds: number): string {
  const { mins, secs, total } = loopParts(seconds)
  if (total === 0) return ""
  const minutes = `${mins} ${mins === 1 ? "minute" : "minutes"}`
  const second = `${secs} ${secs === 1 ? "second" : "seconds"}`
  if (mins > 0 && secs === 0) return minutes
  if (total < 120) return `${total} ${total === 1 ? "second" : "seconds"}`
  return `${minutes} ${second}`
}

/** "12-second", "2-minute", "95-second", "4-minute 13-second"; "" when unknown. */
export function loopLengthAdjective(seconds: number): string {
  const { mins, secs, total } = loopParts(seconds)
  if (total === 0) return ""
  if (mins > 0 && secs === 0) return `${mins}-minute`
  if (total < 120) return `${total}-second`
  return `${mins}-minute ${secs}-second`
}

/** Colours that say nothing about a frame on their own (letterboxing, shadows). */
const NEUTRAL_COLORS: ReadonlySet<string> = new Set([
  "black",
  "charcoal",
  "grey",
  "light grey",
])

/** "deep blue" → "blue", "pale pink" → "pink", "off-white" → "white". */
function colorBase(name: string): string {
  return name.replace(/^(?:deep|pale|light|off-) ?/, "")
}

/**
 * Up to `max` colour names worth quoting, most common first: black, charcoal
 * and grey only when the palette has nothing else, and never two shades of
 * one hue ("purple and deep purple").
 */
export function distinctiveColorNames(
  names: readonly string[],
  max = 2
): string[] {
  const vivid = names.filter((name) => !NEUTRAL_COLORS.has(name))
  const pool = vivid.length > 0 ? vivid : names
  const bases = new Set<string>()
  const out: string[] = []
  for (const name of pool) {
    const base = colorBase(name)
    if (bases.has(base)) continue
    bases.add(base)
    out.push(name)
    if (out.length >= max) break
  }
  return out
}

function words(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
}

/** Every word of the tag is already in the name ("gojo" on "Gojo Domain"). */
export function isNameEchoTag(tag: string, name: string): boolean {
  const tagWords = words(tag)
  if (tagWords.length === 0) return false
  const nameWords = new Set(words(name))
  return tagWords.every((word) => nameWords.has(word))
}

/**
 * A tag left over from the wallpaper's name before a rename. Slug ids are
 * the import name ("golden-anime-hero"), so a tag made only of id words that
 * the current name ("Super Saiyan Trunks Graffiti") no longer has describes
 * the old name. UUID ids carry no name, so nothing is flagged for them.
 */
export function isRenameLeftoverTag(
  tag: string,
  wallpaper: { id: string; name: string }
): boolean {
  if (isUuidWallpaperId(wallpaper.id)) return false
  const tagWords = words(tag)
  if (tagWords.length === 0) return false
  const idWords = new Set(words(wallpaper.id))
  const nameWords = new Set(words(wallpaper.name))
  return (
    tagWords.every((word) => idWords.has(word)) &&
    tagWords.some((word) => !nameWords.has(word))
  )
}

/** Calls to action, longest first; the longest that still fits is used. */
function descriptionCallsToAction(brand: string): string[] {
  return [
    ` Preview it free, then set it as your desktop with ${brand}.`,
    ` Preview it free, then set it with ${brand}.`,
    ` Set it on your Mac with ${brand}.`,
  ]
}

/**
 * Meta description in whole clauses, at most 155 characters, never cut:
 * "{Name}: a 4K anime live wallpaper for Mac that loops every 12 seconds, in
 * blue and purple tones. Preview it free, then set it with MacWall." The
 * loop length comes first, then colours and themes while the shortest call
 * to action still fits after them, then the longest call to action that does.
 */
export function wallpaperMetaDescription(input: {
  name: string
  qualityLabel: string | null
  /** Category as an adjective ("anime", "car"); "" for the catch-all. */
  categoryLabel: string
  durationSeconds: number
  /** Measured colour names, most common first. */
  colorNames: readonly string[]
  /** Themes that aren't already in the name. */
  themes: readonly string[]
  brand: string
}): string {
  const kind = [input.qualityLabel, input.categoryLabel || null]
    .filter(Boolean)
    .join(" ")
  const core = `${input.name}: ${withIndefiniteArticle(
    `${kind ? `${kind} ` : ""}live wallpaper`
  )} for Mac`
  const loop = loopLengthPhrase(input.durationSeconds)
  const colors = distinctiveColorNames(input.colorNames)
  const themes = input.themes.slice(0, 2)
  const ctas = descriptionCallsToAction(input.brand)

  const clauses = [core]
  const compose = (parts: readonly string[], ending: string) =>
    `${parts.join("")}.${ending}`
  const fits = (parts: readonly string[], ending: string) =>
    compose(parts, ending).length <= WALLPAPER_DESCRIPTION_MAX
  const tryClause = (clause: string, ending = "") => {
    if (fits([...clauses, clause], ending)) {
      clauses.push(clause)
      return true
    }
    return false
  }

  if (loop) tryClause(` that loops every ${loop}`)
  // Colours and themes only while a call to action still fits after them
  // (unless none fitted to begin with).
  const shortestCta = ctas[ctas.length - 1]
  const ending = () => (fits(clauses, shortestCta) ? shortestCta : "")
  if (colors.length) tryClause(`, in ${joinList(colors)} tones`, ending())
  const themeEnding = ending()
  for (const count of [2, 1]) {
    if (themes.length < count) continue
    if (
      tryClause(`, featuring ${joinList(themes.slice(0, count))}`, themeEnding)
    )
      break
  }
  const cta = ctas.find((ending) => fits(clauses, ending)) ?? ""
  const text = compose(clauses, cta)
  // A loop with no known length or colours leaves a short line.
  const trial = `${text} ${input.brand} starts with a free 24-hour trial.`
  return text.length < WALLPAPER_DESCRIPTION_MIN &&
    trial.length <= WALLPAPER_DESCRIPTION_MAX
    ? trial
    : text
}

/** How much a loop is enlarged to cover a screen before it counts as upscaled. */
const NEAR_NATIVE_UPSCALE = 1.05

export type MacFitRow = {
  display: MacDisplay
  /** Enlargement needed to cover the screen; 1 or less is none. */
  scale: number
  /** Covers the screen at native resolution or within 5% of it. */
  fits: boolean
  /** Whole percent of enlargement, 0 when none. */
  upscalePercent: number
  /** The display's wallpaper page, when there is one. */
  href: string | null
}

function displayPageHref(display: MacDisplay): string | null {
  const def = displayPageDefs.find((entry) =>
    entry.displayIds.includes(display.id)
  )
  return def ? displayPagePath(def.slug) : null
}

/**
 * How a loop covers each current Apple screen (Apple's specs, via
 * lib/seo/mac-displays.ts), one row per distinct resolution. Empty when the
 * resolution is unknown.
 */
export function macFitRows(resolution: string): MacFitRow[] {
  const seen = new Set<string>()
  const rows: MacFitRow[] = []
  for (const display of macDisplays) {
    if (!display.current) continue
    const key = `${display.width}x${display.height}`
    if (seen.has(key)) continue
    seen.add(key)
    const scale = upscaleToCover({ resolution }, display)
    if (scale === null) return []
    rows.push({
      display,
      scale,
      fits: scale <= NEAR_NATIVE_UPSCALE,
      upscalePercent: Math.max(0, Math.round((scale - 1) * 100)),
      href: displayPageHref(display),
    })
  }
  return rows
}

/** "Native", "Near native, 3% upscaled", "Upscaled 33%". */
export function macFitLabel(row: MacFitRow): string {
  if (row.upscalePercent === 0) return "Native"
  if (row.fits) return `Near native, ${row.upscalePercent}% upscaled`
  return `Upscaled ${row.upscalePercent}%`
}

function isMacBook(display: MacDisplay): boolean {
  return display.family !== "imac" && display.family !== "apple-display"
}

/**
 * "every current MacBook and the iMac 24″", "the MacBook Air 13″, MacBook
 * Air 15″ and MacBook Neo": every MacBook collapses into one phrase.
 */
function screenList(rows: readonly MacFitRow[], all: readonly MacFitRow[]) {
  const macbooks = all.filter((row) => isMacBook(row.display))
  const everyMacBook =
    macbooks.length > 1 && macbooks.every((row) => rows.includes(row))
  const names = rows
    .filter((row) => !(everyMacBook && isMacBook(row.display)))
    .map((row, index) =>
      index === 0 ? `the ${row.display.shortName}` : row.display.shortName
    )
  return joinList(everyMacBook ? ["every current MacBook", ...names] : names)
}

/**
 * One sentence on how the loop fits current Macs, from the same rows as the
 * table: "At 3840 × 2160 it fills every current MacBook at or within 5% of
 * native resolution; on the iMac 24″ and Studio Display it is upscaled by up
 * to 33%."
 */
export function macFitSummary(
  rows: readonly MacFitRow[],
  resolution: string,
  /** How the sentence opens; "At that size" right after the size is given. */
  opening?: string
): string | null {
  const size = resolutionLabel(resolution)
  if (rows.length === 0 || !size) return null
  const at = opening ?? `At ${size}`
  const fitting = rows.filter((row) => row.fits)
  const upscaled = rows.filter((row) => !row.fits)
  const native = fitting.some((row) => row.upscalePercent > 0)
    ? "at or within 5% of native resolution"
    : "at native resolution"
  if (upscaled.length === 0) {
    return `${at} it fills every current Mac screen ${native}.`
  }
  const percents = upscaled.map((row) => row.upscalePercent)
  const max = Math.max(...percents)
  if (fitting.length === 0) {
    const min = Math.min(...percents)
    return `${at} it is upscaled on every current Mac screen, by ${
      min === max ? `${max}%` : `${min}% to ${max}%`
    }.`
  }
  const enlarged =
    upscaled.length === 1
      ? `it is upscaled ${max}%`
      : `it is upscaled by up to ${max}%`
  // Three or more upscaled screens read better as "every other current Mac".
  const others =
    upscaled.length >= 3
      ? "every other current Mac"
      : screenList(upscaled, rows)
  return `${at} it fills ${screenList(fitting, rows)} ${native}; on ${others} ${enlarged}.`
}

/**
 * The display page that suits the loop best: ultrawide or 4K by shape and
 * size, otherwise the Mac it covers with the least upscaling.
 */
export function matchingDisplayPage(
  resolution: string,
  rows: readonly MacFitRow[]
): { href: string; label: string } | null {
  const dims = parseResolution(resolution)
  if (!dims) return null
  const longEdge = Math.max(dims.width, dims.height)
  const shortEdge = Math.min(dims.width, dims.height)
  // Same shape and size rules as the ultrawide and 4K display pages.
  const generic =
    longEdge / shortEdge >= 2.3
      ? "ultrawide"
      : longEdge >= 3840 && shortEdge >= 2160
        ? "4k"
        : null
  if (generic) {
    const def = displayPageDef(generic)
    if (def)
      return {
        href: displayPagePath(def.slug),
        label: `${def.label} live wallpapers`,
      }
  }
  const best = [...rows]
    .filter((row) => row.href)
    .sort((a, b) => a.scale - b.scale || b.display.width - a.display.width)[0]
  if (!best?.href) return null
  const slug = best.href.split("/").pop() ?? ""
  const def = displayPageDef(slug)
  return def ? { href: best.href, label: `${def.label} live wallpapers` } : null
}
