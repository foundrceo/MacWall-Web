import { blogArticles } from "@/lib/blog"
import { BLOG_CATEGORY_LABELS } from "@/lib/content/types"
import type { ContentBlock, SeoContentPage } from "@/lib/content/types"
import { docsPages, docsPagesBySection } from "@/lib/docs/pages"
import { learnPages } from "@/lib/learn/pages"
import {
  macwall,
  macwallBatteryPolicy,
  macwallCreatorDisclosure,
  macwallImportFormatsLabel,
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersion,
  macwallCatalog,
  macwallPermissions,
  macwallPlaybackModes,
  macwallSupportedMacOS,
  macwallTrial,
} from "@/lib/macwall-site"
import { seoPageToMarkdown } from "@/lib/ai/markdown"
import {
  MACWALL_AI_INFO_DESCRIPTION,
  MACWALL_AI_INFO_PATH,
  MACWALL_AI_INFO_TITLE,
  getMacwallAiInfoPage,
} from "@/lib/ai/macwall-ai-info"
import {
  CURRENCY_NOTE,
  LICENSE_TABLE_COLUMNS,
  currentPromotionLines,
  licenseSummarySentence,
  licenseTableRows,
  proPriceText,
} from "@/lib/ai/price-facts"
import { proPriceFor } from "@/lib/pricing/sale-aware-price"
import {
  ABOUT_DESCRIPTION,
  ABOUT_PATH,
  ABOUT_TITLE,
  COMPANY_PAGES_UPDATED_ISO,
  PRESS_DESCRIPTION,
  PRESS_PATH,
  PRESS_TITLE,
  getAboutPage,
  getPressPage,
} from "@/lib/company/about-press"
import { faqMarkdownDocuments } from "@/lib/faq/answers"
import { AFFILIATE_UI_VISIBLE } from "@/lib/macwall-affiliate"
import { macwallCreatorCopy } from "@/lib/macwall-creator-copy"
import { macwallPricingCopy } from "@/lib/macwall-pricing-copy"
import {
  bestLiveWallpaperMacPage,
  downloadPage,
  livelyWallpaperMacPage,
  macwallVsBackdropPage,
  macwallVsWallspacePage,
  screenSaverMacPage,
  wallpaperCategoryPage,
  wallpaperEngineAlternativePage,
} from "@/lib/seo/landing-pages"
import { canonicalSiteOrigin } from "@/lib/site-url"
import { LEGAL_DOCUMENTS } from "@/lib/legal/documents"
import { LEGAL_HUB_DESCRIPTION } from "@/lib/legal/metadata"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { categoryDisplayLabel, galleryIndexSeo } from "@/lib/seo/category-seo"
import { crawlersPage } from "@/lib/seo/crawlers-page"
import { toolSeoPage, tools, toolsHubPage } from "@/lib/tools/tools"
import {
  loadDisplayIndex,
  loadDisplayPage,
  loadMacbookHub,
} from "@/lib/public-catalog/display-wallpapers"
import {
  DISPLAY_PAGES_PATH,
  MACBOOK_HUB_PATH,
  displayIndexDef,
  displayPageDefs,
  displayPagePath,
  macbookHubDef,
} from "@/lib/seo/display-pages"
import { MAC_DISPLAY_SPECS_ACCESSED } from "@/lib/seo/mac-displays"
import {
  compareIndexPage,
  dynamicWallpaperClubPage,
  iwallpaperAlternativePage,
  plashAlternativePage,
  twentyFourHourWallpaperPage,
} from "@/lib/seo/compare-pages"
import { listCollectionWallpapers } from "@/lib/public-catalog/collections"
import type { PublicWallpaper } from "@/lib/public-catalog/types"
import { wallpaperDetailPath } from "@/lib/public-catalog/urls"
import {
  COLLECTION_GRID_LIMIT,
  COLLECTION_GROUP_LABELS,
  COLLECTION_GROUP_ORDER,
  WALLPAPER_COLLECTIONS_HUB_PATH,
  collectionFaq,
  wallpaperCollectionPath,
  collectionPublishable,
  wallpaperCollections,
  type WallpaperCollection,
} from "@/lib/seo/wallpaper-collections"

/**
 * Single registry of every Markdown-representable page on the site.
 *
 * Three surfaces read from this list, so adding a page here automatically
 * exposes it everywhere:
 * - `/llms.txt`: curated index for language models
 * - `/llms-full.txt`: full-text concatenation
 * - `/{path}.md`: Markdown twin of an individual page
 */

export type MarkdownGroup =
  | "product"
  | "pricing"
  | "docs"
  | "faq"
  | "comparisons"
  | "learn"
  | "blog"
  | "wallpapers"
  | "legal"

export const MARKDOWN_GROUP_LABELS: Record<MarkdownGroup, string> = {
  product: "Product",
  pricing: "Pricing",
  docs: "Documentation",
  faq: "FAQ",
  comparisons: "Comparisons & alternatives",
  learn: "Learn",
  blog: "Blog",
  wallpapers: "Wallpaper gallery",
  legal: "Company & legal",
}

