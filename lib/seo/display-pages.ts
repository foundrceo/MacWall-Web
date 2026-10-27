import type {
  ContentBlock,
  ContentFaq,
  SeoContentPage,
} from "@/lib/content/types"
import {
  macwall,
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersion,
} from "@/lib/macwall-site"
import { parseResolution } from "@/lib/public-catalog/format"
import type { PublicWallpaper } from "@/lib/public-catalog/types"
import {
  accessedLabel,
  displayResolutionLabel,
  macDisplayById,
  type MacDisplay,
} from "@/lib/seo/mac-displays"

/**
 * Wallpapers picked per Mac display by resolution. A loop "fits" a screen when
 * it covers it at native resolution with at most 5% upscaling, measured from
 * the catalog's encoded resolution. Every number on these pages is either from
 * Apple's specs (lib/seo/mac-displays.ts) or counted from the live catalog.
 */
export const DISPLAY_PAGES_PATH = "/wallpapers/display"
const MAX_UPSCALE = 1.05
export const DISPLAY_GRID_LIMIT = 24

export type DisplayPageDef = {
  slug: string
  /** Page title without the brand suffix, 50 characters or fewer. */
  title: string
  headline: string
  description: string
  keywords: string[]
  /** Apple displays covered, smallest first. Empty for generic pages. */
  displayIds: string[]
  /** The display the grid is picked for; defaults to the last one. */
  targetId?: string
  /** Generic pages (ultrawide, 4K) pick by shape or size instead of a model. */
  match?: "ultrawide" | "uhd"
}

export const displayPageDefs: readonly DisplayPageDef[] = [
  {
    slug: "macbook-air",
    title: "MacBook Air Live Wallpapers That Fit the Screen",
    headline: "MacBook Air live wallpapers",
    description:
      "Live wallpapers for MacBook Air 13 and 15-inch, picked by resolution so they fill the 2560 × 1664 or 2880 × 1864 screen. Preview each loop free.",
    keywords: [
      "macbook air wallpaper",
      "macbook air live wallpaper",
      "macbook air 13 wallpaper",
      "macbook air 15 wallpaper",
    ],
    displayIds: ["macbook-air-13-m1", "macbook-air-13-m5", "macbook-air-15-m5"],
  },
  {
    slug: "macbook-pro",
    title: "MacBook Pro Live Wallpapers That Fit the Screen",
    headline: "MacBook Pro live wallpapers",
    description:
      "Live wallpapers for MacBook Pro 14 and 16-inch, picked by resolution so they fill the 3024 × 1964 or 3456 × 2234 screen. Preview each loop free.",
    keywords: [
      "macbook pro wallpaper",
      "macbook pro 14 wallpaper",
      "macbook pro 16 wallpaper",
      "macbook pro live wallpaper",
    ],
    displayIds: ["macbook-pro-13-m2", "macbook-pro-14-m5", "macbook-pro-16-m5"],
  },
  {
    slug: "imac",
    title: "iMac 24-inch Live Wallpapers in 4.5K and 4K",
    headline: "iMac 24-inch live wallpapers",
    description:
      "Live wallpapers for the 24-inch iMac and its 4480 × 2520 Retina display, sorted by how sharp they look at native resolution. Preview each loop free.",
    keywords: [
      "imac wallpaper",
      "imac 24 wallpaper",
      "imac live wallpaper",
      "4.5k wallpaper",
    ],
    displayIds: ["imac-24-m4"],
  },
  {
    slug: "studio-display",
    title: "Studio Display Live Wallpapers in 5K and 4K",
    headline: "Studio Display live wallpapers",
    description:
      "Live wallpapers for Apple Studio Display, Studio Display XDR and Pro Display XDR, sorted by how close they come to 5K and 6K. Preview each loop free.",
    keywords: [
      "studio display wallpaper",
      "5k wallpaper",
      "pro display xdr wallpaper",
      "6k wallpaper",
      "5120x2880 wallpaper",
    ],
    displayIds: ["studio-display", "studio-display-xdr", "pro-display-xdr"],
    targetId: "studio-display",
  },
  {
    slug: "ultrawide",
    title: "Ultrawide Live Wallpapers for Mac",
    headline: "Ultrawide live wallpapers for Mac",
    description:
      "Live wallpapers made for 21:9 and 32:9 ultrawide monitors, such as 3440 × 1440 and 5120 × 1440, that play on a Mac with MacWall. Preview each loop free.",
    keywords: [
      "ultrawide wallpaper",
      "ultrawide live wallpaper",
      "3440x1440 wallpaper",
      "5120x1440 wallpaper",
      "dual monitor wallpaper",
    ],
    displayIds: [],
    match: "ultrawide",
  },
  {
    slug: "4k",
    title: "4K Live Wallpapers for Mac",
    headline: "4K live wallpapers for Mac",
    description:
      "Live wallpapers for Mac encoded at 3840 × 2160 or larger, enough to fill every MacBook screen at native resolution. Preview each loop free in MacWall.",
    keywords: [
      "4k wallpaper mac",
      "mac wallpaper 4k",
      "macbook wallpaper 4k",
      "4k live wallpaper mac",
    ],
    displayIds: [],
    match: "uhd",
  },
]

