import {
  formatPriceCents,
  offerPriceFor,
  priceWithSaleText,
  proPriceFor,
} from "@/lib/pricing/sale-aware-price"
import type { ContentBlock, SeoContentPage } from "@/lib/content/types"

/**
 * Shared facts for the comparison pages (/compare, /best-live-wallpaper-mac,
 * /alternatives/*, /screen-saver-mac): check dates, source citations and
 * MacWall's own price, so the pages can't drift from each other.
 */

/**
 * Most competitor facts were read on this date from the URLs each page lists
 * under "Sources" (US prices). Re-check a source before changing its figure.
 */
export const COMPARISONS_CHECKED_ISO = "2026-10-27"

/**
 * Sources read on this date: Wallpaper Engine's Steam page and help center,
 * WallpaperMachine's README, Microsoft's Windows-on-Mac page, Apple's Screen
 * Saver guide, and the iWallpaper, Live Wallpaper Engine HD, Irvue and
 * Unsplash Wallpapers listings on the US Mac App Store.
 */
export const COMPARISONS_RECHECKED_ISO = "2026-11-06"

/** Year for a page title, from the date its facts were checked: "2026". */
export function comparisonTitleYear(iso: string): string {
  return iso.slice(0, 4)
}

/** "27 October 2026": the date style every Sources list uses. */
export function accessedLabel(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}

/** One "Sources" list item: "[Page](url), accessed 27 October 2026". */
export function sourceItem(
  label: string,
  url: string,
  accessedIso: string = COMPARISONS_CHECKED_ISO
): string {
  return `[${label}](${url}), accessed ${accessedLabel(accessedIso)}`
}

const SOURCE_LINK = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/

/**
 * The sources a page cites, read from its "Sources" list, for the Article's
 * `citation` in JSON-LD. One list in the copy, so the two never disagree.
 */
export function pageCitations(
  sections: readonly ContentBlock[]
): { name: string; url: string }[] {
  const heading = sections.findIndex(
    (block) => block.type === "h2" && block.text === "Sources"
  )
  if (heading < 0) return []
  const list = sections.slice(heading + 1).find((block) => block.type === "ul")
  if (!list || list.type !== "ul") return []
  return list.items.flatMap((item) => {
    const match = item.match(SOURCE_LINK)
    return match ? [{ name: match[1], url: match[2] }] : []
  })
}

/**
 * Every competitor and platform page the comparison pages cite (US
 * storefronts). Each page's Sources list says when it was read.
 */
export const COMPARISON_SOURCES = {
  backdrop: "https://cindori.com/backdrop",
  wallspace: "https://wallspace.app/",
  wallper: "https://www.wallper.app/",
  wallux: "https://wallux.app/",
  hanami:
    "https://apps.apple.com/us/app/hanami-live-wallpaper/id1456235760?mt=12",
  fourKLive: "https://apps.apple.com/us/app/4k-live-wallpaper/id1469182113",
  paper:
    "https://apps.apple.com/us/app/paper-4k-live-wallpapers/id1515245310?mt=12",
  dynamicWallpaperStudio:
    "https://apps.apple.com/us/app/dynamic-wallpaper-studio/id1453504509?mt=12",
  wallnetic:
    "https://apps.apple.com/us/app/wallnetic-live-wallpaper-4k/id6760347328?mt=12",
  iwallpaper:
    "https://apps.apple.com/us/app/iwallpaper-live-wallpaper/id1552826194?mt=12",
  liveWallpaperEngineHd:
    "https://apps.apple.com/us/app/live-wallpaper-engine-hd/id874715580?mt=12",
  irvue:
    "https://apps.apple.com/us/app/irvue-desktop-wallpapers/id1039633667?mt=12",
  unsplashWallpapers:
    "https://apps.apple.com/us/app/unsplash-wallpapers/id1284863847?mt=12",
  plashSite: "https://sindresorhus.com/plash",
  plashAppStore: "https://apps.apple.com/us/app/plash/id1494023538",
  twentyFourHour:
    "https://apps.apple.com/us/app/24-hour-wallpaper/id1226087575?mt=12",
  dynamicWallpaperClub: "https://dynamicwallpaper.club/",
  wallpaperEngineSteam:
    "https://store.steampowered.com/app/431960/Wallpaper_Engine/?cc=us",
  wallpaperEngineSite: "https://www.wallpaperengine.io/en",
  wallpaperEngineHelpMac:
    "https://help.wallpaperengine.io/en/functionality/linuxmacos.html",
  wallpaperMachine: "https://github.com/MMFoundation/WallpaperMachine",
  windowsOnAppleSilicon:
    "https://support.microsoft.com/en-us/windows/options-for-using-windows-11-with-mac-computers-with-apple-m1-m2-and-m3-chips-cd15fd62-9b34-4b78-b0bc-121baa3c568c",
  lively: "https://github.com/rocksdanister/lively",
  appleChangeWallpaper:
    "https://support.apple.com/guide/mac-help/mchlp3013/mac",
  appleWallpaperSettings:
    "https://support.apple.com/guide/mac-help/mchlp1103/mac",
  appleScreenSaverSettings:
    "https://support.apple.com/guide/mac-help/change-screen-saver-settings-mchlp1227/mac",
  appleMojave:
    "https://www.apple.com/newsroom/2018/06/apple-introduces-macos-mojave/",
} as const