/**
 * Order of the llms.txt sections: what MacWall is and costs first, then how
 * to use it, then editorial content, then the gallery hubs. Long listings
 * (each collection, category, display and tool page) and legal text are
 * marked `optional` and go under llms.txt's `## Optional`.
 */
export const MARKDOWN_GROUP_ORDER: readonly MarkdownGroup[] = [
  "product",
  "pricing",
  "docs",
  "faq",
  "comparisons",
  "learn",
  "blog",
  "wallpapers",
  "legal",
] as const

export type MarkdownDocument = {
  /** HTML page this document mirrors, e.g. `/blog/example`. */
  path: string
  title: string
  /** One-line summary used in the `/llms.txt` index. */
  summary: string
  group: MarkdownGroup
  updatedAt?: string
  /** Included in `/llms-full.txt`. Long index/listing pages opt out. */
  includeInFullText: boolean
  /**
   * Listed under `## Optional` in `/llms.txt` (the section a model may skip)
   * instead of under its group: per-item listings and legal text.
   */
  optional?: boolean
  render: () => string | Promise<string>
}

/** `/blog/example` → `/blog/example.md` (root becomes `/index.md`). */
export function markdownPathFor(path: string): string {
  if (path === "/") return "/index.md"
  return `${path}.md`
}

const HOME_DESCRIPTION = `${macwall.name} is a native macOS app for 4K live video wallpapers on the desktop, Lock Screen and screen saver, with hardware-decoded playback, a free 24-hour trial and a one-time Pro license.`

const systemPlayback = macwallPlaybackModes.systemWallpaper
const appPlayback = macwallPlaybackModes.app

/**
 * The home page's twin, built from the same copy the HTML uses
 * (lib/macwall-marketing-copy.ts) plus the shared product constants, and
 * priced at render time.
 */
function homeMarkdownPage(now: number): SeoContentPage {
  const home = macwallMarketingCopy.home
  const playback = home.playback
  const promotions = currentPromotionLines(now)
  return {
    slug: "home",
    pathname: "/",
    title: `${macwall.name}: ${macwall.tagline}`,
    headline: `${macwallMarketingCopy.interact.title} ${macwallMarketingCopy.interact.titleMuted.replace(/\.$/, "")}`,
    description: HOME_DESCRIPTION,
    keywords: [
      "live wallpaper mac",
      "mac video wallpaper app",
      "macos live wallpaper",
      "animated wallpaper mac",
    ],
    updatedAt: macwall.productInfoLastReviewedIso,
    sections: [
      {
        type: "p",
        text: `**${macwall.name}** (${macwall.website}) is a native macOS app that turns video loops into your wallpaper. ${macwallMarketingCopy.interact.heroLead} ${macwallSupportedMacOS.summary}`,
      },
      {
        type: "p",
        text: `${macwall.name} is a native macOS app that plays video loops as your desktop, Lock Screen and screen saver wallpaper: ${macwallCatalog.liveCountLabel} live wallpapers, most in 4K, plus your own videos with Pro. Every Mac gets a ${macwallTrial.name}, then Pro is ${proPriceText("default", now)} once for ${proPriceFor("default", now).macs} Macs. It runs on ${macwallMinimumMacOSVersion} or later; the live Lock Screen needs ${macwallLockScreenMacOSVersion}.`,
      },
      { type: "h2", text: home.showcase.title },
      { type: "p", text: home.showcase.lead },
      {
        type: "ul",
        items: [
          home.showcase.lockScreen,
          home.showcase.music,
          home.showcase.bend,
        ].map((item) => `**${item.eyebrow}**: ${item.body}`),
      },
      { type: "h2", text: playback.title },
      { type: "p", text: playback.lead },
      {
        type: "table",
        columns: [
          "",
          `${playback.modes.system.name} (Settings: ${systemPlayback.setting})`,
          `${playback.modes.app.name} (Settings: ${appPlayback.setting})`,
        ],
        rows: [
          ["Runs on", playback.modes.system.runsOn, playback.modes.app.runsOn],
          ["How it plays", playback.modes.system.body, playback.modes.app.body],
          ...playback.rows.map((row) => ["", row.system.text, row.app.text]),
        ],
        caption: `In ${systemPlayback.marketing} mode ${systemPlayback.cpu}.`,
      },
      { type: "h2", text: home.everything.title },
      {
        type: "ul",
        items: home.everything.items.map(
          (item) => `**${item.title}**: ${item.body}`
        ),
      },
      { type: "h2", text: "Battery and performance" },
      { type: "p", text: macwallBatteryPolicy.summary },
      { type: "p", text: macwallPermissions.summary },
      { type: "h2", text: "Pricing" },
      {
        type: "ul",
        items: [
          `**Free trial**: ${macwallTrial.summary}`,
          `**Pro and Pro+**: ${licenseSummarySentence(now)} No subscription.`,
          ...promotions,
          CURRENCY_NOTE,
          "Every pack and the full terms: [pricing](/pricing).",
        ],
      },
      { type: "h2", text: "Catalog" },
      {
        type: "p",
        text: `${macwallCatalog.liveCountLabel} curated loops across ${macwall.categories.length} categories (${macwall.categories.join(", ")}), browsable in the app or on the web at [macwall.app/wallpapers](/wallpapers). Pro users can add their own ${macwallImportFormatsLabel} videos, or share a loop with the community: a person reviews each upload before it appears in Explore ([how uploads work](/blog/upload-wallpaper-macwall-community)).`,
      },
      { type: "h2", text: "Where to start" },
      {
        type: "ul",
        items: [
          "[Install MacWall](/docs/install-macwall): download, install, first wallpaper.",
          "[Set a live wallpaper](/docs/set-a-live-wallpaper): catalog, per-display setups, Shuffle.",
          "[Performance and battery](/docs/performance-and-battery): every pause rule, and how to verify CPU use.",
          "[FAQ](/faq): short answers on price, battery, the Lock Screen and compatibility.",
          "[What is a live wallpaper?](/learn/what-is-a-live-wallpaper): concepts and terminology.",
        ],
      },
      { type: "h2", text: "Contact" },
      {
        type: "ul",
        items: [
          `Support: [${macwall.supportEmail}](mailto:${macwall.supportEmail})`,
          `Community: [Discord](${macwall.discordInvite})`,
          `Publisher: ${macwall.name} (${macwall.legalCompanyName}). [About](/about) · [Press kit](/press)`,
        ],
      },
    ],
  }
}

