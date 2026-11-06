import { AFFILIATE_UI_VISIBLE } from "@/lib/macwall-affiliate"
import {
  LEGAL_DOCUMENTS,
  LEGAL_HUB_HREF,
  type LegalDocumentSlug,
} from "@/lib/legal/documents"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { macwall } from "@/lib/macwall-site"
import { categorySlugFromName } from "@/lib/seo/category-slugs"
import { displayRelatedLinks } from "@/lib/seo/display-pages"

export type SiteFooterLink = Readonly<{ href: string; label: string }>

export type SiteFooterColumn = Readonly<{
  title: string
  links: readonly SiteFooterLink[]
}>

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

/**
 * The shorter Product → Resources → Legal columns the /footer-lab design
 * candidates use (marketing-footer.tsx). The live footer uses
 * getSiteFooterColumns below.
 */
export function getMarketingFooterColumns(): readonly MarketingFooterColumn[] {
  const foot = macwallMarketingCopy.footer

  return [
    {
      title: "Product",
      links: [
        { label: "Download", href: "/download" },
        { label: "Wallpapers", href: "/wallpapers" },
        { label: "Collections", href: "/wallpapers/collections" },
        { label: "Bend", href: "/bend" },
        { label: foot.shop.pricing, href: "/pricing" },
        { label: "Reel Refund", href: "/creator" },
        ...(AFFILIATE_UI_VISIBLE
          ? [{ label: foot.connect.affiliate, href: "/affiliate" }]
          : []),
      ],
    },
    {
      title: "Resources",
      links: [
        { label: macwallMarketingCopy.header.navSupport, href: "/docs" },
        { label: "Contact", href: "/contact" },
        { label: foot.explore.blog, href: "/blog" },
        { label: "Learn", href: "/learn" },
        { label: "Free Tools", href: "/tools" },
        { label: "Changelog", href: "/changelog" },
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

/** Footer shows only the binding essentials: the rest lives on the /legal hub. */
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

/**
 * Comparison pages. The footer is the only sitewide link most of them get, so
 * every one that targets a search query is here: the two hubs first.
 */
export const footerCompareLinks: readonly SiteFooterLink[] = [
  { href: "/best-live-wallpaper-mac", label: "Best live wallpaper apps" },
  { href: "/compare", label: "All Mac wallpaper apps" },
  { href: "/alternatives/wallpaper-engine", label: "Wallpaper Engine for Mac" },
  { href: "/alternatives/macwall-vs-backdrop", label: "MacWall vs Backdrop" },
  { href: "/alternatives/macwall-vs-wallspace", label: "MacWall vs Wallspace" },
  { href: "/alternatives/plash", label: "Plash alternative" },
  {
    href: "/alternatives/lively-wallpaper-mac",
    label: "Lively Wallpaper for Mac",
  },
  { href: "/alternatives/24-hour-wallpaper", label: "24 Hour Wallpaper" },
  { href: "/alternatives/iwallpaper", label: "iWallpaper vs MacWall" },
  { href: "/screen-saver-mac", label: "Live screen savers" },
]

/**
 * Wallpapers by Mac: the MacBook hub, each display page (resolution-matched)
 * and the index of every Mac display, from lib/seo/display-pages.ts.
 */
export const footerDisplayLinks: readonly SiteFooterLink[] =
  displayRelatedLinks()

/** Every catalog category hub, so each one is a click away from any page. */
export const footerCategoryLinks: readonly SiteFooterLink[] =
  macwall.categories.flatMap((name) => {
    const slug = categorySlugFromName(name)
    if (!slug) return []
    const label = name === "Others" ? "Other wallpapers" : `${name} wallpapers`
    return [{ href: `/wallpapers/${slug}`, label }]
  })

/** Files and machine-readable pages: one "Developers" line in the bottom bar. */
export const footerDeveloperLinks: readonly SiteFooterLink[] = [
  { href: "/docs/public-api", label: "Public API" },
  { href: "/ai-info", label: "AI product info" },
  { href: "/llms.txt", label: "llms.txt" },
  { href: "/llms-full.txt", label: "llms-full.txt" },
]

/**
 * The live footer's link columns (SiteFooter). Product and Browse lead with
 * the pages people buy from and browse; the SEO hubs (displays, comparisons,
 * Learn, the FAQ) sit here because a footer link is the one internal link
 * every page on the site gives them. /affiliate stays out while
 * AFFILIATE_UI_VISIBLE is false.
 */
export function getSiteFooterColumns(): readonly SiteFooterColumn[] {
  return [
    {
      title: "Product",
      links: [
        { href: "/download", label: "Download" },
        { href: "/pricing", label: "Pricing" },
        { href: "/wallpapers", label: "Wallpapers" },
        { href: "/wallpapers/collections", label: "Collections" },
        { href: "/bend", label: "Bend" },
        { href: "/creator", label: "Reel Refund" },
        { href: "/changelog", label: "Changelog" },
        ...(AFFILIATE_UI_VISIBLE
          ? [{ href: "/affiliate", label: "Affiliates" }]
          : []),
      ],
    },
    { title: "Browse", links: footerCategoryLinks },
    { title: "Wallpapers by Mac", links: footerDisplayLinks },
    { title: "Compare", links: footerCompareLinks },
    {
      title: "Resources",
      links: [
        { href: "/docs", label: "Help center" },
        { href: "/faq", label: "FAQ" },
        { href: "/learn", label: "Learn" },
        { href: "/blog", label: "Blog" },
        { href: "/tools", label: "Free tools" },
        { href: "/contact", label: "Contact us" },
        { href: "/about", label: "About" },
        { href: "/press", label: "Press kit" },
        { href: macwall.discordInvite, label: "Discord" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/legal/privacy", label: "Privacy Policy" },
        { href: "/legal/terms", label: "Terms of Service" },
        { href: "/legal/refund", label: "Refund Policy" },
        { href: LEGAL_HUB_HREF, label: "All policies" },
      ],
    },
  ]
}