export const MACWALL_PLATFORMS = "macOS 15+ (Apple silicon and Intel)"

export const MACWALL_FACTS_NOTE =
  "MacWall's own prices and requirements come from our [pricing](/pricing) and [download](/download) pages."

/** The comparison hub every /alternatives page sits under (breadcrumbs). */
export const COMPARE_HUB = { name: "Compare", pathname: "/compare" } as const

/**
 * MacWall's prices as checkout charges them at `now`, with the running sale
 * applied (lib/pricing/sale-aware-price.ts). No MacWall price is written by
 * hand on these pages.
 */
export function macwallPriceFacts(now: number = Date.now()) {
  const pro = proPriceFor("default", now)
  const india = proPriceFor("india", now)
  const plus = offerPriceFor("permanent_5", "default", now)
  const proText = priceWithSaleText(pro)
  return {
    /** "$9.09" during a sale, otherwise "$12.99". */
    pro: formatPriceCents(pro.currentCents),
    /** The current price with its sale context, for prose next to "one-time". */
    proText,
    proRegular: formatPriceCents(pro.regularCents),
    proRegularCents: pro.regularCents,
    proCurrentCents: pro.currentCents,
    india: formatPriceCents(india.currentCents),
    plus: formatPriceCents(plus.currentCents),
    proMacs: pro.macs,
    plusMacs: plus.macs,
    onSale: pro.saleCents !== null,
    /** One summary for every comparison table. */
    summary: `${proText} one-time for ${pro.macs} Macs (India ${formatPriceCents(india.currentCents)}); ${plus.macs} Macs ${formatPriceCents(plus.currentCents)}; 24-hour free trial`,
  }
}

export type MacwallPriceFacts = ReturnType<typeof macwallPriceFacts>

/**
 * A page whose body quotes MacWall's price. Its `sections` are built when
 * they are read, so a cached isolate never serves a price from before a sale
 * started or ended (the sale-boundary cron re-renders the pages). Everything
 * else is fixed copy, and FAQ answers name no MacWall price at all.
 */
export function salePricedPage(
  build: (prices: MacwallPriceFacts) => SeoContentPage
): SeoContentPage {
  const page = build(macwallPriceFacts())
  return {
    slug: page.slug,
    pathname: page.pathname,
    title: page.title,
    headline: page.headline,
    description: page.description,
    keywords: page.keywords,
    ...(page.faq ? { faq: page.faq } : {}),
    ...(page.publishedAt ? { publishedAt: page.publishedAt } : {}),
    ...(page.updatedAt ? { updatedAt: page.updatedAt } : {}),
    get sections() {
      return build(macwallPriceFacts()).sections
    },
  }
}