const PRICING_TITLE = `${macwall.name} Pricing`
const PRICING_SUMMARY =
  "Free 24-hour trial, a one-time Pro license for 3 Macs and Pro+ packs for 5 or 10 Macs, with India pricing, the current sale and refund terms. No subscription."

/**
 * The /pricing twin, built from the copy the HTML page uses
 * (lib/macwall-pricing-copy.ts) and priced at render time, so it carries the
 * same packs, India prices, sale and FAQ as the page.
 */
function pricingMarkdownPage(now: number): SeoContentPage {
  const copy = macwallPricingCopy
  const promotions = currentPromotionLines(now)
  return {
    slug: "pricing",
    pathname: "/pricing",
    title: PRICING_TITLE,
    headline: copy.heroH1,
    description: `${copy.heroLead} ${macwallTrial.summary}`,
    keywords: [
      "macwall pricing",
      "macwall pro price",
      "live wallpaper app price",
    ],
    updatedAt: macwall.productInfoLastReviewedIso,
    sections: [
      {
        type: "p",
        text: `${macwall.name} is free to download, and every Mac gets one ${macwallTrial.name}. After it, the app is browse-only until you buy. Pro is a **one-time ${proPriceText("default", now)}** for up to ${macwall.maxLicensedMacs} Macs. In India, Pro is ${proPriceText("india", now)}. Nothing renews. ${CURRENCY_NOTE}`,
      },
      ...(promotions.length > 0
        ? ([
            { type: "h2", text: "Sales running now" },
            { type: "ul", items: promotions },
          ] satisfies ContentBlock[])
        : []),
      { type: "h2", text: "Packs and prices" },
      {
        type: "table",
        columns: [...LICENSE_TABLE_COLUMNS],
        rows: licenseTableRows(now),
        caption: `All prices in USD, one time. ${CURRENCY_NOTE}`,
      },
      {
        type: "p",
        text: `**${copy.plans.pro.title}**: ${copy.plans.pro.subtitle}. **${copy.plans.proPlus.title}**: ${copy.plans.proPlus.subtitle}. The annual plan is retired for new purchases.`,
      },
      { type: "h2", text: "What Pro includes" },
      { type: "ul", items: [...copy.pro.features] },
      { type: "h2", text: "What Pro+ adds" },
      { type: "ul", items: [...copy.proPlus.features] },
      { type: "h2", text: "Paying and activating" },
      {
        type: "p",
        text: `Checkout runs through ${macwall.paymentProcessor}; ${macwall.name} never handles card details. Your license key is emailed within seconds, and one click activates it in the app. No account is needed. Full flow: [license and activation](/docs/license-and-activation).`,
      },
      { type: "h2", text: "Getting your money back" },
      {
        type: "p",
        text: `Every license has a ${macwall.refundWindowDays}-day money-back guarantee: email [${macwall.supportEmail}](mailto:${macwall.supportEmail}) within ${macwall.refundWindowDays} days of purchase for a full refund, no reason needed.`,
      },
      {
        type: "p",
        text: `**${copy.reelRefund.title}**: ${copy.reelRefund.description} ${copy.reelRefund.finePrint} Details: [creator program](/creator).`,
      },
    ],
    faq: [...copy.faq, ...copy.supportFaq].map((item) => ({
      question: item.q,
      answer: item.a,
    })),
  }
}

