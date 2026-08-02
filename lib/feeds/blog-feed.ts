import { blogArticles } from "@/lib/blog"
import { blogTilePoster } from "@/lib/blog/tile-media"
import { BLOG_CATEGORY_LABELS } from "@/lib/content/types"
import type { BlogArticle } from "@/lib/content/types"
import {
  cdata,
  contentBlocksToHtml,
  escapeXml,
  faqToHtml,
} from "@/lib/feeds/content-html"
import { macwall } from "@/lib/macwall-site"
import { canonicalSiteOrigin } from "@/lib/site-url"

/**
 * Blog syndication in the three formats readers and agents actually consume:
 * RSS 2.0, Atom 1.0, and JSON Feed 1.1. All three are generated from the same
 * item list so they never drift apart.
 */

export const FEED_TITLE = `${macwall.name} Blog`
export const FEED_DESCRIPTION =
  "Guides, comparisons, and macOS news about live wallpapers for Mac, from the MacWall team."

export const FEED_PATHS = {
  rss: "/rss.xml",
  atom: "/atom.xml",
  json: "/feed.json",
} as const

export type FeedItem = {
  id: string
  url: string
  title: string
  summary: string
  contentHtml: string
  published: Date
  updated: Date
  imageUrl: string
  categoryLabel: string
  readMinutes: number
  keywords: string[]
}

/** Treat date-only strings as UTC noon so timezone shifts never move the day. */
function parseFeedDate(value: string | undefined, fallback: Date): Date {
  if (!value) return fallback
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00Z` : value
  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime()) ? fallback : parsed
}

function toFeedItem(article: BlogArticle, origin: string): FeedItem {
  const published = parseFeedDate(article.publishedAt, new Date(0))
  const updated = parseFeedDate(article.updatedAt, published)
  const url = `${origin}${article.pathname}`
  const faqHtml = article.faq ? faqToHtml(article.faq) : ""

  return {
    id: url,
    url,
    title: article.title,
    summary: article.excerpt,
    contentHtml: [contentBlocksToHtml(article.sections), faqHtml]
      .filter(Boolean)
      .join("\n"),
    published,
    updated,
    imageUrl: `${origin}${blogTilePoster(article.slug, article.category, "og")}`,
    categoryLabel: BLOG_CATEGORY_LABELS[article.category],
    readMinutes: article.readMinutes,
    keywords: article.keywords,
  }
}

/** Newest first, which is what every feed format expects. */
export function blogFeedItems(): FeedItem[] {
  const origin = canonicalSiteOrigin()
  return blogArticles
    .map((article) => toFeedItem(article, origin))
    .sort((a, b) => b.published.getTime() - a.published.getTime())
}

export function feedLastUpdated(items: readonly FeedItem[]): Date {
  return items.reduce<Date>(
    (latest, item) => (item.updated > latest ? item.updated : latest),
    new Date(0)
  )
}

export function buildRssXml(): string {
  const origin = canonicalSiteOrigin()
  const items = blogFeedItems()
  const lastBuild = feedLastUpdated(items)

  const entries = items
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.url)}</link>
      <guid isPermaLink="true">${escapeXml(item.id)}</guid>
      <pubDate>${item.published.toUTCString()}</pubDate>
      <category>${escapeXml(item.categoryLabel)}</category>
      <description>${escapeXml(item.summary)}</description>
      <content:encoded>${cdata(item.contentHtml)}</content:encoded>
      <media:thumbnail url="${escapeXml(item.imageUrl)}" />
    </item>`
    )
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${escapeXml(`${origin}/blog`)}</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>en-us</language>
    <copyright>${escapeXml(`© ${new Date().getUTCFullYear()} ${macwall.legalCompanyName}`)}</copyright>
    <managingEditor>${escapeXml(`${macwall.supportEmail} (${macwall.name})`)}</managingEditor>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
    <generator>${escapeXml(`${macwall.name} website`)}</generator>
    <image>
      <url>${escapeXml(`${origin}/MacWall.png`)}</url>
      <title>${escapeXml(FEED_TITLE)}</title>
      <link>${escapeXml(`${origin}/blog`)}</link>
    </image>
    <atom:link href="${escapeXml(`${origin}${FEED_PATHS.rss}`)}" rel="self" type="application/rss+xml" />
${entries}
  </channel>
</rss>
`
}

export function buildAtomXml(): string {
  const origin = canonicalSiteOrigin()
  const items = blogFeedItems()
  const updated = feedLastUpdated(items)

  const entries = items
    .map(
      (item) => `  <entry>
    <title>${escapeXml(item.title)}</title>
    <link rel="alternate" type="text/html" href="${escapeXml(item.url)}" />
    <id>${escapeXml(item.id)}</id>
    <published>${item.published.toISOString()}</published>
    <updated>${item.updated.toISOString()}</updated>
    <category term="${escapeXml(item.categoryLabel)}" />
    <summary type="text">${escapeXml(item.summary)}</summary>
    <content type="html">${cdata(item.contentHtml)}</content>
  </entry>`
    )
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(FEED_TITLE)}</title>
  <subtitle>${escapeXml(FEED_DESCRIPTION)}</subtitle>
  <id>${escapeXml(`${origin}${FEED_PATHS.atom}`)}</id>
  <link rel="self" type="application/atom+xml" href="${escapeXml(`${origin}${FEED_PATHS.atom}`)}" />
  <link rel="alternate" type="text/html" href="${escapeXml(`${origin}/blog`)}" />
  <updated>${updated.toISOString()}</updated>
  <icon>${escapeXml(`${origin}/favicon_io/favicon-32x32.png`)}</icon>
  <logo>${escapeXml(`${origin}/MacWall.png`)}</logo>
  <rights>${escapeXml(`© ${new Date().getUTCFullYear()} ${macwall.legalCompanyName}`)}</rights>
  <author>
    <name>${escapeXml(macwall.name)}</name>
    <email>${escapeXml(macwall.supportEmail)}</email>
    <uri>${escapeXml(origin)}</uri>
  </author>
${entries}
</feed>
`
}

export function buildJsonFeed(): Record<string, unknown> {
  const origin = canonicalSiteOrigin()
  const items = blogFeedItems()

  return {
    version: "https://jsonfeed.org/version/1.1",
    title: FEED_TITLE,
    home_page_url: `${origin}/blog`,
    feed_url: `${origin}${FEED_PATHS.json}`,
    description: FEED_DESCRIPTION,
    icon: `${origin}/MacWall.png`,
    favicon: `${origin}/favicon_io/favicon-32x32.png`,
    language: "en-US",
    authors: [
      {
        name: macwall.name,
        url: origin,
      },
    ],
    items: items.map((item) => ({
      id: item.id,
      url: item.url,
      title: item.title,
      summary: item.summary,
      content_html: item.contentHtml,
      image: item.imageUrl,
      date_published: item.published.toISOString(),
      date_modified: item.updated.toISOString(),
      tags: [item.categoryLabel, ...item.keywords],
      _macwall: {
        read_minutes: item.readMinutes,
        markdown_url: `${item.url}.md`,
      },
    })),
  }
}
