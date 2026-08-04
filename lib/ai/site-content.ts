import { blogArticles } from "@/lib/blog"
import { BLOG_CATEGORY_LABELS } from "@/lib/content/types"
import type { SeoContentPage } from "@/lib/content/types"
import { docsPages, docsPagesBySection } from "@/lib/docs/pages"
import { learnPages } from "@/lib/learn/pages"
import {
  macwall,
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersionLabel,
} from "@/lib/macwall-site"
import { seoPageToMarkdown } from "@/lib/ai/markdown"
import {
  bestLiveWallpaperMacPage,
  downloadPage,
  livelyWallpaperMacPage,
  macwallVsBackdropPage,
  macwallVsWallspacePage,
  wallpaperCategoryPage,
  wallpaperEngineAlternativePage,
} from "@/lib/seo/landing-pages"
import { canonicalSiteOrigin } from "@/lib/site-url"

/**
 * Single registry of every Markdown-representable page on the site.
 *
 * Three surfaces read from this list, so adding a page here automatically
 * exposes it everywhere:
 * - `/llms.txt` — curated index for language models
 * - `/llms-full.txt` — full-text concatenation
 * - `/{path}.md` — Markdown twin of an individual page
 */

export type MarkdownGroup =
  | "product"
  | "docs"
  | "learn"
  | "blog"
  | "wallpapers"
  | "comparisons"
  | "legal"

export const MARKDOWN_GROUP_LABELS: Record<MarkdownGroup, string> = {
  product: "Product",
  docs: "Documentation",
  learn: "Learn",
  blog: "Blog",
  wallpapers: "Wallpaper gallery",
  comparisons: "Comparisons & alternatives",
  legal: "Company & legal",
}

export const MARKDOWN_GROUP_ORDER: readonly MarkdownGroup[] = [
  "product",
  "docs",
  "learn",
  "blog",
  "wallpapers",
  "comparisons",
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
  render: () => string | Promise<string>
}

/** `/blog/example` → `/blog/example.md` (root becomes `/index.md`). */
export function markdownPathFor(path: string): string {
  if (path === "/") return "/index.md"
  return `${path}.md`
}

const homePage: SeoContentPage = {
  slug: "home",
  pathname: "/",
  title: `${macwall.name} — ${macwall.tagline}`,
  headline: `${macwall.name}: live wallpapers for Mac`,
  description: `${macwall.name} is a native macOS app for 4K live video wallpapers, with hardware-decoded playback, automatic pausing, live Lock Screen on ${macwallLockScreenMacOSVersion}+, and a one-time ${macwall.pro.price} license.`,
  keywords: [
    "live wallpaper mac",
    "mac video wallpaper app",
    "macos live wallpaper",
    "animated wallpaper mac",
  ],
  updatedAt: "2026-08-02",
  sections: [
    {
      type: "p",
      text: `**${macwall.name}** (${macwall.website}) is a native macOS app that turns 4K video loops into your desktop wallpaper. It is written in Swift, decodes video on Apple's media engine rather than the CPU, and lives in the menu bar instead of the Dock. ${macwallMinimumMacOSVersionLabel}; live Lock Screen and Screen Saver motion requires ${macwallLockScreenMacOSVersion} or later.`,
    },
    { type: "h2", text: "What it does" },
    { type: "ul", items: [...macwall.proIncludedFeatures] },
    { type: "h2", text: "Pricing" },
    {
      type: "ul",
      items: [
        `**Free** — download and use with a rotating selection of wallpapers, plus unlimited imports of your own videos. No account required.`,
        `**Pro (permanent license)** — ${macwall.pro.price} one time, activates on up to ${macwall.maxLicensedMacs} Macs, lifetime updates, no subscription.`,
        `**Pro annual** — ${macwall.annual.price} ${macwall.annual.suffix} for anyone who prefers a smaller upfront cost.`,
        `**Pro+ pack** — raises the activation limit for studios, labs, and families. See [pricing](/pricing).`,
      ],
    },
    { type: "h2", text: "Catalog" },
    {
      type: "p",
      text: `Over 1,000 curated loops across ${macwall.categories.length} categories — ${macwall.categories.join(", ")} — browsable in the app or on the web at [macwall.app/wallpapers](/wallpapers). Community members publish new wallpapers through [/submit](/submit).`,
    },
    { type: "h2", text: "Performance model" },
    {
      type: "p",
      text: "Frames are decoded by VideoToolbox and composited with Metal, so a 4K loop typically costs well under 1% CPU. Playback pauses automatically on battery, in full-screen apps, on display sleep, in Low Power Mode, and when system load spikes — a paused wallpaper decodes nothing at all.",
    },
    { type: "h2", text: "Where to start" },
    {
      type: "ul",
      items: [
        "[Install MacWall](/docs/install-macwall) — download, install, first wallpaper.",
        "[Set a live wallpaper](/docs/set-a-live-wallpaper) — catalog, per-display setups, playlists.",
        "[Performance and battery](/docs/performance-and-battery) — every pause rule, and how to verify CPU use.",
        "[What is a live wallpaper?](/learn/what-is-a-live-wallpaper) — concepts and terminology.",
        "[Complete guide](/blog/what-is-macwall-complete-guide) — the long-form overview.",
      ],
    },
    { type: "h2", text: "Contact" },
    {
      type: "ul",
      items: [
        `Support: [${macwall.supportEmail}](mailto:${macwall.supportEmail})`,
        `Community: [Discord](${macwall.discordInvite})`,
        `Publisher: ${macwall.legalCompanyName}`,
      ],
    },
  ],
}

