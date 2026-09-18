import { AFFILIATE_UI_VISIBLE } from "@/lib/macwall-affiliate"
import {
  LEGAL_DOCUMENTS,
  LEGAL_HUB_HREF,
  type LegalDocumentSlug,
} from "@/lib/legal/documents"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { macwall, macwallProCheckoutURL } from "@/lib/macwall-site"
import { categorySlugFromName } from "@/lib/seo/category-slugs"

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

/** Visible footer columns — Product → Resources → Company → Legal (funnel order). */
export function getMarketingFooterColumns(): readonly MarketingFooterColumn[] {
  const foot = macwallMarketingCopy.footer

  return [
    {
      title: "Product",
      links: [
        { label: "Wallpapers", href: "/wallpapers" },
        { label: foot.shop.pricing, href: "/pricing" },
        { label: foot.shop.download, href: "/download" },
        { label: "Bend", href: "/bend" },
        { label: "Creator Program", href: "/creator" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Docs", href: "/docs" },
        { label: "Learn", href: "/learn" },
        { label: foot.explore.blog, href: "/blog" },
        { label: "Changelog", href: "/changelog" },
      ],
    },
    {
      title: "Company",
      links: [
        {
          label: "Contact",
          href: `mailto:${macwall.supportEmail}`,
          external: true,
        },
        {
          label: "Discord",
          href: macwall.discordInvite,
          external: true,
        },
        ...(AFFILIATE_UI_VISIBLE
          ? [{ label: foot.connect.affiliate, href: "/affiliate" }]
          : []),
      ],
    },
    {
      title: foot.legal.hub,
      links: [
        legalFooterLink("terms"),
        legalFooterLink("privacy"),
        legalFooterLink("cookies"),
        legalFooterLink("refund"),
        { label: "All Policies", href: LEGAL_HUB_HREF },
      ],
    },
  ]
}

/** Footer shows only the binding essentials — the rest lives on the /legal hub. */
function legalFooterLink(slug: LegalDocumentSlug): MarketingFooterLink {
  const doc = LEGAL_DOCUMENTS.find((d) => d.slug === slug)
  if (!doc) throw new Error(`Unknown legal document: ${slug}`)
  return { label: doc.shortTitle, href: doc.href }
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
        { label: "Bend", href: "/bend", kind: "internal" },
        { label: "Want Free?", href: "/creator", kind: "internal" },
        { label: "Docs", href: "/docs", kind: "internal" },
        { label: "Learn", href: "/learn", kind: "internal" },
        { label: foot.explore.blog, href: "/blog", kind: "internal" },
        { label: "Changelog", href: "/changelog", kind: "internal" },
        {
          label: foot.explore.liveWallpaper,
          href: "/blog/how-to-set-live-wallpaper-mac",
          kind: "internal",
        },
        {
          label: foot.explore.lockScreen,
          href: "/blog/lock-screen-live-wallpaper-macos",
          kind: "internal",
        },
        { label: "AI product info", href: "/ai-info", kind: "internal" },
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
          label: "Email us",
          href: `mailto:${macwall.supportEmail}`,
          kind: "external",
        },
        {
          label: macwallMarketingCopy.hover.links.discord.label,
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
