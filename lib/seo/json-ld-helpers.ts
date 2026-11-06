import { macwall } from "@/lib/macwall-site"
import { canonicalSiteOrigin } from "@/lib/site-url"
import type { ContentFaq } from "@/lib/content/types"

/**
 * Shared JSON-LD builders. Every node links into the site graph that the root
 * layout renders on every page (lib/macwall-json-ld.ts): the publisher is
 * always `#organization`, pages are part of `#website`, and the app is
 * `#softwareapplication`. Nothing here invents ratings, reviews or people.
 */

export const SCHEMA_ORG_CONTEXT = "https://schema.org"

export type JsonLdNode = Record<string, unknown>

/** A level between the site root and the page, e.g. `{ name: "Docs", pathname: "/docs" }`. */
export type BreadcrumbCrumb = { name: string; pathname: string }

/**
 * An entity reference: a full `@id`, a fragment of a site-wide entity such as
 * `"#softwareapplication"` (resolved against the origin), or a whole node.
 */
export type JsonLdRef = string | JsonLdNode

function trimOrigin(origin: string): string {
  return origin.replace(/\/+$/, "")
}

/** Absolute URL for a root-relative path; absolute URLs pass through. */
export function absoluteUrl(origin: string, pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`
  return `${trimOrigin(origin)}${path}`
}

/** Canonical page URL, matching `canonicalSitePath` (the home page has no trailing slash). */
function pageUrl(origin: string, pathname: string): string {
  const base = trimOrigin(origin)
  if (!pathname || pathname === "/") return base
  return absoluteUrl(base, pathname)
}

/** `${url}#fragment`, with the site-wide `${origin}/#fragment` form for the home page. */
function nodeId(origin: string, url: string, fragment: string): string {
  return url === trimOrigin(origin)
    ? `${url}/#${fragment}`
    : `${url}#${fragment}`
}

/** `@id`s of the site-wide entities in the root layout graph. */
export function siteEntityIds(origin: string) {
  const base = trimOrigin(origin)
  return {
    organization: `${base}/#organization`,
    website: `${base}/#website`,
    softwareApplication: `${base}/#softwareapplication`,
    logo: `${base}/#logo`,
  } as const
}

/**
 * The publisher and author of everything on the site: a reference to the one
 * Organization node the root layout renders on every page, never a second
 * inline Organization.
 */
export function organizationRef(origin: string): JsonLdNode {
  return { "@id": siteEntityIds(origin).organization }
}

function resolveRef(origin: string, ref: JsonLdRef): JsonLdNode {
  if (typeof ref !== "string") return ref
  return { "@id": ref.startsWith("#") ? `${trimOrigin(origin)}/${ref}` : ref }
}

function isRefList(
  refs: JsonLdRef | readonly JsonLdRef[]
): refs is readonly JsonLdRef[] {
  return Array.isArray(refs)
}

function resolveRefs(
  origin: string,
  refs: JsonLdRef | readonly JsonLdRef[]
): JsonLdNode | JsonLdNode[] {
  return isRefList(refs)
    ? refs.map((ref) => resolveRef(origin, ref))
    : resolveRef(origin, refs)
}

/**
 * Merges JSON-LD documents and nodes into one `@graph`, so a page can ship a
 * single script: `jsonLdGraph(webPageJsonLd(…), faqPageJsonLd(…))`.
 */
export function jsonLdGraph(
  ...parts: ReadonlyArray<JsonLdNode | null | undefined | false>
): JsonLdNode {
  const graph: unknown[] = []
  for (const part of parts) {
    if (!part) continue
    const { "@context": _context, "@graph": inner, ...node } = part
    void _context
    if (Array.isArray(inner)) graph.push(...inner)
    if (Object.keys(node).length > 0) graph.push(node)
  }
  return { "@context": SCHEMA_ORG_CONTEXT, "@graph": graph }
}

/**
 * BreadcrumbList for a page: MacWall, then each parent level, then the page.
 * A parent equal to the page itself (a hub's own page) is skipped.
 */
export function breadcrumbListNode(input: {
  origin: string
  pathname: string
  /** Leaf crumb: a short page name such as "Changelog", not the full title. */
  name: string
  parents?: readonly BreadcrumbCrumb[]
}): JsonLdNode {
  const origin = trimOrigin(input.origin)
  const url = pageUrl(origin, input.pathname)
  const trail: { name: string; item: string }[] = [
    { name: macwall.name, item: origin },
  ]
  for (const parent of input.parents ?? []) {
    const item = pageUrl(origin, parent.pathname)
    if (item === url || item === origin) continue
    trail.push({ name: parent.name, item })
  }
  if (url !== origin) trail.push({ name: input.name, item: url })

  return {
    "@type": "BreadcrumbList",
    "@id": nodeId(origin, url, "breadcrumb"),
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.item,
    })),
  }
}

