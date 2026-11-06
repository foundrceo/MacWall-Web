/**
 * Built-in and Apple-made displays, from Apple's own tech specs pages. Every
 * entry carries the page it came from and the day it was read, so pages that
 * quote these numbers can cite them. Re-check the sources before changing a
 * value; never add a model without its Apple specs page.
 *
 * Client components (the /tools pages) import this file, so it stays free of
 * copy and catalog code: lib/seo/display-pages.ts builds the pages.
 */

/** Wallpapers sized per screen: `/wallpapers/display/{slug}`. */
export const DISPLAY_PAGES_PATH = "/wallpapers/display"

/** Every `/wallpapers/display` page; lib/seo/display-pages.ts defines each one. */
export type DisplayPageSlug =
  | "macbook-air"
  | "macbook-pro"
  | "macbook-neo"
  | "imac"
  | "studio-display"
  | "ultrawide"
  | "4k"

export function displayPagePathFor(slug: DisplayPageSlug): string {
  return `${DISPLAY_PAGES_PATH}/${slug}`
}

export type MacDisplay = {
  id: string
  name: string
  /** Short label for chips and tables. */
  shortName: string
  family: "macbook-air" | "macbook-pro" | "macbook" | "imac" | "apple-display"
  /** Diagonal as Apple states it. */
  sizeInches: number
  width: number
  height: number
  ppi: number
  /** Still sold on apple.com when the specs were read. */
  current: boolean
  /** The wallpaper page that covers this screen. */
  page: DisplayPageSlug
  source: string
  accessed: string
}

export const MAC_DISPLAY_SPECS_ACCESSED = "2026-10-27"

export const macDisplays: readonly MacDisplay[] = [
  {
    id: "macbook-air-13-m5",
    name: "MacBook Air 13-inch (M5)",
    shortName: "MacBook Air 13″",
    family: "macbook-air",
    sizeInches: 13.6,
    width: 2560,
    height: 1664,
    ppi: 224,
    current: true,
    page: "macbook-air",
    source: "https://www.apple.com/macbook-air/specs/",
    accessed: MAC_DISPLAY_SPECS_ACCESSED,
  },
  {
    id: "macbook-air-15-m5",
    name: "MacBook Air 15-inch (M5)",
    shortName: "MacBook Air 15″",
    family: "macbook-air",
    sizeInches: 15.3,
    width: 2880,
    height: 1864,
    ppi: 224,
    current: true,
    page: "macbook-air",
    source: "https://www.apple.com/macbook-air/specs/",
    accessed: MAC_DISPLAY_SPECS_ACCESSED,
  },
  {
    id: "macbook-air-13-m1",
    name: "MacBook Air (M1, 2020)",
    shortName: "MacBook Air M1",
    family: "macbook-air",
    sizeInches: 13.3,
    width: 2560,
    height: 1600,
    ppi: 227,
    current: false,
    page: "macbook-air",
    source: "https://support.apple.com/en-us/111883",
    accessed: MAC_DISPLAY_SPECS_ACCESSED,
  },
  {
    id: "macbook-pro-14-m5",
    name: "MacBook Pro 14-inch (M5)",
    shortName: "MacBook Pro 14″",
    family: "macbook-pro",
    sizeInches: 14.2,
    width: 3024,
    height: 1964,
    ppi: 254,
    current: true,
    page: "macbook-pro",
    source: "https://www.apple.com/macbook-pro/specs/",
    accessed: MAC_DISPLAY_SPECS_ACCESSED,
  },
  {
    id: "macbook-pro-16-m5",
    name: "MacBook Pro 16-inch (M5 Pro / M5 Max)",
    shortName: "MacBook Pro 16″",
    family: "macbook-pro",
    sizeInches: 16.2,
    width: 3456,
    height: 2234,
    ppi: 254,
    current: true,
    page: "macbook-pro",
    source: "https://www.apple.com/macbook-pro/specs/",
    accessed: MAC_DISPLAY_SPECS_ACCESSED,
  },
  {
    id: "macbook-pro-13-m2",
    name: "MacBook Pro (13-inch, M2, 2022)",
    shortName: "MacBook Pro 13″",
    family: "macbook-pro",
    sizeInches: 13.3,
    width: 2560,
    height: 1600,
    ppi: 227,
    current: false,
    page: "macbook-pro",
    source: "https://support.apple.com/en-us/111869",
    accessed: MAC_DISPLAY_SPECS_ACCESSED,
  },
  {
    id: "macbook-neo-13",
    name: "MacBook Neo (13-inch)",
    shortName: "MacBook Neo",
    family: "macbook",
    sizeInches: 13,
    width: 2408,
    height: 1506,
    ppi: 219,
    current: true,
    page: "macbook-neo",
    source: "https://www.apple.com/macbook-neo/specs/",
    accessed: MAC_DISPLAY_SPECS_ACCESSED,
  },
  {
    id: "imac-24-m4",
    name: "iMac 24-inch (M4)",
    shortName: "iMac 24″",
    family: "imac",
    // Apple markets it as 24-inch; the measured diagonal is 23.5 inches.
    sizeInches: 23.5,
    width: 4480,
    height: 2520,
    ppi: 218,
    current: true,
    page: "imac",
    source: "https://www.apple.com/imac/specs/",
    accessed: MAC_DISPLAY_SPECS_ACCESSED,
  },
  {
    id: "studio-display",
    name: "Studio Display",
    shortName: "Studio Display",
    family: "apple-display",
    sizeInches: 27,
    width: 5120,
    height: 2880,
    ppi: 218,
    current: true,
    page: "studio-display",
    source: "https://www.apple.com/studio-display/specs/",
    accessed: MAC_DISPLAY_SPECS_ACCESSED,
  },
  {
    id: "studio-display-xdr",
    name: "Studio Display XDR",
    shortName: "Studio Display XDR",
    family: "apple-display",
    sizeInches: 27,
    width: 5120,
    height: 2880,
    ppi: 218,
    current: true,
    page: "studio-display",
    source: "https://www.apple.com/studio-display-xdr/specs/",
    accessed: MAC_DISPLAY_SPECS_ACCESSED,
  },
  {
    id: "pro-display-xdr",
    name: "Pro Display XDR",
    shortName: "Pro Display XDR",
    family: "apple-display",
    sizeInches: 32,
    width: 6016,
    height: 3384,
    ppi: 218,
    current: false,
    page: "studio-display",
    source: "https://support.apple.com/en-us/111892",
    accessed: MAC_DISPLAY_SPECS_ACCESSED,
  },
]

