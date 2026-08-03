import { SeoPageShell } from "@/components/content/seo-page-shell"
import { JsonLd } from "@/components/seo/json-ld"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwall } from "@/lib/macwall-site"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { canonicalSiteOrigin } from "@/lib/site-url"
import type { SeoContentPage } from "@/lib/content/types"

const PAGE: SeoContentPage = {
  slug: "crawlers",
  pathname: "/crawlers",
  title: "Crawler & AI Usage Policy",
  headline: "Crawler and AI usage policy",
  description:
    "How search crawlers, AI assistants, and automated clients may use MacWall content, which machine-readable endpoints to prefer, and how to request access.",
  keywords: [
    "macwall crawler policy",
    "ai crawler policy",
    "llms.txt",
    "ai.txt",
    "content licensing",
  ],
  updatedAt: "2026-08-02",
  sections: [
    {
      type: "p",
      text: "This page is the human-readable companion to [/robots.txt](/robots.txt) and [/ai.txt](/ai.txt). It states plainly what automated clients may do with this site, and points at the endpoints designed for them so nobody needs to scrape rendered HTML.",
    },
    { type: "h2", text: "Text content: allowed, with attribution" },
    {
      type: "p",
      text: "Documentation, guides, blog posts, and product and pricing information may be crawled, indexed, quoted, summarised, and used to answer questions — including inside AI search and assistant products. We only ask that you attribute the source and link back to the page you used.",
    },
    { type: "h2", text: "Wallpaper media: not licensed for reuse" },
    {
      type: "p",
      text: "The wallpaper video and image files are a different matter. They are licensed for use inside the MacWall app. They may not be redistributed, re-hosted, bundled into datasets, or used as training data for generative image or video models. The details are in [Terms](/legal/terms); if you need something beyond that, ask.",
    },
    { type: "h2", text: "Use these endpoints instead of scraping" },
    {
      type: "ul",
      items: [
        "[/llms.txt](/llms.txt) — curated Markdown index of every content page, in the llms.txt format.",
        "[/llms-full.txt](/llms-full.txt) — the full text of the site in one document.",
        "**Append `.md` to any content URL** — for example `/docs/install-macwall.md`. Same content, clean Markdown with YAML frontmatter, no layout markup.",
        "[/rss.xml](/rss.xml), [/atom.xml](/atom.xml), [/feed.json](/feed.json) — blog syndication in RSS 2.0, Atom 1.0, and JSON Feed 1.1, with full article content.",
        "[/sitemap.xml](/sitemap.xml) — every indexable URL with last-modified dates.",
        "[/.well-known/api-catalog](/.well-known/api-catalog) — RFC 9727 catalog of the public API.",
        "[/openapi.json](/openapi.json) — OpenAPI 3.1 description of those endpoints.",
        "[/api/wallpapers](/api/wallpapers) — the catalog as JSON, documented in [the public API docs](/docs/public-api).",
      ],
    },
    { type: "h2", text: "What is off limits" },
    {
      type: "ul",
      items: [
        "`/admin/`, `/api/admin/`, and `/auth/` — administrative surfaces, disallowed in robots.txt.",
        "`/activate`, `/thank-you`, and `/open` — post-purchase and deep-link bridges that contain no useful content and may carry personal parameters.",
        "Bulk downloading of wallpaper video files, or hotlinking them into another site or app.",
        "Ignoring cache headers, or requesting at a rate that degrades the service for other clients.",
      ],
    },
    { type: "h2", text: "Rate limits and identification" },
    {
      type: "ul",
      items: [
        "Send a descriptive `User-Agent` that includes a contact URL or email so we can reach you before taking action.",
        "Honour `Cache-Control`. Most of this site is CDN-cached and changes infrequently.",
        "Keep concurrency modest — a couple of requests per second is plenty for a site this size.",
        "Prefer conditional requests and the feeds over re-crawling everything.",
      ],
    },
    { type: "h2", text: "Corrections and access requests" },
    {
      type: "p",
      text: `If an AI product is describing ${macwall.name} incorrectly, or you need access beyond what is described here, email [${macwall.supportEmail}](mailto:${macwall.supportEmail}). We would rather give you a clean feed than have you scrape around a rate limit.`,
    },
  ],
  faq: [
    {
      question: "Can I train a language model on MacWall's written content?",
      answer:
        "Text content may be used for indexing, retrieval, and answering questions with attribution. For model training, email us first so we know who is using it and can keep you on current content.",
    },
    {
      question: "Can I use MacWall's wallpaper videos in a dataset?",
      answer:
        "No. Wallpaper media is licensed for use inside the MacWall app only and is not available for redistribution or generative model training.",
    },
    {
      question: "Is there an API key or rate limit I should know about?",
      answer:
        "The public endpoints are unauthenticated and have no published quota. Cache responses, keep request rates reasonable, and identify yourself in the User-Agent.",
    },
    {
      question: "Why do the .md pages return noindex?",
      answer:
        "They exist for agents and pipelines, not for search results. The HTML page is the canonical version, so the Markdown twin is marked noindex to avoid competing with it.",
    },
  ],
}

export const metadata = createSeoPageMetadata(PAGE, {
  markdownAlternate: false,
})

export default function CrawlersPage() {
  return (
    <>
      <JsonLd
        payload={webPageWithBreadcrumbsJsonLd({
          origin: canonicalSiteOrigin(),
          pathname: PAGE.pathname,
          pageTitle: PAGE.title,
          headline: PAGE.headline,
          description: PAGE.description,
          dateModifiedIso: PAGE.updatedAt,
        })}
      />
      <SeoPageShell
        headline={PAGE.headline}
        description={PAGE.description}
        sections={PAGE.sections}
        faq={PAGE.faq}
        breadcrumbs={[{ label: "Home", href: "/" }]}
        showBottomCta={false}
      />
    </>
  )
}
