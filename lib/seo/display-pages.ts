import type {
  ContentBlock,
  ContentFaq,
  SeoContentPage,
} from "@/lib/content/types"
import {
  macwall,
  macwallBatteryPolicy,
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersion,
} from "@/lib/macwall-site"
import { parseResolution } from "@/lib/public-catalog/format"
import type { PublicWallpaper } from "@/lib/public-catalog/types"
import { GALLERY_PAGE_SIZE, galleryPageCount } from "@/lib/seo/gallery-pages"
import {
  accessedLabel,
  DISPLAY_PAGES_PATH,
  displayAspectLabel,
  displayPagePathFor,
  displayResolutionLabel,
  MAC_DISPLAY_SPECS_ACCESSED,
  macDisplayById,
  macDisplayPagePath,
  macDisplaySources,
  macDisplays,
  sixteenNineCropPercent,
  type DisplayPageSlug,
  type MacDisplay,
} from "@/lib/seo/mac-displays"

/**
 * Wallpapers picked per Mac display by resolution, the /wallpapers/display
 * index, and the /wallpapers/macbook hub. A loop "fits" a screen when it
 * covers it at native resolution with at most 5% upscaling, measured from the
 * catalog's encoded resolution. Every number on these pages is either from
 * Apple's specs (lib/seo/mac-displays.ts) or counted from the live catalog.
 *
 * Almost every 4K loop fits every MacBook, so "most-liked fits first" would
 * give the MacBook pages one grid. Instead each model page leads with the
 * loops encoded at its exact or native size, then mixes the most-liked fits
 * in an order seeded by its slug, and `planGrids` keeps any two pages to at
 * most half of their first 24 wallpapers in common. The 4K, ultrawide and
 * MacBook pages list every match over numbered pages.
 */
export { DISPLAY_PAGES_PATH }

const MAX_UPSCALE = 1.05
/** Wallpapers per grid and per numbered page; the gallery's page size. */
export const DISPLAY_GRID_LIMIT = GALLERY_PAGE_SIZE
/** Most first-page wallpapers two display pages may share (half the grid). */
export const DISPLAY_GRID_MAX_SHARED = Math.floor(DISPLAY_GRID_LIMIT / 2)
/** Seeded orders shuffle within runs this long, so popular loops stay near the top. */
const SHUFFLE_BAND = 96

export const MACBOOK_HUB_PATH = "/wallpapers/macbook"

export type DisplayPageDef = {
  slug: DisplayPageSlug
  /** Page title without the brand suffix. */
  title: string
  /** H1, cased as written ("iMac"), never re-capitalised. */
  headline: string
  /** Short name for breadcrumbs, chips and link lists: "MacBook Air", "4K". */
  label: string
  description: string
  keywords: string[]
  /** Apple displays covered, smallest first. Empty for generic pages. */
  displayIds: string[]
  /** The display the grid is picked for; defaults to the last one. */
  targetId?: string
  /** Generic pages (ultrawide, 4K) pick by shape or size instead of a model. */
  match?: "ultrawide" | "uhd"
  /**
   * Lists every match, most-liked first, over numbered pages
   * (`/page/{n}`) instead of one picked grid.
   */
  paginate?: boolean
  /** Title stem for the numbered pages: "{pageLabel}, Page 2". */
  pageLabel?: string
}

/** Apple displays on a page, smallest first (from `MacDisplay.page`). */
function displayIdsOn(slug: DisplayPageSlug): string[] {
  return macDisplays
    .filter((display) => display.page === slug)
    .sort((a, b) => a.width * a.height - b.width * b.height)
    .map((display) => display.id)
}

export const displayPageDefs: readonly DisplayPageDef[] = [
  {
    slug: "macbook-air",
    title: "MacBook Air Wallpapers: Live, 4K, 13 and 15-inch",
    headline: "MacBook Air wallpapers, live and in 4K",
    label: "MacBook Air",
    description:
      "Live 4K wallpapers for MacBook Air 13 and 15-inch, picked to fill the 2560 × 1664 or 2880 × 1864 screen at native resolution. Preview every loop free.",
    keywords: [
      "macbook air wallpaper",
      "macbook air wallpaper 4k",
      "macbook air live wallpaper",
      "macbook air 13 wallpaper",
      "macbook air 15 wallpaper",
    ],
    displayIds: displayIdsOn("macbook-air"),
  },
  {
    slug: "macbook-pro",
    title: "MacBook Pro Wallpapers (4K, Live)",
    headline: "MacBook Pro wallpapers, live and in 4K",
    label: "MacBook Pro",
    description:
      "Live 4K wallpapers for MacBook Pro 14 and 16-inch, led by loops that cover the 3456 × 2234 screen without upscaling. Preview every loop free.",
    keywords: [
      "macbook pro wallpaper",
      "macbook pro wallpaper 4k",
      "macbook pro 14 wallpaper",
      "macbook pro 16 wallpaper",
      "macbook pro live wallpaper",
    ],
    displayIds: displayIdsOn("macbook-pro"),
  },
  {
    slug: "macbook-neo",
    title: "MacBook Neo Wallpapers: Live 4K Loops That Fit",
    headline: "MacBook Neo wallpapers, live and in 4K",
    label: "MacBook Neo",
    description:
      "Live wallpapers for the 13-inch MacBook Neo, picked by resolution to fill its 2408 × 1506 screen. Preview every 4K loop free, then set it with MacWall.",
    keywords: [
      "macbook neo wallpaper",
      "wallpaper for macbook neo",
      "macbook neo wallpaper size",
      "macbook neo live wallpaper",
    ],
    displayIds: displayIdsOn("macbook-neo"),
  },
  {
    slug: "imac",
    title: "iMac 24-inch Live Wallpapers in 4.5K and 4K",
    headline: "iMac 24-inch live wallpapers",
    label: "iMac 24-inch",
    description:
      "Live wallpapers for the 24-inch iMac and its 4480 × 2520 Retina display, sorted by how sharp they look at native resolution. Preview each loop free.",
    keywords: [
      "imac wallpaper",
      "imac 24 wallpaper",
      "imac live wallpaper",
      "4.5k wallpaper",
    ],
    displayIds: displayIdsOn("imac"),
  },
  {
    slug: "studio-display",
    title: "4K and 5K Wallpapers for Mac and Studio Display",
    headline: "5K and 4K live wallpapers for Studio Display",
    label: "Studio Display",
    description:
      "Live wallpapers for Apple Studio Display, Studio Display XDR and Pro Display XDR, sorted by how close they come to 5K and 6K. Preview each loop free.",
    keywords: [
      "studio display wallpaper",
      "5k wallpaper",
      "5k wallpaper mac",
      "5120x2880 wallpaper",
      "pro display xdr wallpaper",
      "6k wallpaper",
    ],
    displayIds: displayIdsOn("studio-display"),
    targetId: "studio-display",
  },
  {
    slug: "ultrawide",
    title: "Ultrawide Mac Wallpapers: 3440x1440 and 5120x1440",
    headline: "Ultrawide live wallpapers for Mac: 3440 × 1440 and 5120 × 1440",
    label: "Ultrawide",
    description:
      "Live wallpapers for 21:9 and 32:9 ultrawide monitors on a Mac, including 3440 × 1440 and 5120 × 1440 loops. Preview each one free, then set it with MacWall.",
    keywords: [
      "3440x1440 wallpaper",
      "5120x1440 wallpaper",
      "ultrawide wallpaper",
      "ultrawide live wallpaper",
      "21:9 wallpaper",
      "32:9 wallpaper",
    ],
    displayIds: [],
    match: "ultrawide",
    paginate: true,
    pageLabel: "Ultrawide Wallpapers for Mac",
  },
  {
    slug: "4k",
    title: "4K Wallpapers for Mac: Live Loops in 4K and Up",
    headline: "Every 4K live wallpaper for Mac",
    label: "4K",
    description:
      "Every live wallpaper in the MacWall catalog encoded at 3840 × 2160 or larger, most-liked first: enough to fill any MacBook screen. Preview each loop free.",
    keywords: [
      "4k wallpaper mac",
      "mac wallpaper 4k",
      "mac wallpapers 4k",
      "4k live wallpaper mac",
      "3840x2160 wallpaper",
    ],
    displayIds: [],
    match: "uhd",
    paginate: true,
    pageLabel: "4K Wallpapers for Mac",
  },
]

