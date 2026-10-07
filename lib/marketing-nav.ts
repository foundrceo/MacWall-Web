import { AFFILIATE_UI_VISIBLE } from "@/lib/macwall-affiliate"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"

export type MarketingNavItem = {
  href: string
  label: string
  earnBadge?: boolean
}

/**
 * Primary header nav, in the order a visitor decides:
 * what's in it → what it does → what it costs → help.
 * Blog and Learn are search landing pages, not places people navigate to,
 * so they live in the secondary list (mobile menu, footer, ⌘K).
 */
export function getMarketingNavItems(): readonly MarketingNavItem[] {
  const h = macwallMarketingCopy.header

  return [
    { href: "/wallpapers", label: h.navGallery },
    { href: "/#features", label: h.navFeatures },
    { href: "/pricing", label: h.navPricing },
    { href: "/docs", label: h.navSupport },
    ...(AFFILIATE_UI_VISIBLE
      ? [{ href: "/affiliate", label: h.navAffiliate, earnBadge: true as const }]
      : []),
  ]
}

/** Reading and news: mobile menu's second tier and the command palette. */
export function getMarketingSecondaryNavItems(): readonly MarketingNavItem[] {
  const h = macwallMarketingCopy.header

  return [
    { href: "/blog", label: h.navBlog },
    { href: "/learn", label: h.navLearn },
    { href: "/changelog", label: h.navChangelog },
  ]
}

export function isMarketingNavActive(pathname: string, href: string): boolean {
  // Section anchors: the URL never says which one you're reading.
  if (href.includes("#")) return false

  if (href === "/wallpapers") {
    return (
      pathname === "/wallpapers" ||
      pathname.startsWith("/wallpapers/") ||
      pathname.startsWith("/wallpaper/")
    )
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}