/** One image URL, or several crops of it (Google asks for 16x9, 4x3 and 1x1). */
type ImageInput = string | readonly string[]

function imageUrls(origin: string, image: ImageInput | undefined): string[] {
  const list = typeof image === "string" ? [image] : [...(image ?? [])]
  return [
    ...new Set(
      list.filter(Boolean).map((url) => absoluteUrl(origin, url.trim()))
    ),
  ]
}

export type WebPageType =
  "WebPage" | "CollectionPage" | "AboutPage" | "ContactPage" | "ItemPage"

/**
 * WebPage for a page whose subject lives elsewhere in the graph, e.g. the home
 * page: `about` and `mainEntity` `"#softwareapplication"`, the hero poster as
 * `primaryImageOfPage`. Pass `breadcrumbs` (parent levels, `[]` for a top-level
 * page) to add a BreadcrumbList; the home page needs none.
 */
export function webPageJsonLd(input: {
  origin: string
  pathname: string
  name: string
  description: string
  type?: WebPageType
  headline?: string
  about?: JsonLdRef | readonly JsonLdRef[]
  mainEntity?: JsonLdRef
  /** Image URL (absolute or root-relative), or an ImageObject node. */
  primaryImageOfPage?: string | JsonLdNode
  /** A VideoObject on the page, usually `"…#video"` from `videoObjectJsonLd`. */
  video?: JsonLdRef | readonly JsonLdRef[]
  breadcrumbs?: readonly BreadcrumbCrumb[]
  /** Leaf crumb when `breadcrumbs` is set; defaults to `name`. */
  breadcrumbName?: string
  datePublished?: string
  dateModified?: string
}): JsonLdNode {
  const origin = trimOrigin(input.origin)
  const url = pageUrl(origin, input.pathname)
  const ids = siteEntityIds(origin)
  const breadcrumb = input.breadcrumbs
    ? breadcrumbListNode({
        origin,
        pathname: input.pathname,
        name: input.breadcrumbName ?? input.name,
        parents: input.breadcrumbs,
      })
    : null

  const page: JsonLdNode = {
    "@type": input.type ?? "WebPage",
    "@id": nodeId(origin, url, "webpage"),
    url,
    name: input.name,
    ...(input.headline ? { headline: input.headline } : {}),
    description: input.description,
    inLanguage: "en-US",
    isPartOf: { "@id": ids.website },
    publisher: { "@id": ids.organization },
  }
  if (breadcrumb) page.breadcrumb = { "@id": breadcrumb["@id"] }
  if (input.about) page.about = resolveRefs(origin, input.about)
  if (input.mainEntity) page.mainEntity = resolveRef(origin, input.mainEntity)
  if (input.primaryImageOfPage) {
    page.primaryImageOfPage =
      typeof input.primaryImageOfPage === "string"
        ? {
            "@type": "ImageObject",
            url: absoluteUrl(origin, input.primaryImageOfPage),
          }
        : input.primaryImageOfPage
  }
  if (input.video) page.video = resolveRefs(origin, input.video)
  if (input.datePublished) page.datePublished = input.datePublished
  if (input.dateModified) page.dateModified = input.dateModified

  return jsonLdGraph(breadcrumb, page)
}