/** The /wallpapers/macbook hub: every MacBook, one paginated 4K grid. */
export const macbookHubDef = {
  slug: "macbook",
  pathname: MACBOOK_HUB_PATH,
  title: "MacBook Wallpapers: Live 4K for Air, Pro and Neo",
  headline: "MacBook wallpapers: live 4K loops for every model",
  label: "MacBook",
  description:
    "MacBook wallpapers that move: 4K live loops that fill every current MacBook Air, MacBook Pro and MacBook Neo screen, with each model's size. Preview free.",
  keywords: [
    "macbook wallpaper",
    "macbook wallpapers",
    "macbook wallpaper 4k",
    "wallpaper for macbook",
    "macbook backgrounds",
    "mac wallpaper",
  ],
  pageLabel: "MacBook Wallpapers in 4K",
} as const

/** The /wallpapers/display index. */
export const displayIndexDef = {
  slug: "display",
  pathname: DISPLAY_PAGES_PATH,
  title: "Mac Wallpapers by Display and Screen Size",
  headline: "Live wallpapers by Mac display",
  label: "Displays",
  description:
    "Find live wallpapers sized for your screen: MacBook Air, MacBook Pro, MacBook Neo, iMac, Studio Display, ultrawide and 4K monitors, with Apple's resolutions.",
  keywords: [
    "mac wallpaper size",
    "wallpaper size for mac",
    "mac display wallpaper",
    "macbook wallpaper resolution",
    "wallpaper by screen resolution",
  ],
} as const

export function displayPageDef(slug: string): DisplayPageDef | undefined {
  return displayPageDefs.find((def) => def.slug === slug)
}

export function displayPagePath(slug: string): string {
  return `${DISPLAY_PAGES_PATH}/${slug}`
}

function displaysFor(def: Pick<DisplayPageDef, "displayIds">): MacDisplay[] {
  return def.displayIds
    .map((id) => macDisplayById(id))
    .filter((d): d is MacDisplay => Boolean(d))
}

/** The screen a model page's grid is picked for; undefined for generic pages. */
export function displayPageTarget(def: DisplayPageDef): MacDisplay | undefined {
  const displays = displaysFor(def)
  return (
    (def.targetId ? macDisplayById(def.targetId) : undefined) ??
    displays[displays.length - 1]
  )
}

/** Upscaling a loop needs to cover the display; 1 or less means none. */
export function upscaleToCover(
  wallpaper: Pick<PublicWallpaper, "resolution">,
  display: Pick<MacDisplay, "width" | "height">
): number | null {
  const dims = parseResolution(wallpaper.resolution)
  if (!dims) return null
  // Landscape catalog; compare long edge to long edge.
  const w = Math.max(dims.width, dims.height)
  const h = Math.min(dims.width, dims.height)
  return Math.max(display.width / w, display.height / h)
}

function longShort(resolution: string): { long: number; short: number } | null {
  const dims = parseResolution(resolution)
  if (!dims) return null
  return {
    long: Math.max(dims.width, dims.height),
    short: Math.min(dims.width, dims.height),
  }
}

function aspectOf(wallpaper: Pick<PublicWallpaper, "resolution">): number {
  const dims = longShort(wallpaper.resolution)
  return dims ? dims.long / dims.short : 0
}

function isUltrawide(wallpaper: Pick<PublicWallpaper, "resolution">): boolean {
  return aspectOf(wallpaper) >= 2.3
}

/** 32:9 and wider, the 5120 × 1440 shape. */
function isSuperUltrawide(
  wallpaper: Pick<PublicWallpaper, "resolution">
): boolean {
  return aspectOf(wallpaper) >= 3.2
}

function isUhd(wallpaper: Pick<PublicWallpaper, "resolution">): boolean {
  const dims = longShort(wallpaper.resolution)
  return Boolean(dims && dims.long >= 3840 && dims.short >= 2160)
}

/** Encoded at exactly this screen's native size, in either orientation. */
function isExactFor(
  wallpaper: Pick<PublicWallpaper, "resolution">,
  display: Pick<MacDisplay, "width" | "height">
): boolean {
  const dims = longShort(wallpaper.resolution)
  return Boolean(
    dims &&
    dims.long === Math.max(display.width, display.height) &&
    dims.short === Math.min(display.width, display.height)
  )
}

/** "3840 × 2160", whichever separator the catalog stored. */
function sizeLabel(resolution: string): string {
  const dims = parseResolution(resolution)
  return dims ? `${dims.width} × ${dims.height}` : resolution
}

function percent(scale: number): number {
  return Math.max(0, Math.round((scale - 1) * 100))
}