export function macDisplayById(id: string): MacDisplay | undefined {
  return macDisplays.find((display) => display.id === id)
}

/** The wallpaper page for a screen, e.g. `/wallpapers/display/macbook-air`. */
export function macDisplayPagePath(display: Pick<MacDisplay, "page">): string {
  return displayPagePathFor(display.page)
}

/** Every listed Mac or Apple display whose native resolution is exactly this size. */
export function macDisplaysAtResolution(
  width: number,
  height: number
): MacDisplay[] {
  return macDisplays.filter(
    (display) =>
      (display.width === width && display.height === height) ||
      (display.width === height && display.height === width)
  )
}

const SIXTEEN_NINE = 16 / 9

/** "16:10", "16:9", or the ratio to two places, e.g. "1.54:1". */
export function displayAspectLabel(
  display: Pick<MacDisplay, "width" | "height">
): string {
  const ratio = display.width / display.height
  if (Math.abs(ratio - 1.6) < 0.005) return "16:10"
  if (Math.abs(ratio - SIXTEEN_NINE) < 0.005) return "16:9"
  return `${ratio.toFixed(2)}:1`
}

/**
 * Whole percent of a 16:9 frame that falls off the screen when it fills it
 * edge to edge, as MacWall does (aspect fill): the sides on a taller screen,
 * the top and bottom on a wider one. 0 on a 16:9 screen.
 */
export function sixteenNineCropPercent(
  display: Pick<MacDisplay, "width" | "height">
): number {
  const ratio = display.width / display.height
  const kept =
    ratio < SIXTEEN_NINE ? ratio / SIXTEEN_NINE : SIXTEEN_NINE / ratio
  return Math.round((1 - kept) * 100)
}

export type MacDisplaySource = { name: string; url: string; accessed: string }

/**
 * One citation per Apple specs page, in table order. A page that covers
 * several sizes is named for the model ("MacBook Air tech specs"), not for
 * whichever size happens to be listed last.
 */
export function macDisplaySources(
  displays: readonly MacDisplay[] = macDisplays
): MacDisplaySource[] {
  const bySource = new Map<string, MacDisplay[]>()
  for (const display of displays) {
    const group = bySource.get(display.source)
    if (group) group.push(display)
    else bySource.set(display.source, [display])
  }
  return [...bySource.entries()].map(([url, group]) => {
    const first = group[0]
    const name =
      group.length > 1
        ? first.name.replace(/\s\d+(?:\.\d+)?-inch.*$/, "")
        : first.name
    const accessed = group
      .map((display) => display.accessed)
      .sort()
      .at(-1) as string
    return { name: `${name} tech specs`, url, accessed }
  })
}

/** "2560 × 1664" */
export function displayResolutionLabel(
  display: Pick<MacDisplay, "width" | "height">
): string {
  return `${display.width} × ${display.height}`
}

/** "27 October 2026" */
export function accessedLabel(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}