const CREATOR_SUMMARY = `Post a public video about ${macwall.name}, tagged ${macwallCreatorDisclosure.tag}, and get money back: 50% at ${macwall.reelRefundHalfViews.toLocaleString("en-US")} views, 100% at ${macwall.reelRefundFullViews.toLocaleString("en-US")}.`

/** The /creator twin, built from lib/macwall-creator-copy.ts like the page. */
function creatorMarkdownPage(): SeoContentPage {
  const copy = macwallCreatorCopy
  return {
    slug: "creator",
    pathname: "/creator",
    title: `${macwall.name} Reel Refund: Money Back for a Video`,
    headline: copy.heroTitle,
    description: copy.heroLead,
    keywords: ["macwall creator program", "macwall refund views"],
    updatedAt: macwall.productInfoLastReviewedIso,
    sections: [
      { type: "h2", text: "How the Reel refund works" },
      {
        type: "ol",
        items: copy.steps.map((step) => `**${step.title}**: ${step.body}`),
      },
      { type: "p", text: copy.finePrint },
      { type: "h2", text: copy.influencerTitle },
      { type: "p", text: copy.influencerBody },
      { type: "h2", text: copy.closingTitle },
      { type: "p", text: copy.closingBody },
      {
        type: "p",
        text: `Claims: [${macwall.reelRefundEmail}](mailto:${macwall.reelRefundEmail}). Prices and the ${macwall.refundWindowDays}-day money-back guarantee: [pricing](/pricing).`,
      },
    ],
    faq: copy.faq.map((item) => ({ question: item.q, answer: item.a })),
  }
}

const wallpapersIndexPage: SeoContentPage = {
  slug: "wallpapers",
  pathname: "/wallpapers",
  title: galleryIndexSeo.title,
  headline: galleryIndexSeo.headline,
  description: galleryIndexSeo.description,
  keywords: [...galleryIndexSeo.keywords],
  updatedAt: "2026-08-02",
  sections: [
    { type: "p", text: galleryIndexSeo.intro },
    {
      type: "p",
      text: `The web gallery at [macwall.app/wallpapers](/wallpapers) mirrors the in-app catalog: ${macwallCatalog.liveCountLabel} curated loops (most in 4K), searchable and filterable by category, tag, and popularity. Each wallpaper has its own page with a preview, resolution, duration, file size, and a **Set on Mac** deep link that hands it to the installed app.`,
    },
    { type: "h2", text: "Categories" },
    {
      type: "ul",
      items: macwall.categories.map((name) => {
        const page = wallpaperCategoryPage(name)
        return `[${categoryDisplayLabel(name)}](${page.pathname}): ${page.description}`
      }),
    },
    { type: "h2", text: "Collections" },
    {
      type: "p",
      text: `Topic collections group the catalog by what people search for: characters, cars, sports, moods, and space. Index: [wallpaper collections](${WALLPAPER_COLLECTIONS_HUB_PATH}).`,
    },
    {
      type: "ul",
      items: publishedCollections().map(
        (entry) =>
          `[${entry.name} live wallpapers](${wallpaperCollectionPath(entry.slug)}): ${entry.description}`
      ),
    },
    { type: "h2", text: "Machine access" },
    {
      type: "p",
      text: "The same catalog is available as JSON at `/api/wallpapers` with `q`, `category`, `tag`, `sort`, `page`, and `limit` parameters. See [the public API docs](/docs/public-api).",
    },
    {
      type: "p",
      text: "Wallpaper videos are for personal use inside MacWall and may not be redistributed. See [Terms](/legal/terms).",
    },
  ],
}

function blogIndexMarkdown(): string {
  const origin = canonicalSiteOrigin()
  const byCategory = new Map<string, typeof blogArticles>()

  for (const article of blogArticles) {
    const list = byCategory.get(article.category) ?? []
    list.push(article)
    byCategory.set(article.category, list)
  }

  const groups = [...byCategory.entries()]
    .map(([category, articles]) => {
      const label =
        BLOG_CATEGORY_LABELS[category as keyof typeof BLOG_CATEGORY_LABELS] ??
        category
      const items = articles
        .map(
          (article) =>
            `- [${article.title}](${origin}${article.pathname}): ${article.excerpt} (${article.readMinutes} min read${article.publishedAt ? `, published ${article.publishedAt}` : ""})`
        )
        .join("\n")
      return `## ${label}\n\n${items}`
    })
    .join("\n\n")

  return `---
title: "MacWall Blog"
description: "Guides, comparisons, and macOS news about live wallpapers for Mac."
canonical: "${origin}/blog"
---

# MacWall Blog

Guides, comparisons, and macOS news about live wallpapers for Mac. ${blogArticles.length} articles. Feeds: [RSS](${origin}/rss.xml), [Atom](${origin}/atom.xml), [JSON Feed](${origin}/feed.json).

${groups}

---

Source: ${origin}/blog
`
}