function joinList(items: readonly string[], conjunction = "and"): string {
  if (items.length <= 1) return items[0] ?? ""
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`
  return `${items.slice(0, -1).join(", ")} ${conjunction} ${items.at(-1)}`
}

/** "a MacBook Air", "an iMac 24-inch". */
function withArticle(name: string): string {
  return `${/^[aeiou]/i.test(name) ? "an" : "a"} ${name}`
}

/** "13%" or "13% to 14%". */
function percentRange(values: readonly number[]): string {
  const min = Math.min(...values)
  const max = Math.max(...values)
  return min === max ? `${min}%` : `${min}% to ${max}%`
}

/* -------------------------------------------------------------------------- */
/* Seeded order                                                               */
/* -------------------------------------------------------------------------- */

/** FNV-1a, so a slug always seeds the same order. */
function hashSeed(text: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/** mulberry32: a small, deterministic PRNG. */
function seededRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Shuffles each run of `SHUFFLE_BAND` items (input is most-liked first), so a
 * seeded page shows popular loops in its own order without reaching for
 * rarely liked ones.
 */
function bandShuffle<T>(items: readonly T[], seed: string): T[] {
  const random = seededRandom(hashSeed(seed))
  const out: T[] = []
  for (let start = 0; start < items.length; start += SHUFFLE_BAND) {
    const band = items.slice(start, start + SHUFFLE_BAND)
    for (let i = band.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1))
      ;[band[i], band[j]] = [band[j], band[i]]
    }
    out.push(...band)
  }
  return out
}

/* -------------------------------------------------------------------------- */
/* Ranking and grid planning                                                  */
/* -------------------------------------------------------------------------- */

type Ranking = {
  /** Every candidate, in the order the page shows them. */
  ordered: PublicWallpaper[]
  /** Candidates that fit: cover the target within 5%, or match the shape or size. */
  fits: PublicWallpaper[]
  /** Fits that cover the target with no upscaling at all. */
  native: PublicWallpaper[]
}

/**
 * Model pages: exact-size loops first (most-liked first), then loops that
 * cover the target with no upscaling, then those within 5%, each in a seeded
 * order; then the rest, least upscaled first, so a big screen with few fits
 * still gets its sharpest options.
 */
function rankModel(
  def: DisplayPageDef,
  target: MacDisplay,
  catalog: readonly PublicWallpaper[]
): Ranking {
  const displays = displaysFor(def)
  const scored = catalog
    .map((wallpaper) => ({
      wallpaper,
      scale: upscaleToCover(wallpaper, target),
    }))
    .filter(
      (entry): entry is { wallpaper: PublicWallpaper; scale: number } =>
        entry.scale !== null
    )
  const exact = scored.filter((entry) =>
    displays.some((display) => isExactFor(entry.wallpaper, display))
  )
  const exactIds = new Set(exact.map((entry) => entry.wallpaper.id))
  const others = scored.filter((entry) => !exactIds.has(entry.wallpaper.id))
  const native = others.filter((entry) => entry.scale <= 1)
  const near = others.filter(
    (entry) => entry.scale > 1 && entry.scale <= MAX_UPSCALE
  )
  // Least upscaled first; each size keeps a seeded order within itself.
  const bySize = new Map<number, PublicWallpaper[]>()
  for (const entry of others.filter((e) => e.scale > MAX_UPSCALE)) {
    const key = Math.round(entry.scale * 1000)
    const group = bySize.get(key)
    if (group) group.push(entry.wallpaper)
    else bySize.set(key, [entry.wallpaper])
  }
  const rest = [...bySize.entries()]
    .sort(([a], [b]) => a - b)
    .flatMap(([key, items]) => bandShuffle(items, `${def.slug}:${key}`))

  const pick = (entries: { wallpaper: PublicWallpaper }[]) =>
    entries.map((entry) => entry.wallpaper)
  return {
    ordered: [
      ...pick(exact),
      ...bandShuffle(pick(native), `${def.slug}:native`),
      ...bandShuffle(pick(near), `${def.slug}:near`),
      ...rest,
    ],
    fits: pick(scored.filter((entry) => entry.scale <= MAX_UPSCALE)),
    native: pick(scored.filter((entry) => entry.scale <= 1)),
  }
}

function rankDef(
  def: DisplayPageDef,
  catalog: readonly PublicWallpaper[]
): Ranking {
  if (def.match === "ultrawide") {
    const fits = catalog.filter(isUltrawide)
    return { ordered: fits, fits, native: fits }
  }
  if (def.match === "uhd") {
    const fits = catalog.filter(isUhd)
    return { ordered: fits, fits, native: fits }
  }
  const target = displayPageTarget(def)
  if (!target) return { ordered: [], fits: [], native: [] }
  return rankModel(def, target, catalog)
}

/** The hub: every 4K loop (each fills every current MacBook), in its own seeded order. */
function rankHub(catalog: readonly PublicWallpaper[]): Ranking {
  const fits = catalog.filter(isUhd)
  return {
    ordered: bandShuffle(fits, macbookHubDef.slug),
    fits,
    native: fits,
  }
}

type PlanKey = DisplayPageSlug | typeof macbookHubDef.slug

/**
 * Pages are planned in this order; earlier pages keep their first choices.
 * The 4K page is most-liked first, then the big screens that most need their
 * few sharp loops, then the MacBooks.
 */
const PLAN_ORDER: readonly PlanKey[] = [
  "4k",
  "imac",
  "studio-display",
  "macbook-pro",
  "macbook-air",
  "macbook-neo",
  "macbook",
  "ultrawide",
]

type Plan = Ranking & {
  /** First-page grid. */
  grid: PublicWallpaper[]
  /** Every candidate, `grid` first: the numbered pages of a paginated page. */
  list: PublicWallpaper[]
}

/**
 * Takes wallpapers in `ordered` order, skipping any that would give this page
 * more than `DISPLAY_GRID_MAX_SHARED` in common with an earlier page. A pool
 * too small to avoid that fills the grid anyway rather than leave it short.
 */
function pickGrid(
  ordered: readonly PublicWallpaper[],
  earlier: readonly ReadonlySet<string>[]
): PublicWallpaper[] {
  const grid: PublicWallpaper[] = []
  const held: PublicWallpaper[] = []
  const shared = earlier.map(() => 0)
  for (const wallpaper of ordered) {
    if (grid.length === DISPLAY_GRID_LIMIT) break
    const hits = earlier.map((ids) => ids.has(wallpaper.id))
    if (hits.some((hit, i) => hit && shared[i] >= DISPLAY_GRID_MAX_SHARED)) {
      held.push(wallpaper)
      continue
    }
    hits.forEach((hit, i) => {
      if (hit) shared[i] += 1
    })
    grid.push(wallpaper)
  }
  for (const wallpaper of held) {
    if (grid.length === DISPLAY_GRID_LIMIT) break
    grid.push(wallpaper)
  }
  return grid
}

const planMemo = new WeakMap<
  readonly PublicWallpaper[],
  ReadonlyMap<PlanKey, Plan>
>()

/** First-page grids for every display page and the hub, planned together. */
export function planDisplayGrids(
  catalog: readonly PublicWallpaper[]
): ReadonlyMap<PlanKey, Plan> {
  const cached = planMemo.get(catalog)
  if (cached) return cached
  const plans = new Map<PlanKey, Plan>()
  const keys: PlanKey[] = [
    ...PLAN_ORDER,
    ...displayPageDefs
      .map((def) => def.slug)
      .filter((slug) => !PLAN_ORDER.includes(slug)),
  ]
  const earlier: ReadonlySet<string>[] = []
  for (const key of keys) {
    const def = key === macbookHubDef.slug ? null : displayPageDef(key)
    if (key !== macbookHubDef.slug && !def) continue
    const ranking = def ? rankDef(def, catalog) : rankHub(catalog)
    const grid = pickGrid(ranking.ordered, earlier)
    const gridIds = new Set(grid.map((wallpaper) => wallpaper.id))
    plans.set(key, {
      ...ranking,
      grid,
      list: [
        ...grid,
        ...ranking.ordered.filter((wallpaper) => !gridIds.has(wallpaper.id)),
      ],
    })
    earlier.push(gridIds)
  }
  planMemo.set(catalog, plans)
  return plans
}

/* -------------------------------------------------------------------------- */
/* Shared copy                                                                */
/* -------------------------------------------------------------------------- */

const UHD_SAMPLE = { resolution: "3840x2160" } as const

function fitCountFor(
  catalog: readonly PublicWallpaper[],
  display: MacDisplay
): number {
  return catalog.filter((wallpaper) => {
    const scale = upscaleToCover(wallpaper, display)
    return scale !== null && scale <= MAX_UPSCALE
  }).length
}

/** Newest wallpaper among `items`, or the specs date, whichever is later (YYYY-MM-DD). */
function lastModified(items: readonly PublicWallpaper[]): string {
  const newest = items
    .map((wallpaper) => String(wallpaper.createdAt ?? "").slice(0, 10))
    .filter((day) => /^\d{4}-\d{2}-\d{2}$/.test(day))
    .sort()
    .at(-1)
  return newest && newest > MAC_DISPLAY_SPECS_ACCESSED
    ? newest
    : MAC_DISPLAY_SPECS_ACCESSED
}

function isMacBook(display: MacDisplay): boolean {
  return display.family !== "imac" && display.family !== "apple-display"
}

const currentMacBooks = macDisplays.filter(
  (display) => display.current && isMacBook(display)
)

function howToSet(where: string): ContentBlock[] {
  return [
    { type: "h2", text: `How to set one on your ${where}` },
    {
      type: "ol",
      items: [
        `[Download ${macwall.name}](/download) for ${macwallMinimumMacOSVersion} or later. Every Mac gets one free 24-hour trial of the full catalog.`,
        "Open a wallpaper above and choose **Set on Mac**, or find it by name in the app.",
        "Pick the display. On a Mac with several screens, each one can play its own loop.",
        `On ${macwallLockScreenMacOSVersion} or later, the same loop can also play on the Lock Screen and as the screen saver, with Pro or during the trial.`,
      ],
    },
  ]
}

function sourcesFor(displays: readonly MacDisplay[]): ContentBlock[] {
  const sources = macDisplaySources(displays)
  if (sources.length === 0) return []
  return [
    { type: "h2", text: "Sources" },
    {
      type: "ul",
      items: sources.map(
        (source) =>
          `[${source.name}](${source.url}), Apple, accessed ${accessedLabel(source.accessed)}`
      ),
    },
  ]
}

const stillOrVideoFaq: ContentFaq = {
  question: "Are these still images or video?",
  answer: `They are video loops that play behind your windows in the ${macwall.name} app, not image downloads. You can preview every one on this site before installing anything. For a still wallpaper instead, the free wallpaper resizer in ${macwall.name}'s tools crops any photo to your screen's exact size.`,
}

function slowDownFaq(device: string): ContentFaq {
  return {
    question: `Do live wallpapers slow down a ${device}?`,
    answer: `${macwall.name} decodes video in hardware, pauses behind full-screen apps by default and stops while your displays sleep, so it isn't decoding video you can't see. In ${macwallBatteryPolicy.settingsPath} you can also turn on ${macwallBatteryPolicy.pauseOnBattery.label}, which ${macwallBatteryPolicy.pauseOnBattery.detail}.`,
  }
}

/** The smallest encoded size in the catalog that covers `target` with no upscaling. */
function smallestNativeSize(
  plan: Plan,
  target: MacDisplay
): string | undefined {
  const smallest = [...plan.native].sort(
    (a, b) =>
      (upscaleToCover(b, target) ?? 0) - (upscaleToCover(a, target) ?? 0)
  )[0]
  return smallest ? sizeLabel(smallest.resolution) : undefined
}

const SIZE_GUIDE = "[wallpaper size guide](/blog/macbook-wallpaper-size)"
const RESIZER = "[wallpaper resizer](/tools/wallpaper-resizer)"

/* -------------------------------------------------------------------------- */
/* Display pages                                                              */
/* -------------------------------------------------------------------------- */

export type DisplayPageData = {
  def: DisplayPageDef
  page: SeoContentPage
  /** This page's grid: the first-page pick, or one numbered page of the list. */
  wallpapers: PublicWallpaper[]
  /** Loops that fit the page's target screen (or its shape or size). */
  fitCount: number
  /** 1 on the landing page. */
  pageNumber: number
  /** 1 unless the def paginates. */
  totalPages: number
  /** Position of `wallpapers[0]` in the whole list, from 0. */
  offset: number
}

function modelSections(
  def: DisplayPageDef,
  catalog: readonly PublicWallpaper[],
  plan: Plan,
  target: MacDisplay
): { sections: ContentBlock[]; faq: ContentFaq[] } {
  const displays = displaysFor(def)
  const current = displays.filter((d) => d.current)
  const shown = current.length > 0 ? current : displays
  const fitCount = plan.fits.length

  // Current models, one sentence per distinct resolution.
  const seen = new Set<string>()
  const natives = displays
    .filter((d) => d.current || displays.length === 1)
    .filter((d) => {
      const key = displayResolutionLabel(d)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map((d) => `the ${d.name} is ${displayResolutionLabel(d)}`)

  const sections: ContentBlock[] = [
    {
      type: "p",
      text: `**According to Apple's tech specs, ${natives.join(" and ")} pixels. A live wallpaper encoded at ${displayResolutionLabel(target)} or larger fills the ${target.shortName} screen at native resolution. ${fitCount} wallpapers in the ${macwall.name} catalog fill it at native resolution or with no more than 5% upscaling.**`,
    },
    {
      type: "table",
      columns: [
        "Display",
        "Screen",
        "Native resolution",
        "Aspect ratio",
        "Pixels per inch",
        "Loops that fit",
      ],
      rows: displays.map((d) => [
        `[${d.name}](${d.source})`,
        `${d.sizeInches}-inch`,
        displayResolutionLabel(d),
        displayAspectLabel(d),
        String(d.ppi),
        String(fitCountFor(catalog, d)),
      ]),
      caption: `Resolutions from Apple's tech specs, read ${accessedLabel(target.accessed)}. "Loops that fit" counts catalog wallpapers that cover the screen with at most 5% upscaling.`,
    },
  ]

  // What the grid leads with, from the numbers.
  const uhdScale = upscaleToCover(UHD_SAMPLE, target) ?? 1
  const fitIds = new Set(plan.fits.map((wallpaper) => wallpaper.id))
  const smallestNative = smallestNativeSize(plan, target)
  const nativeFrom = smallestNative ?? displayResolutionLabel(target)
  if (uhdScale <= 1) {
    sections.push({
      type: "p",
      text: `A 4K loop (3840 × 2160) is larger than the ${target.shortName} screen, so it is scaled down, never up, and stays sharp. The grid mixes the most-liked loops that fit, in an order picked for this page, so it shows a different set from the [4K page](${displayPagePathFor("4k")}) and the other MacBook pages.`,
    })
  } else if (uhdScale <= MAX_UPSCALE) {
    sections.push({
      type: "p",
      text: `A 3840 × 2160 loop is scaled up ${percent(uhdScale)}% to fill the ${target.shortName}.${
        smallestNative
          ? ` The grid leads with loops encoded at ${nativeFrom} or larger, which cover it with no upscaling at all (${plan.native.length} in the catalog), then mixes in the most-liked 4K loops.`
          : ""
      }`,
    })
  } else {
    const upscaled = plan.grid
      .filter((wallpaper) => !fitIds.has(wallpaper.id))
      .map((wallpaper) => percent(upscaleToCover(wallpaper, target) ?? 1))
    if (upscaled.length > 0) {
      sections.push({
        type: "p",
        text: `${
          plan.fits.length === 0
            ? "No loop in the catalog covers this screen within 5% yet, so the grid shows"
            : `Only ${plan.fits.length} ${plan.fits.length === 1 ? "loop covers" : "loops cover"} this screen within 5%, so the grid starts with ${plan.fits.length === 1 ? "it" : "them"} and continues with`
        } the sharpest 4K and larger loops, which are scaled up ${percentRange(upscaled)} to fill it. Up close they look a little softer than a native-resolution file.`,
      })
    }
  }

  // Aspect ratio and cropping.
  const crops = shown.map((d) => sixteenNineCropPercent(d))
  const shapes = joinList([...new Set(shown.map((d) => displayAspectLabel(d)))])
  sections.push({
    type: "p",
    text: crops.every((crop) => crop === 0)
      ? `The ${joinList(shown.map((d) => d.shortName))} ${shown.length === 1 ? "screen is" : "screens are"} 16:9, the same shape as most loops in the catalog, so a 16:9 loop fills ${shown.length === 1 ? "it" : "them"} with nothing cropped.`
      : `${shown.length === 1 ? `The ${shown[0].shortName} screen is` : `The ${joinList(shown.map((d) => d.shortName))} screens are`} ${shapes}, taller than the 16:9 shape of most loops. ${macwall.name} fills the screen edge to edge instead of adding black bars, so a 16:9 loop loses about ${percentRange(crops)} of its width at the sides. Loops with the subject near the middle frame best.`,
  })

  sections.push(
    ...howToSet("Mac"),
    { type: "h2", text: "How these wallpapers are picked" },
    {
      type: "p",
      text: `Each wallpaper's encoded resolution comes from the ${macwall.name} catalog. A loop counts as a fit when it covers the ${target.shortName} at native resolution with no more than 5% upscaling. The grid starts with loops at the screen's exact or native size, then mixes the most-liked fits in an order picked for this page, and it updates as wallpapers are added. Every 4K loop, most-liked first, is on the [4K page](${displayPagePathFor("4k")}). To size your own image for a Mac screen, use the ${SIZE_GUIDE} or the ${RESIZER}.`,
    },
    ...sourcesFor(displays)
  )

  const device = displays.every(isMacBook) ? "MacBook" : "Mac"
  const faq: ContentFaq[] = [
    {
      question: `What resolution should ${withArticle(def.label)} wallpaper be?`,
      answer: `Match the native resolution: ${joinList(displays.map((d) => `${displayResolutionLabel(d)} for the ${d.name}`))}. Anything larger is scaled down cleanly; anything smaller is scaled up and looks softer.`,
    },
    {
      question: `Is a 4K wallpaper sharp on the ${target.shortName}?`,
      answer:
        uhdScale <= 1
          ? `Yes. At 3840 × 2160 a 4K loop is larger than the ${displayResolutionLabel(target)} screen, so it is scaled down, never up.`
          : uhdScale <= MAX_UPSCALE
            ? `Nearly. A 3840 × 2160 loop is scaled up ${percent(uhdScale)}% to cover the ${displayResolutionLabel(target)} screen. Loops encoded at ${nativeFrom} or larger cover it with no upscaling, and this page lists them first.`
            : `${uhdScale <= 1.2 ? "Mostly" : "Not fully"}. A 3840 × 2160 loop is scaled up ${percent(uhdScale)}% to cover the ${displayResolutionLabel(target)} screen, so it looks a little softer up close than a native-resolution file. Loops encoded at ${displayResolutionLabel(target)} or larger stay fully sharp, and this page lists them first.`,
    },
    stillOrVideoFaq,
    slowDownFaq(device),
  ]
  return { sections, faq }
}

