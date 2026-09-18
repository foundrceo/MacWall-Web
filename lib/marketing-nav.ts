import { AFFILIATE_UI_VISIBLE } from "@/lib/macwall-affiliate"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"

export type MarketingNavItem = {
  href: string
  label: string
  earnBadge?: boolean
}

/**
 * Primary marketing header nav — left-to-right funnel:
 * browse → buy → learn → get it free → news → partner.
 */
export function getMarketingNavItems(): readonly MarketingNavItem[] {
  const h = macwallMarketingCopy.header

  return [
    { href: "/wallpapers", label: h.navGallery },
    { href: "/pricing", label: h.navPricing },
    { href: "/learn", label: h.navLearn },
    { href: "/creator", label: h.navCreator },
    { href: "/blog", label: h.navBlog },
    ...(AFFILIATE_UI_VISIBLE
      ? [{ href: "/affiliate", label: h.navAffiliate, earnBadge: true as const }]
      : []),
  ]
}

export function isMarketingNavActive(pathname: string, href: string): boolean {
  if (href === "/wallpapers") {
    return (
      pathname === "/wallpapers" ||
      pathname.startsWith("/wallpapers/") ||
      pathname.startsWith("/wallpaper/")
    )
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}