export function displayPageDef(slug: string): DisplayPageDef | undefined {
  return displayPageDefs.find((def) => def.slug === slug)
}

export function displayPagePath(slug: string): string {
  return `${DISPLAY_PAGES_PATH}/${slug}`
}

function displaysFor(def: DisplayPageDef): MacDisplay[] {
  return def.displayIds
    .map((id) => macDisplayById(id))
    .filter((d): d is MacDisplay => Boolean(d))
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

function isUltrawide(wallpaper: Pick<PublicWallpaper, "resolution">): boolean {
  const dims = parseResolution(wallpaper.resolution)
  if (!dims) return false
  return (
    Math.max(dims.width, dims.height) / Math.min(dims.width, dims.height) >= 2.3
  )
}

function isUhd(wallpaper: Pick<PublicWallpaper, "resolution">): boolean {
  const dims = parseResolution(wallpaper.resolution)
  if (!dims) return false
  return (
    Math.max(dims.width, dims.height) >= 3840 &&
    Math.min(dims.width, dims.height) >= 2160
  )
}

export type DisplayPageData = {
  def: DisplayPageDef
  page: SeoContentPage
  /** Grid: fits first (catalog order), then the next sharpest. */
  wallpapers: PublicWallpaper[]
  /** Loops that fit the largest display on the page. */
  fitCount: number
}

/** Builds the page from the catalog (most-liked first, as the catalog reads). */
export function buildDisplayPage(
  def: DisplayPageDef,
  catalog: PublicWallpaper[]
): DisplayPageData {
  const displays = displaysFor(def)
  const largest =
    (def.targetId ? macDisplayById(def.targetId) : undefined) ??
    displays[displays.length - 1]

  let fits: PublicWallpaper[]
  let rest: PublicWallpaper[] = []
  if (def.match === "ultrawide") {
    fits = catalog.filter(isUltrawide)
  } else if (def.match === "uhd") {
    fits = catalog.filter(isUhd)
  } else {
    const scored = catalog
      .map((wallpaper) => ({
        wallpaper,
        scale: upscaleToCover(wallpaper, largest),
      }))
      .filter(
        (entry): entry is { wallpaper: PublicWallpaper; scale: number } =>
          entry.scale !== null
      )
    fits = scored
      .filter((entry) => entry.scale <= MAX_UPSCALE)
      .map((entry) => entry.wallpaper)
    // When few loops fit, fill the grid with the next sharpest, least upscaled first.
    rest = scored
      .filter((entry) => entry.scale > MAX_UPSCALE)
      .sort((a, b) => a.scale - b.scale)
      .map((entry) => entry.wallpaper)
  }

  const wallpapers = [...fits, ...rest].slice(0, DISPLAY_GRID_LIMIT)
  const countFor = (display: MacDisplay) =>
    catalog.filter((wallpaper) => {
      const scale = upscaleToCover(wallpaper, display)
      return scale !== null && scale <= MAX_UPSCALE
    }).length

  const sections: ContentBlock[] = []
  const faq: ContentFaq[] = []
  const sources = [...new Map(displays.map((d) => [d.source, d])).values()]

  if (displays.length > 0) {
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
    sections.push({
      type: "p",
      text: `**According to Apple's tech specs, ${natives.join(" and ")} pixels. A live wallpaper encoded at ${displayResolutionLabel(largest)} or larger fills the ${largest.shortName} screen at native resolution. ${fits.length} wallpapers in the ${macwall.name} catalog fill it at native resolution or with no more than 5% upscaling.**`,
    })
    sections.push({
      type: "table",
      columns: [
        "Display",
        "Screen",
        "Native resolution",
        "Pixels per inch",
        "Loops that fit",
      ],
      rows: displays.map((d) => [
        `[${d.name}](${d.source})`,
        `${d.sizeInches}-inch`,
        displayResolutionLabel(d),
        String(d.ppi),
        String(countFor(d)),
      ]),
      caption: `Resolutions from Apple's tech specs, read ${accessedLabel(largest.accessed)}. "Loops that fit" counts catalog wallpapers that cover the screen with at most 5% upscaling.`,
    })
    if (rest.length > 0 && fits.length < DISPLAY_GRID_LIMIT) {
      sections.push({
        type: "p",
        text: `The grid above starts with the ${fits.length} loops that fit and continues with the next sharpest. Those are mostly 4K (3840 × 2160) loops, which have to be scaled up to fill this screen, so they look a little softer up close than a native-resolution file.`,
      })
    }
    faq.push({
      question: `What resolution should a ${def.headline.replace(/ live wallpapers$/, "")} wallpaper be?`,
      answer: `Match the native resolution: ${displays.map((d) => `${displayResolutionLabel(d)} for the ${d.name}`).join(", ")}. Anything larger is scaled down cleanly; anything smaller is scaled up and looks softer.`,
    })
  } else if (def.match === "ultrawide") {
    const sizes = [
      ...new Set(fits.map((w) => w.resolution.replace("×", "x"))),
    ].slice(0, 6)
    sections.push({
      type: "p",
      text: `**${fits.length} wallpapers in the ${macwall.name} catalog are ultrawide, with an aspect ratio of 2.3:1 or wider. Their encoded sizes include ${sizes.join(", ")}.** Apple does not make an ultrawide display, so these are for third-party monitors connected to a Mac.`,
    })
    faq.push({
      question: "Should I use an ultrawide loop on a MacBook screen?",
      answer:
        "No. Ultrawide loops are shaped for 21:9 and 32:9 monitors. A MacBook screen is close to 16:10, so a regular 16:9 loop such as the [4K wallpapers](/wallpapers/display/4k) matches it better.",
    })
  } else {
    sections.push({
      type: "p",
      text: `**${fits.length} wallpapers in the ${macwall.name} catalog are encoded at 3840 × 2160 or larger. At that size a loop fills the MacBook Air, the 14-inch MacBook Pro and most external 4K monitors without upscaling.** The 16-inch MacBook Pro is 2234 pixels tall, so a 3840 × 2160 loop is scaled up by about 3% there.`,
    })
    faq.push({
      question: "Is 4K enough for a MacBook wallpaper?",
      answer:
        "For the MacBook Air and the 14-inch MacBook Pro, yes: both screens are smaller than 3840 × 2160. The 16-inch MacBook Pro needs a slight upscale; the iMac and Studio Display need more.",
    })
  }

  sections.push(
    { type: "h2", text: "How to set one on your Mac" },
    {
      type: "ol",
      items: [
        `[Download ${macwall.name}](/download) for ${macwallMinimumMacOSVersion} or later. Every download starts with a free 24-hour trial.`,
        "Open a wallpaper above and choose **Set on Mac**, or find it by name in the app.",
        "Pick the display. On a Mac with several screens, each one can play its own loop.",
        `On ${macwallLockScreenMacOSVersion} or later, the same loop can play on the Lock Screen and as the Screen Saver with Pro.`,
      ],
    },
    { type: "h2", text: "How these wallpapers are picked" },
    {
      type: "p",
      text: `Each wallpaper's encoded resolution comes from the ${macwall.name} catalog. ${
        displays.length > 0
          ? "A loop counts as a fit when it covers the screen at native resolution with no more than 5% upscaling. "
          : ""
      }The grid is ordered by likes within each group and updates as wallpapers are added. To size your own image for a Mac screen, use the [wallpaper size guide](/blog/macbook-wallpaper-size).`,
    }
  )

  if (sources.length > 0) {
    sections.push(
      { type: "h2", text: "Sources" },
      {
        type: "ul",
        items: sources.map(
          (d) =>
            `[${d.name} tech specs](${d.source}), Apple, accessed ${accessedLabel(d.accessed)}`
        ),
      }
    )
  }

  faq.push(
    {
      question: "Are these still images or video?",
      answer: `They are video loops that play behind your windows in the ${macwall.name} app, not still image downloads. You can preview every one on this site before installing anything.`,
    },
    {
      question: "Do live wallpapers slow down a MacBook?",
      answer: `${macwall.name} decodes video in hardware and pauses playback behind full-screen apps and while the display sleeps, so the cost in everyday use is small.`,
    }
  )

  return {
    def,
    wallpapers,
    fitCount: fits.length,
    page: {
      slug: def.slug,
      pathname: displayPagePath(def.slug),
      title: def.title,
      headline: def.headline,
      description: def.description,
      keywords: def.keywords,
      sections,
      faq,
      updatedAt: largestAccessed(displays),
    },
  }
}

function largestAccessed(displays: MacDisplay[]): string | undefined {
  return displays
    .map((d) => d.accessed)
    .sort()
    .at(-1)
}
