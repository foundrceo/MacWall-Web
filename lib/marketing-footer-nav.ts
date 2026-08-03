import { AFFILIATE_UI_VISIBLE } from "@/lib/macwall-affiliate"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { macwall, macwallProCheckoutURL } from "@/lib/macwall-site"
import { categorySlugFromName } from "@/lib/seo/category-slugs"
import { SUPPORT_CHAT_HREF } from "@/lib/support/shared"

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

export type MarketingFooterLink = {
  label: string
  href: string
  external?: boolean
}

export type MarketingFooterColumn = {
  title: string
  links: readonly MarketingFooterLink[]
}

export type MarketingFooterSocialBrand = "Discord" | "Instagram" | "TikTok"

export type MarketingFooterSocialLink = {
  brand: MarketingFooterSocialBrand
  label: string
  href: string
}

export type MarketingFooterLegalLink = {
  label: string
  href: string
}

/** Visible footer columns — mirrors header nav funnel + resources + support. */
export function getMarketingFooterColumns(): readonly MarketingFooterColumn[] {
  const foot = macwallMarketingCopy.footer

  return [
    {
      title: "Products",
      links: [
        { label: "Wallpapers", href: "/wallpapers" },
        { label: foot.shop.pricing, href: "/pricing" },
        { label: foot.shop.download, href: "/download" },
        { label: "Upload Wallpaper", href: "/submit" },
        ...(AFFILIATE_UI_VISIBLE
          ? [{ label: foot.connect.affiliate, href: "/affiliate" }]
          : []),
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Docs", href: "/docs" },
        { label: "Learn", href: "/learn" },
        { label: "Blogs", href: "/blog" },
        { label: "Changelog", href: "/changelog" },
        { label: "Creator Offer", href: "/creator" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Live Support", href: SUPPORT_CHAT_HREF },
        {
          label: "Email us",
          href: `mailto:${macwall.supportEmail}`,
          external: true,
        },
        { label: "Crawler & AI policy", href: "/crawlers" },
        { label: foot.legal.privacy, href: "/privacy" },
        { label: foot.legal.terms, href: "/terms" },
      ],
    },
  ]
}

export function getMarketingFooterSocialLinks(): readonly MarketingFooterSocialLink[] {
  return [
    { brand: "Discord", label: "Discord", href: macwall.discordInvite },
    {
      brand: "Instagram",
      label: "Instagram",
      href: macwall.reelRefundInstagramURL,
    },
    { brand: "TikTok", label: "TikTok", href: macwall.reelRefundTiktokURL },
  ]
}

export function getMarketingFooterLegalLinks(): readonly MarketingFooterLegalLink[] {
  const foot = macwallMarketingCopy.footer

  return [
    { label: foot.legal.privacy, href: "/privacy" },
    { label: foot.legal.terms, href: "/terms" },
  ]
}

/** SEO comparison pages — crawlable from expanded footer surfaces. */
export const footerCompareLinks = [
  { href: "/best-live-wallpaper-mac", label: "Best Live Wallpaper for Mac" },
  { href: "/alternatives/wallpaper-engine", label: "Wallpaper Engine for Mac" },
  {
    href: "/alternatives/macwall-vs-wallspace",
    label: "Wallspace Alternative",
  },
  { href: "/alternatives/macwall-vs-backdrop", label: "Backdrop Alternative" },
  {
    href: "/alternatives/lively-wallpaper-mac",
    label: "Lively Wallpaper for Mac",
  },
] as const

/**
 * Wallpaper category landing pages — linked site-wide so every category is
 * crawlable from any page (prevents orphan pages and single-inbound-link issues).
 */
export const footerCategoryLinks: { href: string; label: string }[] =
  macwall.categories.flatMap((name) => {
    const slug = categorySlugFromName(name)
    return slug ? [{ href: `/wallpapers/${slug}`, label: name as string }] : []
  })

/** Expanded footer sections for SEO-heavy layouts and future surfaces. */
export function getMarketingFooterSections(
  shopPricingHref: string
): readonly FooterNavSection[] {
  const foot = macwallMarketingCopy.footer

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
        { label: "Wallpapers", href: "/wallpapers", kind: "internal" },
        { label: "Docs", href: "/docs", kind: "internal" },
        { label: "Learn", href: "/learn", kind: "internal" },
        { label: foot.explore.blog, href: "/blog", kind: "internal" },
        { label: "Changelog", href: "/changelog", kind: "internal" },
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
      title: foot.categoriesTitle,
      links: footerCategoryLinks.map((link) => ({
        label: link.label,
        href: link.href,
        kind: "internal" as const,
      })),
    },
    {
      title: foot.connectTitle,
      links: [
        ...(AFFILIATE_UI_VISIBLE
          ? [
              {
                label: foot.connect.affiliate,
                href: "/affiliate",
                kind: "internal" as const,
              },
            ]
          : []),
        {
          label: "Live Support",
          href: SUPPORT_CHAT_HREF,
          kind: "internal",
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