function docsIndexMarkdown(): string {
  const origin = canonicalSiteOrigin()
  const groups = docsPagesBySection()
    .map((group) => {
      const items = group.pages
        .map(
          (page) =>
            `- [${page.navLabel}](${origin}${page.pathname}): ${page.description}`
        )
        .join("\n")
      return `## ${group.label}\n\n${items}`
    })
    .join("\n\n")

  return `---
title: "MacWall Documentation"
description: "Install, configure, and troubleshoot MacWall on macOS."
canonical: "${origin}/docs"
---

# MacWall Documentation

Task-oriented guides for installing, configuring, and troubleshooting MacWall. For concepts see [/learn](${origin}/learn); for news and comparisons see [/blog](${origin}/blog).

${groups}

---

Source: ${origin}/docs
`
}

function learnIndexMarkdown(): string {
  const origin = canonicalSiteOrigin()
  const items = learnPages
    .map(
      (page) =>
        `- [${page.navLabel}](${origin}${page.pathname}): ${page.takeaway}`
    )
    .join("\n")

  return `---
title: "Learn: Live Wallpapers on Mac"
description: "Concept explainers for live wallpapers, macOS wallpaper internals, Lock Screen video, Wallpaper Engine on Mac, video codecs, displays, and battery."
canonical: "${origin}/learn"
---

# Learn

Evergreen explainers for how live wallpapers and macOS wallpaper rendering actually work. Product instructions live in [/docs](${origin}/docs).

${items}

---

Source: ${origin}/learn
`
}

async function changelogMarkdown(): Promise<string> {
  const origin = canonicalSiteOrigin()
  const [
    { getChangelogPageData },
    { CHANGELOG_SECTION_LABELS, sortChangelogSections, formatChangelogVersion },
  ] = await Promise.all([
    import("@/lib/changelog/get-changelog-releases"),
    import("@/lib/changelog/types"),
  ])

  let releases: Awaited<ReturnType<typeof getChangelogPageData>>["releases"] =
    []
  try {
    releases = (await getChangelogPageData()).releases
  } catch {
    releases = []
  }

  const body = releases
    .map((release) => {
      const heading = `## ${formatChangelogVersion(release.version, release.build)} (${release.date})`
      const sections = sortChangelogSections(release.sections)
        .map(
          (section) =>
            `### ${CHANGELOG_SECTION_LABELS[section.kind]}\n\n${section.items
              .map((item) => `- ${item}`)
              .join("\n")}`
        )
        .join("\n\n")
      return [heading, sections].filter(Boolean).join("\n\n")
    })
    .join("\n\n")

  return `---
title: "MacWall Changelog"
description: "Every shipped MacWall release, newest first."
canonical: "${origin}/changelog"
---

# MacWall Changelog

Every shipped release, newest first. Mac updates sync from the in-app updater feed; website changes publish automatically when they ship.

${body || "_Release data is temporarily unavailable._"}

---

Source: ${origin}/changelog
`
}

function legalStubMarkdown(input: {
  title: string
  pathname: string
  description: string
}): string {
  const origin = canonicalSiteOrigin()
  return `---
title: "${input.title}"
description: "${input.description}"
canonical: "${origin}${input.pathname}"
updated: "${macwall.legalEffectiveDateIso}"
---

# ${input.title}

${input.description}

Effective ${macwall.legalEffectiveDate}. Published by ${macwall.name}.

The authoritative, complete text of this document is the HTML version at ${origin}${input.pathname}. Read it there, a summary is not a substitute for the policy itself.

Questions: [${macwall.supportEmail}](mailto:${macwall.supportEmail})

---

Source: ${origin}${input.pathname}
`
}

const CONTACT_SUMMARY = `Contact ${macwall.name} support for license keys, activation, billing and refunds by email.`

function contactMarkdown(): string {
  const origin = canonicalSiteOrigin()
  return `---
title: "Contact ${macwall.name}"
description: "${CONTACT_SUMMARY}"
canonical: "${origin}/contact"
---

# Contact ${macwall.name}

${CONTACT_SUMMARY}

- Email: ${macwall.supportEmail}
- Help and troubleshooting: ${origin}/docs

---

Source: ${origin}/contact
`
}

function bendMarkdown(): string {
  const origin = canonicalSiteOrigin()
  const bend = macwallMarketingCopy.landing.bend
  return `---
title: "Bend"
description: "${bend.lead}"
canonical: "${origin}/bend"
---

# ${bend.title}

${bend.lead}

${bend.points.map((point) => `- **${point.title}**: ${point.body}`).join("\n")}

---

Source: ${origin}/bend
`
}

function seoDoc(
  page: SeoContentPage,
  group: MarkdownGroup,
  options: { includeInFullText?: boolean; optional?: boolean } = {}
): MarkdownDocument {
  return {
    path: page.pathname,
    title: page.title,
    summary: page.description,
    group,
    updatedAt: page.updatedAt ?? page.publishedAt,
    includeInFullText: options.includeInFullText ?? true,
    ...(options.optional ? { optional: true } : {}),
    render: () => seoPageToMarkdown(page),
  }
}

