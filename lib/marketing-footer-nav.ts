import { macwallExactCopy } from "@/lib/macwall-marketing-copy"
import { macwall, macwallProCheckoutURL } from "@/lib/macwall-site"

export type FooterLinkKind = "internal" | "external" | "pricing" | "download"

export type FooterNavLink = {
  label: string
  href: string
  kind: FooterLinkKind
}

export type FooterNavSection = {
  title: string
  links: readonly FooterNavLink[]
}

/** SEO comparison pages — crawlable from every marketing page. */
export const footerCompareLinks = [
  { href: "/best-live-wallpaper-mac", label: "Best Live Wallpaper for Mac" },
  { href: "/alternatives/wallpaper-engine", label: "Wallpaper Engine for Mac" },
  { href: "/alternatives/macwall-vs-wallper", label: "Wallper Alternative" },
  {
    href: "/alternatives/macwall-vs-wallspace",
    label: "Wallspace Alternative",
  },
  { href: "/alternatives/macwall-vs-backdrop", label: "Backdrop Alternative" },
] as const

export function getMarketingFooterSections(
  shopPricingHref: string
): readonly FooterNavSection[] {
  const foot = macwallExactCopy.footer

  return [
    {
      title: foot.shopTitle,
      links: [
        {
          label: foot.shop.buy,
          href: macwallProCheckoutURL,
          kind: "pricing",
        },
        {
          label: foot.shop.pricing,
          href: shopPricingHref,
          kind: "internal",
        },
        {
          label: foot.shop.download,
          href: "/download",
          kind: "internal",
        },
      ],
    },
    {
      title: foot.exploreTitle,
      links: [
        { label: foot.explore.blog, href: "/blog", kind: "internal" },
        {
          label: foot.explore.liveWallpaper,
          href: "/live-wallpaper-mac",
          kind: "internal",
        },
        {
          label: foot.explore.lockScreen,
          href: "/lock-screen-wallpaper",
          kind: "internal",
        },
      ],
    },
    {
      title: foot.compareTitle,
      links: footerCompareLinks.map((link) => ({
        label: link.label,
        href: link.href,
        kind: "internal" as const,
      })),
    },
    {
      title: foot.connectTitle,
      links: [
        {
          label: foot.connect.discord,
          href: macwall.discordInvite,
          kind: "external",
        },
      ],
    },
  ]
}

export function footerAnalyticsLocation(
  sectionTitle: string,
  kind: FooterLinkKind,
  mobile: boolean
): string {
  const prefix = mobile ? "footer_mobile" : "footer"
  const slug = sectionTitle.toLowerCase().replace(/\s+/g, "_")
  if (kind === "pricing") return `${prefix}_${slug}_buy`
  if (kind === "download") return `${prefix}_${slug}_download`
  return `${prefix}_${slug}`
}
