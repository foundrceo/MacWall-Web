import { AFFILIATE_UI_VISIBLE } from "@/lib/macwall-affiliate"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"

export type MarketingNavItem = {
  href: string
  label: string
  earnBadge?: boolean
}

/**
 * Primary marketing header nav — left-to-right funnel:
 * browse → buy → learn → contribute → partner.
 */
export function getMarketingNavItems(): readonly MarketingNavItem[] {
  const h = macwallExactCopy.header

  return [
    { href: "/wallpapers", label: h.navGallery },
    { href: "/pricing", label: h.navPricing },
    { href: "/blog", label: h.navBlog },
    { href: "/submit", label: h.navSubmit },
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