function ultrawideSections(plan: Plan): {
  sections: ContentBlock[]
  faq: ContentFaq[]
} {
  const fits = plan.fits
  const superWide = fits.filter(isSuperUltrawide)
  const wide = fits.filter((wallpaper) => !isSuperUltrawide(wallpaper))
  const sizeCounts = [
    ...fits
      .reduce((counts, wallpaper) => {
        const key = sizeLabel(wallpaper.resolution)
        counts.set(key, (counts.get(key) ?? 0) + 1)
        return counts
      }, new Map<string, number>())
      .entries(),
  ].sort((a, b) => b[1] - a[1])
  // A 21:9 frame on a 32:9 screen, and the reverse, when filled edge to edge.
  const wideOnSuper = Math.round((1 - 3440 / 1440 / (5120 / 1440)) * 100)

  const sections: ContentBlock[] = [
    {
      type: "p",
      text: `**${fits.length} wallpapers in the ${macwall.name} catalog are ultrawide, with an aspect ratio of 2.3:1 or wider: ${wide.length} in the 21:9 shape of 3440 × 1440 monitors and ${superWide.length} in the 32:9 shape of 5120 × 1440 monitors.** Apple does not make an ultrawide display, so these are for third-party monitors connected to a Mac.`,
    },
    {
      type: "table",
      columns: ["Encoded size", "Shape", "Loops"],
      rows: sizeCounts.slice(0, 8).map(([size, count]) => {
        const dims = parseResolution(size)
        const shape = dims && dims.width / dims.height >= 3.2 ? "32:9" : "21:9"
        return [size, shape, String(count)]
      }),
      caption: `Counted from the ${macwall.name} catalog's encoded resolutions. Each size plays at native resolution on a monitor of that size.`,
    },
    { type: "h2", text: "3440 × 1440 ultrawide wallpapers (21:9)" },
    {
      type: "p",
      text: `3440 × 1440 is a common resolution for 34-inch ultrawide monitors${
        sizeCounts[0]?.[0] === "3440 × 1440"
          ? `, and ${sizeCounts[0][1]} of the ultrawide loops here are encoded at exactly that size`
          : ""
      }. On a monitor of that size a 3440 × 1440 loop plays at native resolution; on a 2560 × 1080 ultrawide it is scaled down and stays sharp.`,
    },
    { type: "h2", text: "5120 × 1440 super-ultrawide wallpapers (32:9)" },
    {
      type: "p",
      text:
        superWide.length > 0
          ? `${superWide.length} ${superWide.length === 1 ? "loop is" : "loops are"} encoded in the 32:9 shape, for 5120 × 1440 super-ultrawide monitors. A 21:9 loop also fills a 32:9 screen: ${macwall.name} fills the screen edge to edge, so it is enlarged and loses about ${wideOnSuper}% of its height at the top and bottom.`
          : `No 32:9 loops are in the catalog yet. A 21:9 loop still fills a 5120 × 1440 screen: ${macwall.name} fills it edge to edge, so the loop is enlarged and loses about ${wideOnSuper}% of its height at the top and bottom.`,
    },
    ...howToSet("Mac"),
    { type: "h2", text: "How these wallpapers are picked" },
    {
      type: "p",
      text: `Each wallpaper's encoded resolution comes from the ${macwall.name} catalog. Every loop with an aspect ratio of 2.3:1 or wider is listed, most-liked first, ${DISPLAY_GRID_LIMIT} per page, and the list updates as wallpapers are added. For a 16:9 monitor, the [4K page](${displayPagePathFor("4k")}) fits better.`,
    },
  ]

  const faq: ContentFaq[] = [
    {
      question: "Are there 5120x1440 live wallpapers for Mac?",
      answer:
        superWide.length > 0
          ? `Yes. ${superWide.length} ${superWide.length === 1 ? "loop in the catalog is" : "loops in the catalog are"} in the 32:9 shape of 5120 × 1440 super-ultrawide monitors, and ${macwall.name} plays them on any such monitor connected to a Mac. A 21:9 loop also fills a 32:9 screen, with about ${wideOnSuper}% of its height trimmed.`
          : `Not yet in the 32:9 shape. A 21:9 loop such as 3440 × 1440 fills a 5120 × 1440 screen, with about ${wideOnSuper}% of its height trimmed at the top and bottom.`,
    },
    {
      question: "Should I use an ultrawide loop on a MacBook screen?",
      answer:
        "No. Ultrawide loops are shaped for 21:9 and 32:9 monitors. A MacBook screen is close to 16:10, so a regular 16:9 loop, like those on the 4K page, matches it better.",
    },
    stillOrVideoFaq,
    slowDownFaq("Mac"),
  ]
  return { sections, faq }
}

