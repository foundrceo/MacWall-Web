import { AFFILIATE_UI_VISIBLE } from "@/lib/macwall-affiliate"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"

export type MarketingNavItem = {
  href: string
  label: string
  earnBadge?: boolean
}

/**
 * The collections hub. Same value as WALLPAPER_COLLECTIONS_HUB_PATH, written
 * out so the header bundle doesn't pull in every collection's copy.
 */
const WALLPAPER_COLLECTIONS_HUB_PATH = "/wallpapers/collections"

/** The comparison hub the header links; /compare and /alternatives/* sit under it. */
export const MARKETING_COMPARE_HREF = "/best-live-wallpaper-mac"

/**
 * Primary header nav, in the order a visitor decides:
 * what's in it → how it stacks up → what it costs → help.
 * Every item is a real page (no homepage fragments), so the header's
 * sitewide links go to hubs. Blog, Learn and the FAQ are search landing
 * pages, so they live in the secondary list (mobile menu, footer, ⌘K).
 */
export function getMarketingNavItems(): readonly MarketingNavItem[] {
  const h = macwallMarketingCopy.header

  return [
    { href: "/wallpapers", label: h.navGallery },
    { href: WALLPAPER_COLLECTIONS_HUB_PATH, label: "Collections" },
    { href: MARKETING_COMPARE_HREF, label: "Compare" },
    { href: "/pricing", label: h.navPricing },
    { href: "/docs", label: h.navSupport },
    ...(AFFILIATE_UI_VISIBLE
      ? [
          {
            href: "/affiliate",
            label: h.navAffiliate,
            earnBadge: true as const,
          },
        ]
      : []),
  ]
}

/** Reading and news: mobile menu's second tier and the command palette. */
export function getMarketingSecondaryNavItems(): readonly MarketingNavItem[] {
  const h = macwallMarketingCopy.header

  return [
    { href: "/blog", label: h.navBlog },
    { href: "/learn", label: h.navLearn },
    { href: "/faq", label: "FAQ" },
    { href: "/changelog", label: h.navChangelog },
  ]
}

export function isMarketingNavActive(pathname: string, href: string): boolean {
  // Section anchors: the URL never says which one you're reading.
  if (href.includes("#")) return false

  if (href === WALLPAPER_COLLECTIONS_HUB_PATH) {
    return (
      pathname === href ||
      pathname.startsWith(`${WALLPAPER_COLLECTIONS_HUB_PATH}/`)
    )
  }

  if (href === "/wallpapers") {
    if (isMarketingNavActive(pathname, WALLPAPER_COLLECTIONS_HUB_PATH)) {
      return false
    }
    return (
      pathname === "/wallpapers" ||
      pathname.startsWith("/wallpapers/") ||
      pathname.startsWith("/wallpaper/")
    )
  }

  if (href === MARKETING_COMPARE_HREF) {
    return (
      pathname === href ||
      pathname === "/compare" ||
      pathname.startsWith("/alternatives/")
    )
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}