/** CollectionPage + BreadcrumbList + ItemList for hub pages such as /docs and /learn. */
export function collectionPageJsonLd(input: {
  pathname: string
  name: string
  description: string
  breadcrumbLabel: string
  /** Levels between MacWall and this hub, e.g. Wallpapers for the collections hub. */
  parents?: readonly BreadcrumbCrumb[]
  dateModified?: string
  items: { name: string; pathname: string; description?: string }[]
}) {
  const origin = canonicalSiteOrigin()
  const url = pageUrl(origin, input.pathname)
  const breadcrumb = breadcrumbListNode({
    origin,
    pathname: input.pathname,
    name: input.breadcrumbLabel,
    parents: input.parents,
  })

  return jsonLdGraph(breadcrumb, {
    "@type": "CollectionPage",
    "@id": nodeId(origin, url, "webpage"),
    url,
    name: input.name,
    description: input.description,
    inLanguage: "en-US",
    isPartOf: { "@id": siteEntityIds(origin).website },
    breadcrumb: { "@id": breadcrumb["@id"] },
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: input.items.length,
      itemListElement: input.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: absoluteUrl(origin, item.pathname),
      })),
    },
  })
}

/**
 * The site's inline Markdown (`[label](href)`, `**bold**`, `` `code` ``, the
 * subset lib/feeds/content-html.ts renders) as plain text for structured data,
 * where brackets and relative URLs would be read literally.
 */
export function markdownToPlainText(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)\s]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
}

export function faqPageJsonLd(faqs: readonly ContentFaq[]) {
  return {
    "@context": SCHEMA_ORG_CONTEXT,
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: markdownToPlainText(faq.question),
      acceptedAnswer: {
        "@type": "Answer",
        text: markdownToPlainText(faq.answer),
      },
    })),
  } as const
}

export type ArticleType = "BlogPosting" | "Article" | "TechArticle"

/** A source an article cites: its URL, or a name and URL. */
export type ArticleCitation = string | { name: string; url: string }

/**
 * BreadcrumbList + WebPage + Article for an editorial page: `BlogPosting` for
 * the blog, `Article` for /learn and comparison pages, `TechArticle` for docs.
 * Author and publisher are the site Organization; a Person author needs a
 * real, consenting person with a public profile, so none is emitted here.
 */
export function articleJsonLd(input: {
  origin: string
  pathname: string
  headline: string
  description: string
  datePublished: string
  dateModified?: string
  /** One image, or its 16x9, 4x3 and 1x1 crops (absolute or root-relative). */
  image?: ImageInput
  /** Middle breadcrumb; blog posts by default. */
  section?: BreadcrumbCrumb
  /** Leaf crumb; defaults to the headline. */
  breadcrumbName?: string
  type?: ArticleType
  /** Sources the page cites, e.g. a comparison's dated SOURCES. */
  citation?: readonly ArticleCitation[]
  /** What the article is about: `"#softwareapplication"`, or a node such as a competitor app. */
  about?: JsonLdRef | readonly JsonLdRef[]
  mentions?: JsonLdRef | readonly JsonLdRef[]
}) {
  const origin = trimOrigin(input.origin)
  const url = pageUrl(origin, input.pathname)
  const ids = siteEntityIds(origin)
  const images = imageUrls(origin, input.image)
  // Never an empty date: a page with no publish date leaves the field out.
  const dates = {
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.dateModified || input.datePublished
      ? { dateModified: input.dateModified || input.datePublished }
      : {}),
  }
  const breadcrumb = breadcrumbListNode({
    origin,
    pathname: input.pathname,
    name: input.breadcrumbName ?? input.headline,
    parents: [input.section ?? { name: "Blog", pathname: "/blog" }],
  })
  const webPageId = nodeId(origin, url, "webpage")

  const article: JsonLdNode = {
    "@type": input.type ?? "BlogPosting",
    "@id": nodeId(origin, url, "article"),
    headline: input.headline,
    description: input.description,
    url,
    ...(images.length > 0 ? { image: images } : {}),
    ...dates,
    author: organizationRef(origin),
    publisher: organizationRef(origin),
    mainEntityOfPage: { "@id": webPageId },
    isPartOf: { "@id": ids.website },
    inLanguage: "en-US",
  }
  if (input.about) article.about = resolveRefs(origin, input.about)
  if (input.mentions) article.mentions = resolveRefs(origin, input.mentions)
  if (input.citation && input.citation.length > 0) {
    article.citation = input.citation.map((source) =>
      typeof source === "string"
        ? source
        : { "@type": "CreativeWork", name: source.name, url: source.url }
    )
  }

  return jsonLdGraph(
    breadcrumb,
    {
      "@type": "WebPage",
      "@id": webPageId,
      url,
      name: input.headline,
      description: input.description,
      inLanguage: "en-US",
      isPartOf: { "@id": ids.website },
      breadcrumb: { "@id": breadcrumb["@id"] },
      ...(images[0]
        ? {
            primaryImageOfPage: { "@type": "ImageObject", url: images[0] },
          }
        : {}),
      ...dates,
    },
    article
  )
}