function uhdSections(plan: Plan): {
  sections: ContentBlock[]
  faq: ContentFaq[]
} {
  const fits = plan.fits
  const noUpscale = currentMacBooks.filter(
    (d) => (upscaleToCover(UHD_SAMPLE, d) ?? 2) <= 1
  )
  const slight = currentMacBooks.filter((d) => {
    const scale = upscaleToCover(UHD_SAMPLE, d) ?? 2
    return scale > 1 && scale <= MAX_UPSCALE
  })
  const sizeCounts = [
    ...fits
      .reduce((counts, wallpaper) => {
        const key = sizeLabel(wallpaper.resolution)
        counts.set(key, (counts.get(key) ?? 0) + 1)
        return counts
      }, new Map<string, number>())
      .entries(),
  ].sort((a, b) => b[1] - a[1])
  const appleScreens = [
    ...new Map(
      macDisplays
        .filter((d) => d.current)
        .map((d) => [displayResolutionLabel(d), d])
    ).values(),
  ]

  const sections: ContentBlock[] = [
    {
      type: "p",
      text: `**${fits.length} wallpapers in the ${macwall.name} catalog are encoded at 3840 × 2160 or larger, and this page lists every one, most-liked first. At that size a loop fills most external 4K monitors and the ${joinList(noUpscale.map((d) => d.shortName))} without upscaling.**${slight
        .map(
          (d) =>
            ` The ${d.shortName} is ${d.height} pixels tall, so a 3840 × 2160 loop is scaled up by about ${percent(upscaleToCover(UHD_SAMPLE, d) ?? 1)}% there.`
        )
        .join("")}`,
    },
    {
      type: "table",
      columns: ["Encoded size", "Loops", "Fills without upscaling"],
      rows: sizeCounts.slice(0, 8).map(([size, count]) => {
        const sample = { resolution: size }
        const covered = appleScreens.filter(
          (d) => (upscaleToCover(sample, d) ?? 2) <= 1
        )
        return [
          size,
          String(count),
          covered.length === appleScreens.length
            ? "Every current Apple screen"
            : covered.map((d) => d.shortName).join(", ") || "None",
        ]
      }),
      caption: `Counted from the ${macwall.name} catalog's encoded resolutions; screens from Apple's tech specs, read ${accessedLabel(MAC_DISPLAY_SPECS_ACCESSED)}.`,
    },
    ...howToSet("Mac"),
    { type: "h2", text: "How these wallpapers are picked" },
    {
      type: "p",
      text: `Each wallpaper's encoded resolution comes from the ${macwall.name} catalog. Every loop at 3840 × 2160 or larger is listed, most-liked first, ${DISPLAY_GRID_LIMIT} per page, and the list updates as wallpapers are added. For picks sized to one Mac, see the [display pages](${DISPLAY_PAGES_PATH}) or the [MacBook wallpapers](${MACBOOK_HUB_PATH}) hub. To size your own image, use the ${SIZE_GUIDE}.`,
    },
  ]

  const faq: ContentFaq[] = [
    {
      question: "Is 4K enough for a MacBook wallpaper?",
      answer: `Yes. A 3840 × 2160 loop covers the ${joinList(noUpscale.map((d) => d.shortName))} without upscaling${
        slight.length > 0
          ? ` and the ${joinList(slight.map((d) => d.shortName))} with a ${percent(upscaleToCover(UHD_SAMPLE, slight[0]) ?? 1)}% upscale`
          : ""
      }. The iMac and Studio Display need more pixels than 4K for a fully sharp picture.`,
    },
    stillOrVideoFaq,
    slowDownFaq("MacBook"),
  ]
  return { sections, faq }
}