/** A display page or the MacBook hub: its copy with the listed wallpapers. */
function displayListMarkdown(data: {
  page: SeoContentPage
  wallpapers: readonly PublicWallpaper[]
}): string {
  const origin = canonicalSiteOrigin()
  const list = data.wallpapers
    .map(
      (w) =>
        `- [${w.name}](${origin}${wallpaperDetailPath(w)})${w.resolution ? ` (${w.resolution})` : ""}`
    )
    .join("\n")
  return seoPageToMarkdown({
    ...data.page,
    sections: [
      ...data.page.sections.slice(0, 1),
      { type: "h2", text: "Wallpapers" },
      { type: "p", text: list },
      ...data.page.sections.slice(1),
    ],
  })
}

/** Collections that are built: likeness topics have no page, so no twin. */
function publishedCollections(): WallpaperCollection[] {
  return wallpaperCollections.filter(collectionPublishable)
}

function collectionsHubMarkdown(): string {
  const origin = canonicalSiteOrigin()
  const groups = COLLECTION_GROUP_ORDER.map((group) => {
    const items = publishedCollections()
      .filter((entry) => entry.group === group)
      .map(
        (entry) =>
          `- [${entry.name} live wallpapers](${origin}${wallpaperCollectionPath(entry.slug)}): ${entry.description}`
      )
      .join("\n")
    return items ? `## ${COLLECTION_GROUP_LABELS[group]}\n\n${items}` : ""
  })
    .filter(Boolean)
    .join("\n\n")

  return `---
title: "Live Wallpaper Collections for Mac"
description: "Curated MacWall live wallpaper collections grouped by character, car, sport, mood, and space."
canonical: "${origin}${WALLPAPER_COLLECTIONS_HUB_PATH}"
---

# Live wallpaper collections for Mac

Hand-picked topic sets from the ${macwall.name} catalog. Each collection lists every matching 4K loop and updates automatically as new wallpapers are published.

${groups}

---

Source: ${origin}${WALLPAPER_COLLECTIONS_HUB_PATH}
`
}

async function collectionMarkdown(entry: WallpaperCollection): Promise<string> {
  let wallpapers: Awaited<ReturnType<typeof listCollectionWallpapers>> = []
  try {
    wallpapers = await listCollectionWallpapers(entry)
  } catch {
    wallpapers = []
  }

  const listed = wallpapers
    .slice(0, COLLECTION_GRID_LIMIT)
    .map(
      (wallpaper) => `[${wallpaper.name}](${wallpaperDetailPath(wallpaper)})`
    )

  return seoPageToMarkdown({
    slug: entry.slug,
    pathname: wallpaperCollectionPath(entry.slug),
    title: entry.title,
    headline: `${entry.name} live wallpapers for Mac`,
    description: entry.description,
    keywords: entry.keywords,
    sections: [
      { type: "p", text: entry.intro },
      {
        type: "h2",
        text: `${wallpapers.length} ${entry.name} wallpapers`,
      },
      listed.length > 0
        ? { type: "ul", items: listed }
        : {
            type: "p",
            text: "The catalog is temporarily unavailable. Browse [the gallery](/wallpapers).",
          },
      { type: "h2", text: `How to set a ${entry.name} live wallpaper on Mac` },
      {
        type: "ol",
        items: [
          `[Download ${macwall.name}](/download) (macOS 15 or later).`,
          `Open any ${entry.name} wallpaper above and choose **Set on Mac**, or search "${entry.name}" in the app.`,
          `Optional: with Pro on ${macwallLockScreenMacOSVersion} or later, use it on the Lock Screen and as a Screen Saver.`,
        ],
      },
    ],
    faq: collectionFaq(entry, wallpapers.length),
  })
}

let cachedDocuments: MarkdownDocument[] | null = null