/** A key moment in a video, in whole seconds from the start. */
export type VideoClip = {
  name: string
  startOffset: number
  endOffset?: number
  /** Link that starts playback at `startOffset`, e.g. a YouTube `?t=` URL. */
  url: string
}

/** ISO 8601 duration from seconds: 95 → "PT1M35S". */
export function isoDurationFromSeconds(seconds: number): string {
  const total = Math.max(0, Math.round(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60
  const parts = [
    hours ? `${hours}H` : "",
    minutes ? `${minutes}M` : "",
    secs || total === 0 ? `${secs}S` : "",
  ]
  return `PT${parts.join("")}`
}

function validClip(clip: VideoClip): boolean {
  if (!clip.name.trim() || !clip.url.trim()) return false
  if (!Number.isFinite(clip.startOffset) || clip.startOffset < 0) return false
  if (clip.endOffset === undefined) return true
  return Number.isFinite(clip.endOffset) && clip.endOffset > clip.startOffset
}

/**
 * VideoObject for a video embedded on a page (a demo, a tutorial), with key
 * moments as `hasPart` Clips. `contentUrl` must be a preview or published
 * copy, never a catalog master file.
 */
export function videoObjectJsonLd(input: {
  origin: string
  /** Page the video is embedded on. */
  pathname: string
  name: string
  description: string
  thumbnailUrl: ImageInput
  /** ISO date or date-time the video was first published. */
  uploadDate: string
  contentUrl?: string
  embedUrl?: string
  /** ISO 8601 ("PT30S") or whole seconds. */
  duration?: string | number
  width?: number
  height?: number
  clips?: readonly VideoClip[]
  /** `@id` fragment; set it when a page has more than one video. */
  fragment?: string
}) {
  const origin = trimOrigin(input.origin)
  const url = pageUrl(origin, input.pathname)
  const clips = (input.clips ?? [])
    .filter(validClip)
    .sort((a, b) => a.startOffset - b.startOffset)

  const video: JsonLdNode = {
    "@type": "VideoObject",
    "@id": nodeId(origin, url, input.fragment ?? "video"),
    name: input.name,
    description: input.description,
    thumbnailUrl: imageUrls(origin, input.thumbnailUrl),
    uploadDate: input.uploadDate,
    publisher: organizationRef(origin),
    inLanguage: "en-US",
  }
  if (input.contentUrl) video.contentUrl = absoluteUrl(origin, input.contentUrl)
  if (input.embedUrl) video.embedUrl = absoluteUrl(origin, input.embedUrl)
  if (input.duration !== undefined) {
    video.duration =
      typeof input.duration === "number"
        ? isoDurationFromSeconds(input.duration)
        : input.duration
  }
  if (input.width) video.width = input.width
  if (input.height) video.height = input.height
  if (clips.length > 0) {
    video.hasPart = clips.map((clip) => ({
      "@type": "Clip",
      name: clip.name,
      startOffset: Math.round(clip.startOffset),
      ...(clip.endOffset !== undefined
        ? { endOffset: Math.round(clip.endOffset) }
        : {}),
      url: absoluteUrl(origin, clip.url),
    }))
  }

  return { "@context": SCHEMA_ORG_CONTEXT, ...video }
}