function numberedPageCopy(input: {
  pageLabel: string
  what: string
  page: number
  totalPages: number
  total: number
  firstName?: string
}): { title: string; description: string } {
  const { pageLabel, what, page, totalPages, total } = input
  const start = (page - 1) * DISPLAY_GRID_LIMIT + 1
  const end = Math.min(page * DISPLAY_GRID_LIMIT, total)
  const describe = (firstName?: string) =>
    `Page ${page} of ${totalPages}: ${what} ${start} to ${end} of ${total} in the ${macwall.name} catalog${
      firstName ? `, starting with ${firstName}` : ""
    }. Preview each loop free and set it on your Mac.`
  const withName = describe(input.firstName)
  return {
    title: `${pageLabel}, Page ${page}`,
    description: withName.length <= 160 ? withName : describe(),
  }
}

/**
 * Builds a display page from the catalog (most-liked first, as the catalog
 * reads). `pageNumber` above 1 is a numbered page of a paginated def; null
 * when that page doesn't exist.
 */
export function buildDisplayPage(
  def: DisplayPageDef,
  catalog: readonly PublicWallpaper[],
  pageNumber = 1
): DisplayPageData | null {
  const plan = planDisplayGrids(catalog).get(def.slug)
  if (!plan) return null
  const totalPages = def.paginate ? galleryPageCount(plan.list.length) : 1
  if (!Number.isInteger(pageNumber) || pageNumber < 1) return null
  if (pageNumber > totalPages) return null

  const offset = (pageNumber - 1) * DISPLAY_GRID_LIMIT
  const wallpapers = def.paginate
    ? plan.list.slice(offset, offset + DISPLAY_GRID_LIMIT)
    : plan.grid
  const pathname = displayPagePath(def.slug)
  const updatedAt = lastModified(plan.fits)

  if (pageNumber > 1) {
    const copy = numberedPageCopy({
      pageLabel: def.pageLabel ?? def.title,
      what: `${def.label} live wallpapers`,
      page: pageNumber,
      totalPages,
      total: plan.list.length,
      firstName: wallpapers[0]?.name,
    })
    return {
      def,
      wallpapers,
      fitCount: plan.fits.length,
      pageNumber,
      totalPages,
      offset,
      page: {
        slug: def.slug,
        pathname: `${pathname}/page/${pageNumber}`,
        title: copy.title,
        headline: `${def.headline}, page ${pageNumber}`,
        description: copy.description,
        keywords: def.keywords,
        sections: [],
        faq: [],
        updatedAt,
      },
    }
  }

  const target = displayPageTarget(def)
  const { sections, faq } =
    def.match === "ultrawide"
      ? ultrawideSections(plan)
      : def.match === "uhd" || !target
        ? uhdSections(plan)
        : modelSections(def, catalog, plan, target)

  return {
    def,
    wallpapers,
    fitCount: plan.fits.length,
    pageNumber,
    totalPages,
    offset,
    page: {
      slug: def.slug,
      pathname,
      title: def.title,
      headline: def.headline,
      description: def.description,
      keywords: def.keywords,
      sections,
      faq,
      updatedAt,
    },
  }
}

/* -------------------------------------------------------------------------- */
/* /wallpapers/macbook                                                        */
/* -------------------------------------------------------------------------- */

export type MacbookHubData = {
  page: SeoContentPage
  wallpapers: PublicWallpaper[]
  /** 4K loops, every one of which fills every current MacBook. */
  fitCount: number
  pageNumber: number
  totalPages: number
  offset: number
}