export function siteMarkdownDocuments(): MarkdownDocument[] {
  if (cachedDocuments) return cachedDocuments

  const documents: MarkdownDocument[] = [
    {
      path: MACWALL_AI_INFO_PATH,
      title: MACWALL_AI_INFO_TITLE,
      summary: MACWALL_AI_INFO_DESCRIPTION,
      group: "product",
      updatedAt: macwall.productInfoLastReviewedIso,
      includeInFullText: true,
      render: () => seoPageToMarkdown(getMacwallAiInfoPage()),
    },
    {
      path: "/",
      title: `${macwall.name}: ${macwall.tagline}`,
      summary: HOME_DESCRIPTION,
      group: "product",
      updatedAt: macwall.productInfoLastReviewedIso,
      includeInFullText: true,
      render: () => seoPageToMarkdown(homeMarkdownPage(Date.now())),
    },
    seoDoc(downloadPage, "product"),
    {
      path: ABOUT_PATH,
      title: ABOUT_TITLE,
      summary: ABOUT_DESCRIPTION,
      group: "product",
      updatedAt: COMPANY_PAGES_UPDATED_ISO,
      includeInFullText: true,
      render: () => seoPageToMarkdown(getAboutPage()),
    },
    {
      path: PRESS_PATH,
      title: PRESS_TITLE,
      summary: PRESS_DESCRIPTION,
      group: "product",
      updatedAt: COMPANY_PAGES_UPDATED_ISO,
      includeInFullText: false,
      render: () => seoPageToMarkdown(getPressPage()),
    },
    {
      path: "/pricing",
      title: PRICING_TITLE,
      summary: PRICING_SUMMARY,
      group: "pricing",
      updatedAt: macwall.productInfoLastReviewedIso,
      includeInFullText: true,
      render: () => seoPageToMarkdown(pricingMarkdownPage(Date.now())),
    },
    {
      path: "/changelog",
      title: "MacWall Changelog",
      summary:
        "Every shipped MacWall release with highlights, features, improvements, and fixes.",
      group: "product",
      includeInFullText: false,
      render: changelogMarkdown,
    },
    {
      path: "/creator",
      title: "Reel Refund Program",
      summary: CREATOR_SUMMARY,
      group: "pricing",
      updatedAt: macwall.productInfoLastReviewedIso,
      includeInFullText: true,
      render: () => seoPageToMarkdown(creatorMarkdownPage()),
    },
    // The affiliate page stays reachable but is hidden from the site chrome
    // until the program reopens; list it only when the links are back.
    ...(AFFILIATE_UI_VISIBLE
      ? [
          {
            path: "/affiliate",
            title: "Affiliate Program",
            summary:
              "Earn commission for every MacWall license you refer, with tracked links and self-serve payouts.",
            group: "pricing" as const,
            updatedAt: "2026-08-02",
            includeInFullText: true,
            render: () =>
              seoPageToMarkdown({
                slug: "affiliate",
                pathname: "/affiliate",
                title: "MacWall Affiliate Program",
                headline: "Affiliate program",
                description:
                  "Earn commission for every MacWall license you refer, with tracked links and self-serve payouts.",
                keywords: ["macwall affiliate", "mac app affiliate program"],
                updatedAt: "2026-08-02",
                sections: [
                  {
                    type: "p",
                    text: "Sign up at [/affiliate](/affiliate) to get a tracked referral link. Referrals are attributed automatically at checkout, and commission and payouts are managed from your affiliate dashboard.",
                  },
                  {
                    type: "p",
                    text: `Questions about the program: [${macwall.supportEmail}](mailto:${macwall.supportEmail}).`,
                  },
                ],
              }),
          } satisfies MarkdownDocument,
        ]
      : []),

    {
      path: "/docs",
      title: "MacWall Documentation",
      summary:
        "Task-oriented guides for installing, configuring, and troubleshooting MacWall on macOS.",
      group: "docs",
      includeInFullText: false,
      render: docsIndexMarkdown,
    },
    ...docsPages.map((page) => seoDoc(page, "docs")),

    ...faqMarkdownDocuments().map((doc): MarkdownDocument => ({
      ...doc,
      group: "faq",
    })),

    {
      path: "/learn",
      title: "Learn: Live Wallpapers on Mac",
      summary:
        "Concept explainers for live wallpapers, macOS wallpaper internals, Lock Screen video, Wallpaper Engine on Mac, codecs, displays, and battery.",
      group: "learn",
      includeInFullText: false,
      render: learnIndexMarkdown,
    },
    ...learnPages.map((page) => seoDoc(page, "learn")),

    {
      path: "/blog",
      title: "MacWall Blog",
      summary: `All ${blogArticles.length} articles: guides, comparisons, and macOS news about live wallpapers.`,
      group: "blog",
      includeInFullText: false,
      render: blogIndexMarkdown,
    },
    ...blogArticles.map((article) => ({
      path: article.pathname,
      title: article.title,
      summary: article.excerpt,
      group: "blog" as const,
      updatedAt: article.updatedAt ?? article.publishedAt,
      includeInFullText: true,
      render: () =>
        seoPageToMarkdown(article, {
          category: BLOG_CATEGORY_LABELS[article.category] ?? article.category,
          readMinutes: article.readMinutes,
        }),
    })),

    seoDoc(wallpapersIndexPage, "wallpapers", { includeInFullText: false }),
    {
      path: WALLPAPER_COLLECTIONS_HUB_PATH,
      title: "Live Wallpaper Collections for Mac",
      summary:
        "Curated live wallpaper collections: anime characters, heroes, cars, sports, moods, and space.",
      group: "wallpapers",
      includeInFullText: false,
      render: collectionsHubMarkdown,
    },
    ...publishedCollections().map((entry): MarkdownDocument => ({
      path: wallpaperCollectionPath(entry.slug),
      title: entry.title,
      summary: entry.description,
      group: "wallpapers",
      includeInFullText: false,
      optional: true,
      render: () => collectionMarkdown(entry),
    })),
    ...macwall.categories.map((name) =>
      seoDoc(wallpaperCategoryPage(name), "wallpapers", {
        includeInFullText: false,
        optional: true,
      })
    ),

    seoDoc(bestLiveWallpaperMacPage, "comparisons"),
    seoDoc(wallpaperEngineAlternativePage, "comparisons"),
    seoDoc(macwallVsBackdropPage, "comparisons"),
    seoDoc(macwallVsWallspacePage, "comparisons"),
    seoDoc(iwallpaperAlternativePage, "comparisons"),
    seoDoc(screenSaverMacPage, "product"),
    seoDoc(livelyWallpaperMacPage, "comparisons"),
    seoDoc(twentyFourHourWallpaperPage, "comparisons"),
    seoDoc(plashAlternativePage, "comparisons"),
    seoDoc(dynamicWallpaperClubPage, "comparisons"),
    seoDoc(compareIndexPage, "comparisons"),
    seoDoc(toolsHubPage, "product"),
    ...tools.map((tool) =>
      seoDoc(toolSeoPage(tool), "product", { optional: true })
    ),
    ...displayPageDefs.map((def): MarkdownDocument => ({
      path: displayPagePath(def.slug),
      title: def.title,
      summary: def.description,
      group: "wallpapers",
      updatedAt: MAC_DISPLAY_SPECS_ACCESSED,
      includeInFullText: false,
      optional: true,
      render: async () => {
        const data = await loadDisplayPage(def.slug)
        return data ? displayListMarkdown(data) : ""
      },
    })),
    {
      path: MACBOOK_HUB_PATH,
      title: macbookHubDef.title,
      summary: macbookHubDef.description,
      group: "wallpapers",
      updatedAt: MAC_DISPLAY_SPECS_ACCESSED,
      includeInFullText: false,
      render: async () => {
        const data = await loadMacbookHub()
        return data ? displayListMarkdown(data) : ""
      },
    },
    {
      path: DISPLAY_PAGES_PATH,
      title: displayIndexDef.title,
      summary: displayIndexDef.description,
      group: "wallpapers",
      updatedAt: MAC_DISPLAY_SPECS_ACCESSED,
      includeInFullText: false,
      render: async () => seoPageToMarkdown((await loadDisplayIndex()).page),
    },

    {
      path: "/legal",
      title: "Legal",
      summary: LEGAL_HUB_DESCRIPTION,
      group: "legal",
      updatedAt: macwall.legalEffectiveDateIso,
      includeInFullText: false,
      optional: true,
      render: () =>
        legalStubMarkdown({
          title: `${macwall.name} Legal`,
          pathname: "/legal",
          description: LEGAL_HUB_DESCRIPTION,
        }),
    },
    ...LEGAL_DOCUMENTS.map((doc): MarkdownDocument => ({
      path: doc.href,
      title: doc.title,
      summary: doc.metaDescription,
      group: "legal",
      updatedAt: macwall.legalEffectiveDateIso,
      includeInFullText: false,
      optional: true,
      render: () =>
        legalStubMarkdown({
          title: `${macwall.name} ${doc.title}`,
          pathname: doc.href,
          description: doc.metaDescription,
        }),
    })),
    {
      path: "/contact",
      title: `Contact ${macwall.name}`,
      summary: CONTACT_SUMMARY,
      group: "product",
      updatedAt: macwall.productInfoLastReviewedIso,
      includeInFullText: false,
      render: () => contactMarkdown(),
    },
    {
      path: "/bend",
      title: "Bend",
      summary: macwallMarketingCopy.landing.bend.lead,
      group: "product",
      updatedAt: macwall.productInfoLastReviewedIso,
      includeInFullText: true,
      render: () => bendMarkdown(),
    },
    seoDoc(crawlersPage, "product", { includeInFullText: false }),
  ]

  cachedDocuments = documents
  return documents
}

export function findMarkdownDocument(
  path: string
): MarkdownDocument | undefined {
  const normalized =
    path === "" || path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}`
  return siteMarkdownDocuments().find((doc) => doc.path === normalized)
}

/** Documents per group, in llms.txt order, without the `optional` ones. */
export function markdownDocumentsByGroup(): {
  group: MarkdownGroup
  label: string
  documents: MarkdownDocument[]
}[] {
  const all = siteMarkdownDocuments().filter((doc) => !doc.optional)
  return MARKDOWN_GROUP_ORDER.map((group) => ({
    group,
    label: MARKDOWN_GROUP_LABELS[group],
    documents: all.filter((doc) => doc.group === group),
  })).filter((entry) => entry.documents.length > 0)
}

/** The `## Optional` section of llms.txt: listings and legal text, in group order. */
export function optionalMarkdownDocuments(): MarkdownDocument[] {
  const all = siteMarkdownDocuments().filter((doc) => doc.optional)
  return MARKDOWN_GROUP_ORDER.flatMap((group) =>
    all.filter((doc) => doc.group === group)
  )
}