const wallpapersIndexPage: SeoContentPage = {
  slug: "wallpapers",
  pathname: "/wallpapers",
  title: `Live Wallpaper Gallery for Mac | ${macwall.name}`,
  headline: "Live wallpaper gallery",
  description:
    "Browse the full MacWall catalog of 4K live wallpapers for Mac by category, search, or popularity, then set any loop straight to your desktop.",
  keywords: [
    "live wallpaper gallery mac",
    "4k live wallpapers",
    "mac video wallpapers",
  ],
  updatedAt: "2026-08-02",
  sections: [
    {
      type: "p",
      text: `The web gallery at [macwall.app/wallpapers](/wallpapers) mirrors the in-app catalog: over 1,000 curated 4K loops, searchable and filterable by category, tag, and popularity. Each wallpaper has its own page with a preview, resolution, duration, file size, and a **Set on Mac** deep link that hands it to the installed app.`,
    },
    { type: "h2", text: "Categories" },
    {
      type: "ul",
      items: macwall.categories.map((name) => {
        const page = wallpaperCategoryPage(name)
        return `[${name}](${page.pathname}) — ${page.description}`
      }),
    },
    { type: "h2", text: "Machine access" },
    {
      type: "p",
      text: "The same catalog is available as JSON at `/api/wallpapers` with `q`, `category`, `tag`, `sort`, `page`, and `limit` parameters. See [the public API docs](/docs/public-api).",
    },
    {
      type: "p",
      text: "Wallpaper videos are licensed for use inside MacWall and are not redistributable — see [Terms](/legal/terms).",
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
            `- [${article.title}](${origin}${article.pathname}) — ${article.excerpt} (${article.readMinutes} min read${article.publishedAt ? `, published ${article.publishedAt}` : ""})`
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
            `- [${page.navLabel}](${origin}${page.pathname}) — ${page.description}`
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
        `- [${page.navLabel}](${origin}${page.pathname}) — ${page.takeaway}`
    )
    .join("\n")

  return `---
title: "Learn: Live Wallpapers on Mac"
description: "Concept explainers for live wallpapers, macOS wallpaper internals, video codecs, displays, and battery."
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
      const heading = `## ${formatChangelogVersion(release.version, release.build)} — ${release.date}`
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

Effective ${macwall.legalEffectiveDate}. Published by ${macwall.legalCompanyName}.

The authoritative, complete text of this document is the HTML version at ${origin}${input.pathname}. Read it there — a summary is not a substitute for the policy itself.

Questions: [${macwall.supportEmail}](mailto:${macwall.supportEmail})

---

Source: ${origin}${input.pathname}
`
}

function seoDoc(
  page: SeoContentPage,
  group: MarkdownGroup,
  options: { includeInFullText?: boolean } = {}
): MarkdownDocument {
  return {
    path: page.pathname,
    title: page.title,
    summary: page.description,
    group,
    updatedAt: page.updatedAt ?? page.publishedAt,
    includeInFullText: options.includeInFullText ?? true,
    render: () => seoPageToMarkdown(page),
  }
}

let cachedDocuments: MarkdownDocument[] | null = null

export function siteMarkdownDocuments(): MarkdownDocument[] {
  if (cachedDocuments) return cachedDocuments

  const documents: MarkdownDocument[] = [
    seoDoc(homePage, "product"),
    seoDoc(downloadPage, "product"),
    {
      path: "/pricing",
      title: `${macwall.name} Pricing`,
      summary: `One-time ${macwall.pro.price} permanent license, optional ${macwall.annual.price} annual plan, and the Pro+ multi-Mac pack. No subscription required.`,
      group: "product",
      updatedAt: "2026-08-02",
      includeInFullText: true,
      render: () =>
        seoPageToMarkdown({
          slug: "pricing",
          pathname: "/pricing",
          title: `${macwall.name} Pricing`,
          headline: `${macwall.name} pricing`,
          description: `One-time ${macwall.pro.price} permanent investment, optional ${macwall.annual.price} annual program, and the Pro+ multi-Mac pack. No subscription required.`,
          keywords: [
            "macwall pricing",
            "macwall pro price",
            "live wallpaper app price",
          ],
          updatedAt: "2026-08-02",
          sections: [
            {
              type: "p",
              text: `${macwall.name} is complimentary to download and use. Pro unlocks the complete cloud catalog and Pro-only benefits with a **one-time ${macwall.pro.price} investment** — not a subscription. Values are shown in your local currency where supported; checkout is handled by Stripe with secure payment.`,
            },
            { type: "h2", text: "Programs" },
            {
              type: "ul",
              items: [
                "**Complimentary** — install with no account, use a rotating wallpaper selection, and import unlimited videos of your own.",
                `**Permanent license** — ${macwall.pro.price} once. Activates on up to ${macwall.maxLicensedMacs} Macs, includes lifetime updates and future Pro benefits.`,
                `**Annual** — ${macwall.annual.price} ${macwall.annual.suffix}, for a lower upfront investment.`,
                "**Pro+ program** — raises the activation limit for studios, labs, and families.",
              ],
            },
            { type: "h2", text: "What Pro includes" },
            { type: "ul", items: [...macwall.pro.features] },
            { type: "h2", text: "Investing and activating" },
            {
              type: "p",
              text: "Checkout runs through Stripe; MacWall never handles card details. Secure payment is verified server-side before your license key is released, then one click activates it in the app. Full flow: [license and activation](/docs/license-and-activation).",
            },
            { type: "h2", text: "Getting your investment back" },
            {
              type: "p",
              text: `If MacWall does not work on your Mac, email [${macwall.supportEmail}](mailto:${macwall.supportEmail}) for assistance. Separately, the [creator program](/creator) resolves your investment in full for a MacWall video that reaches ${macwall.reelRefundFullViews.toLocaleString("en-US")} reach, or half at ${macwall.reelRefundHalfViews.toLocaleString("en-US")}.`,
            },
          ],
          faq: [
            {
              question: `Is ${macwall.name} a subscription?`,
              answer: `No. The permanent license is a single ${macwall.pro.price} investment with lifetime updates. An annual program exists only as a lower-upfront alternative.`,
            },
            {
              question: "How many Macs does one license cover?",
              answer: `Up to ${macwall.maxLicensedMacs} Macs you own, and you can deactivate a machine at any time to free a slot. The Pro+ program raises the limit.`,
            },
          ],
        }),
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
      path: "/submit",
      title: "Submit a Wallpaper",
      summary:
        "Publish your own 4K loop to the MacWall community catalog — requirements, review process, and credit.",
      group: "product",
      updatedAt: "2026-08-02",
      includeInFullText: true,
      render: () =>
        seoPageToMarkdown({
          slug: "submit",
          pathname: "/submit",
          title: "Submit a Wallpaper to MacWall",
          headline: "Submit a wallpaper",
          description:
            "Publish your own 4K loop to the MacWall community catalog — requirements, review process, and credit.",
          keywords: ["submit wallpaper", "macwall community upload"],
          updatedAt: "2026-08-02",
          sections: [
            {
              type: "p",
              text: "Anyone can contribute a wallpaper to the MacWall catalog at [/submit](/submit). Submissions are reviewed by a human before publishing, and published wallpapers become browsable in the app and on the web gallery.",
            },
            { type: "h2", text: "What makes a submission pass review" },
            {
              type: "ul",
              items: [
                "**Seamless loop** — the last frame flows into the first with no visible cut.",
                "**4K where possible** — 3840×2160, H.264 or HEVC in an MP4 container.",
                "**Calm motion** — slow, ambient movement. Fast or flashing footage is rejected.",
                "**No audio track** — wallpaper audio is never played.",
                "**No text, logos, or watermarks** baked into the frame.",
                "**Rights to the footage** — your own work, or content you are licensed to distribute.",
              ],
            },
            {
              type: "p",
              text: `Encoding guidance lives in [video formats and codecs](/learn/video-formats-and-codecs). Community discussion and feedback happen on [Discord](${macwall.discordInvite}).`,
            },
          ],
        }),
    },
    {
      path: "/creator",
      title: "Creator Refund Program",
      summary: `Post a MacWall video and get your purchase refunded — 50% at ${macwall.reelRefundHalfViews.toLocaleString("en-US")} views, 100% at ${macwall.reelRefundFullViews.toLocaleString("en-US")}.`,
      group: "product",
      updatedAt: "2026-08-02",
      includeInFullText: true,
      render: () =>
        seoPageToMarkdown({
          slug: "creator",
          pathname: "/creator",
          title: "MacWall Creator Refund Program",
          headline: "Creator refund program",
          description: `Post a MacWall video and get your purchase refunded — 50% at ${macwall.reelRefundHalfViews.toLocaleString("en-US")} views, 100% at ${macwall.reelRefundFullViews.toLocaleString("en-US")}.`,
          keywords: ["macwall creator program", "macwall refund views"],
          updatedAt: "2026-08-02",
          sections: [
            {
              type: "p",
              text: `Make a short video featuring ${macwall.name}, post it publicly, and we refund your license based on views: **50% at ${macwall.reelRefundHalfViews.toLocaleString("en-US")} views**, **100% at ${macwall.reelRefundFullViews.toLocaleString("en-US")} views**. Full terms and the claim form are at [/creator](/creator).`,
            },
            { type: "h2", text: "How to claim" },
            {
              type: "ol",
              items: [
                `Post your video on Instagram or TikTok, tag ${macwall.reelRefundInstagram} or ${macwall.reelRefundTiktok}, and include ${macwall.reelRefundHashtag}.`,
                "Wait for the view count to cross a threshold.",
                `Email [${macwall.reelRefundEmail}](mailto:${macwall.reelRefundEmail}) with the video link and your purchase email.`,
                "We verify the views and refund to your original payment method.",
              ],
            },
          ],
        }),
    },
    {
      path: "/affiliate",
      title: "Affiliate Program",
      summary:
        "Earn commission for every MacWall license you refer, with tracked links and self-serve payouts.",
      group: "product",
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
    },

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

    {
      path: "/learn",
      title: "Learn: Live Wallpapers on Mac",
      summary:
        "Concept explainers for live wallpapers, macOS wallpaper internals, codecs, displays, and battery.",
      group: "learn",
      includeInFullText: false,
      render: learnIndexMarkdown,
    },
    ...learnPages.map((page) => seoDoc(page, "learn")),

    {
      path: "/blog",
      title: "MacWall Blog",
      summary: `All ${blogArticles.length} articles — guides, comparisons, and macOS news about live wallpapers.`,
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
    ...macwall.categories.map((name) =>
      seoDoc(wallpaperCategoryPage(name), "wallpapers", {
        includeInFullText: false,
      })
    ),

    seoDoc(bestLiveWallpaperMacPage, "comparisons"),
    seoDoc(wallpaperEngineAlternativePage, "comparisons"),
    seoDoc(macwallVsBackdropPage, "comparisons"),
    seoDoc(macwallVsWallspacePage, "comparisons"),
    seoDoc(livelyWallpaperMacPage, "comparisons"),

    {
      path: "/legal",
      title: "Legal",
      summary:
        "MacWall legal center — terms, privacy, cookies, refunds, DMCA, GDPR, CCPA, and security.",
      group: "legal",
      updatedAt: macwall.legalEffectiveDateIso,
      includeInFullText: false,
      render: () =>
        legalStubMarkdown({
          title: `${macwall.name} Legal`,
          pathname: "/legal",
          description:
            "Legal policies for the MacWall macOS app and website, including privacy, terms, DMCA, and data-protection rights.",
        }),
    },
    {
      path: "/legal/privacy",
      title: "Privacy Policy",
      summary:
        "What MacWall collects, how licensing and analytics data are handled, and your data-protection rights.",
      group: "legal",
      updatedAt: macwall.legalEffectiveDateIso,
      includeInFullText: false,
      render: () =>
        legalStubMarkdown({
          title: `${macwall.name} Privacy Policy`,
          pathname: "/legal/privacy",
          description:
            "How MacWall collects, uses, stores, and shares information across the macOS app and website, including licensing, analytics, and your data-protection rights.",
        }),
    },
    {
      path: "/legal/terms",
      title: "Terms of Service",
      summary:
        "License grant, acceptable use, wallpaper content rights, payment terms, and refunds.",
      group: "legal",
      updatedAt: macwall.legalEffectiveDateIso,
      includeInFullText: false,
      render: () =>
        legalStubMarkdown({
          title: `${macwall.name} Terms of Service`,
          pathname: "/legal/terms",
          description:
            "The terms covering your MacWall license, acceptable use, wallpaper content rights, payments, and refunds.",
        }),
    },
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

export function markdownDocumentsByGroup(): {
  group: MarkdownGroup
  label: string
  documents: MarkdownDocument[]
}[] {
  const all = siteMarkdownDocuments()
  return MARKDOWN_GROUP_ORDER.map((group) => ({
    group,
    label: MARKDOWN_GROUP_LABELS[group],
    documents: all.filter((doc) => doc.group === group),
  })).filter((entry) => entry.documents.length > 0)
}