/** The /wallpapers/macbook hub, or one of its numbered pages; null past the end. */
export function buildMacbookHub(
  catalog: readonly PublicWallpaper[],
  pageNumber = 1
): MacbookHubData | null {
  const plan = planDisplayGrids(catalog).get(macbookHubDef.slug)
  if (!plan) return null
  const totalPages = galleryPageCount(plan.list.length)
  if (!Number.isInteger(pageNumber) || pageNumber < 1) return null
  if (pageNumber > totalPages) return null
  const offset = (pageNumber - 1) * DISPLAY_GRID_LIMIT
  const wallpapers = plan.list.slice(offset, offset + DISPLAY_GRID_LIMIT)
  const updatedAt = lastModified(plan.fits)
  const base = {
    wallpapers,
    fitCount: plan.fits.length,
    pageNumber,
    totalPages,
    offset,
  }

  if (pageNumber > 1) {
    const copy = numberedPageCopy({
      pageLabel: macbookHubDef.pageLabel,
      what: "4K MacBook live wallpapers",
      page: pageNumber,
      totalPages,
      total: plan.list.length,
      firstName: wallpapers[0]?.name,
    })
    return {
      ...base,
      page: {
        slug: macbookHubDef.slug,
        pathname: `${MACBOOK_HUB_PATH}/page/${pageNumber}`,
        title: copy.title,
        headline: `${macbookHubDef.headline}, page ${pageNumber}`,
        description: copy.description,
        keywords: [...macbookHubDef.keywords],
        sections: [],
        faq: [],
        updatedAt,
      },
    }
  }

  const macbooks = macDisplays.filter(isMacBook)
  const currentLine = joinList(
    currentMacBooks.map((d) => `${displayResolutionLabel(d)} (${d.shortName})`)
  )
  // Screens taller than 16:10 (the current Air and Pro) versus 16:10 ones.
  const tall = currentMacBooks.filter((d) => displayAspectLabel(d) !== "16:10")
  const sixteenTen = currentMacBooks.filter(
    (d) => displayAspectLabel(d) === "16:10"
  )
  const ratios = tall.map((d) => d.width / d.height)
  const ratioRange =
    ratios.length > 0
      ? (() => {
          const min = Math.min(...ratios).toFixed(2)
          const max = Math.max(...ratios).toFixed(2)
          return min === max ? `${min}:1` : `${min}:1 to ${max}:1`
        })()
      : ""
  const tallFamilies = joinList([
    ...new Set(tall.map((d) => d.name.replace(/ \d.*$/, ""))),
  ])
  // MacBooks a 4K loop has to be enlarged for.
  const enlarged = currentMacBooks.filter(
    (d) => (upscaleToCover(UHD_SAMPLE, d) ?? 1) > 1
  )
  // What the MacBook Pro page leads with, when 4K needs enlarging there.
  const proPlan = planDisplayGrids(catalog).get("macbook-pro")
  const proDef = displayPageDef("macbook-pro")
  const proTarget = proDef ? displayPageTarget(proDef) : undefined
  const proNative =
    proPlan && proTarget && (upscaleToCover(UHD_SAMPLE, proTarget) ?? 1) > 1
      ? (smallestNativeSize(proPlan, proTarget) ?? null)
      : null

  const sections: ContentBlock[] = [
    {
      type: "p",
      text: `**A MacBook wallpaper looks sharpest at the screen's native resolution. According to Apple's tech specs, the current models are ${currentLine}. A 4K loop (3840 × 2160) covers every one of them at native resolution or within 5%, and ${plan.fits.length} live wallpapers in the ${macwall.name} catalog are 4K or larger.**`,
    },
    { type: "h2", text: "MacBook screen sizes" },
    {
      type: "table",
      columns: [
        "MacBook",
        "Native resolution",
        "Aspect ratio",
        "16:9 trimmed",
        "Loops that fit",
        "Wallpapers",
      ],
      rows: macbooks.map((d) => [
        `[${d.name}](${d.source})`,
        displayResolutionLabel(d),
        displayAspectLabel(d),
        `${sixteenNineCropPercent(d)}%`,
        String(fitCountFor(catalog, d)),
        `[${displayPageDef(d.page)?.label ?? d.shortName}](${macDisplayPagePath(d)})`,
      ]),
      caption: `Resolutions from Apple's tech specs, read ${accessedLabel(MAC_DISPLAY_SPECS_ACCESSED)}. "16:9 trimmed" is the share of a 16:9 loop's width cut off when it fills the screen; "Loops that fit" counts catalog wallpapers that cover the screen with at most 5% upscaling.`,
    },
    { type: "h2", text: "Aspect ratio: why the edges get trimmed" },
    {
      type: "p",
      text: [
        tall.length > 0
          ? `Current ${tallFamilies} screens are ${ratioRange}, a little taller than 16:10.`
          : "",
        sixteenTen.length > 0
          ? `The ${joinList(sixteenTen.map((d) => d.shortName))} is 16:10.`
          : "",
        `Most loops in the catalog are 16:9, and ${macwall.name} fills the screen edge to edge instead of adding black bars, so a 16:9 loop loses part of its width at the sides:`,
        joinList(
          [
            ...(tall.length > 0
              ? [
                  `about ${percentRange(tall.map(sixteenNineCropPercent))} on ${withArticle(joinList([...new Set(tall.map((d) => d.name.replace(/ \d.*$/, "")))], "or"))}`,
                ]
              : []),
            ...(sixteenTen.length > 0
              ? [
                  `${percentRange(sixteenTen.map(sixteenNineCropPercent))} on the ${joinList(sixteenTen.map((d) => d.shortName))}`,
                ]
              : []),
          ],
          "and"
        ) + ".",
        "Loops with the subject near the middle frame best.",
      ]
        .filter(Boolean)
        .join(" "),
    },
    { type: "h2", text: "Is 4K enough for a MacBook?" },
    {
      type: "p",
      text: `Yes. ${
        enlarged.length === 0
          ? "3840 × 2160 is wider and taller than every current MacBook screen, so a 4K loop is only ever scaled down."
          : `3840 × 2160 is wider and taller than every current MacBook screen except the ${joinList(enlarged.map((d) => `${d.shortName}, which is ${d.height} pixels tall`))}, so a 4K loop is enlarged ${percentRange(enlarged.map((d) => percent(upscaleToCover(UHD_SAMPLE, d) ?? 1)))} there.`
      }${
        proNative
          ? ` The [MacBook Pro page](${displayPagePathFor("macbook-pro")}) leads with loops encoded at ${proNative} or larger, which need no enlarging at all.`
          : ""
      }`,
    },
    { type: "h2", text: "Still wallpaper or live wallpaper?" },
    {
      type: "p",
      text: `A still wallpaper is an image you set in System Settings → Wallpaper. A live wallpaper is a looping video that plays behind your windows. The ones here play in ${macwall.name} on ${macwallMinimumMacOSVersion} or later, and on the Lock Screen and as the screen saver on ${macwallLockScreenMacOSVersion} or later; they are not image downloads. For a still, crop any photo to your MacBook's exact size with the ${RESIZER}, and see the ${SIZE_GUIDE} for every model.`,
    },
    ...howToSet("MacBook"),
    { type: "h2", text: "How this grid is picked" },
    {
      type: "p",
      text: `This grid mixes the most-liked 4K loops in an order picked for this page. Every 4K loop, most-liked first, is on the [4K page](${displayPagePathFor("4k")}); picks for one model are on the ${joinList(
        (["macbook-air", "macbook-pro", "macbook-neo"] as const).map(
          (slug) =>
            `[${displayPageDef(slug)?.label ?? slug}](${displayPagePathFor(slug)})`
        )
      )} pages.`,
    },
    ...sourcesFor(macbooks),
  ]

  const faq: ContentFaq[] = [
    {
      question: "What size is a MacBook wallpaper?",
      answer: `The screen's native resolution: ${joinList(
        currentMacBooks.map(
          (d) => `${displayResolutionLabel(d)} for the ${d.name}`
        )
      )}. A 4K (3840 × 2160) wallpaper covers all of them at native resolution or within 5%.`,
    },
    {
      question: "Do live wallpapers drain a MacBook's battery?",
      answer: `Playing video uses more power than a still image. ${macwall.name} decodes it in hardware, pauses behind full-screen apps by default and stops while your displays sleep. Turn on ${macwallBatteryPolicy.pauseOnBattery.label} in ${macwallBatteryPolicy.settingsPath} to hold the frame whenever your MacBook is unplugged.`,
    },
    {
      question: "Can I download these MacBook wallpapers as images?",
      answer: `No. They are video loops that play inside the ${macwall.name} app, and you can preview every one here first. To make a still wallpaper, the free wallpaper resizer in ${macwall.name}'s tools crops any photo to your MacBook's exact size.`,
    },
  ]

  return {
    ...base,
    page: {
      slug: macbookHubDef.slug,
      pathname: MACBOOK_HUB_PATH,
      title: macbookHubDef.title,
      headline: macbookHubDef.headline,
      description: macbookHubDef.description,
      keywords: [...macbookHubDef.keywords],
      sections,
      faq,
      updatedAt,
    },
  }
}

/* -------------------------------------------------------------------------- */
/* /wallpapers/display                                                        */
/* -------------------------------------------------------------------------- */

export type DisplayIndexEntry = {
  href: string
  label: string
  /** One line under the label: the screen sizes, or what the page lists. */
  summary: string
  /** Loops on the page's list; null when the catalog couldn't be read. */
  count: number | null
  cover: PublicWallpaper | null
}

export type DisplayIndexData = {
  page: SeoContentPage
  entries: DisplayIndexEntry[]
}

/** Every display page and the MacBook hub; counts only when `catalog` is given. */
export function buildDisplayIndex(
  catalog: readonly PublicWallpaper[] | null
): DisplayIndexData {
  const plans = catalog ? planDisplayGrids(catalog) : null
  const entryFor = (
    key: PlanKey,
    href: string,
    label: string,
    summary: string
  ): DisplayIndexEntry => {
    const plan = plans?.get(key)
    return {
      href,
      label,
      summary,
      count: plan ? plan.fits.length : null,
      cover: plan?.grid[0] ?? null,
    }
  }

  const entries: DisplayIndexEntry[] = [
    entryFor(
      macbookHubDef.slug,
      MACBOOK_HUB_PATH,
      "Every MacBook",
      "4K loops that fill every current MacBook"
    ),
    ...displayPageDefs.map((def) => {
      const displays = displaysFor(def).filter((d) => d.current)
      const summary =
        def.match === "ultrawide"
          ? "21:9 and 32:9 monitors"
          : def.match === "uhd"
            ? "Every loop at 3840 × 2160 or larger"
            : joinList([
                ...new Set(displays.map((d) => displayResolutionLabel(d))),
              ])
      return entryFor(def.slug, displayPagePath(def.slug), def.label, summary)
    }),
  ]

  const sections: ContentBlock[] = [
    {
      type: "p",
      text: `**A wallpaper looks sharpest at the screen's native resolution. Each page here is built for one Mac or one kind of monitor: it lists Apple's resolution for that screen and the live wallpapers in the ${macwall.name} catalog that cover it at native resolution or with no more than 5% upscaling.**`,
    },
    { type: "h2", text: "Native resolution of every Mac" },
    {
      type: "table",
      columns: [
        "Display",
        "Native resolution",
        "Aspect ratio",
        "Pixels per inch",
        ...(catalog ? ["Loops that fit"] : []),
        "Wallpapers",
      ],
      rows: macDisplays.map((d) => [
        `[${d.name}](${d.source})`,
        displayResolutionLabel(d),
        displayAspectLabel(d),
        String(d.ppi),
        ...(catalog ? [String(fitCountFor(catalog, d))] : []),
        `[${displayPageDef(d.page)?.label ?? d.shortName}](${macDisplayPagePath(d)})`,
      ]),
      caption: `Resolutions from Apple's tech specs, read ${accessedLabel(MAC_DISPLAY_SPECS_ACCESSED)}. "Loops that fit" counts catalog wallpapers that cover the screen with at most 5% upscaling.`,
    },
    { type: "h2", text: "Monitors from other makers" },
    {
      type: "p",
      text: `${macwall.name} plays on any display connected to your Mac, and each display can have its own loop. The [ultrawide page](${displayPagePathFor("ultrawide")}) covers 21:9 and 32:9 monitors such as 3440 × 1440 and 5120 × 1440, and the [4K page](${displayPagePathFor("4k")}) lists every loop encoded at 3840 × 2160 or larger, which fills a 4K monitor at native resolution.`,
    },
    { type: "h2", text: "How to find your screen's resolution" },
    {
      type: "p",
      text: `Open System Settings → Displays, or open the [screen resolution checker](/tools/screen-resolution) on the Mac you want to check: it reads the screen and links the matching page here. To crop your own photo to any of these sizes, use the ${RESIZER}.`,
    },
    ...sourcesFor(macDisplays),
  ]

  const faq: ContentFaq[] = [
    {
      question: "Which wallpaper size fits my Mac?",
      answer: `The screen's native resolution, listed in the table on this page from Apple's tech specs: for example ${joinList(
        currentMacBooks
          .slice(0, 3)
          .map((d) => `${displayResolutionLabel(d)} for the ${d.name}`)
      )}. A wallpaper at that size or larger stays sharp.`,
    },
    {
      question: "Do these live wallpapers work on non-Apple monitors?",
      answer: `Yes. ${macwall.name} plays on any display connected to your Mac, and each display can play its own loop. Use the ultrawide page for 21:9 and 32:9 monitors and the 4K page for 4K monitors.`,
    },
  ]

  return {
    entries,
    page: {
      slug: displayIndexDef.slug,
      pathname: DISPLAY_PAGES_PATH,
      title: displayIndexDef.title,
      headline: displayIndexDef.headline,
      description: displayIndexDef.description,
      keywords: [...displayIndexDef.keywords],
      sections,
      faq,
      updatedAt: catalog ? lastModified(catalog) : MAC_DISPLAY_SPECS_ACCESSED,
    },
  }
}

/** Related links shown under every display page, the hub and the index. */
export function displayRelatedLinks(
  exclude?: string
): { href: string; label: string }[] {
  return [
    { href: MACBOOK_HUB_PATH, label: "Every MacBook" },
    ...displayPageDefs.map((def) => ({
      href: displayPagePath(def.slug),
      label: def.label,
    })),
    { href: DISPLAY_PAGES_PATH, label: "All Mac displays" },
  ].filter((link) => link.href !== exclude)
}
