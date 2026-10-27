import { macwall } from "@/lib/macwall-site"
import { ogImageForPath } from "@/lib/seo/og-images"
import {
  canonicalSitePath,
  feedAlternateTypes,
  openGraphImageAbsoluteUrl,
  openGraphImageSize,
} from "@/lib/site-url"
import type { SeoContentPage } from "@/lib/content/types"
import type { Metadata } from "next"

export type CreateSeoPageMetadataOptions = {
  /** Use Open Graph `article` for blog posts. */
  openGraphType?: "website" | "article"
  publishedTime?: string
  modifiedTime?: string
  /** Override default OG/Twitter image (e.g. blog poster). */
  image?: {
    url: string
    width?: number
    height?: number
    alt?: string
  }
  /**
   * Advertises the `.md` twin of this page via `<link rel="alternate">`.
   * Disable only for pages with no entry in `lib/ai/site-content`.
   */
  markdownAlternate?: boolean
  /** Extra `rel="alternate"` types, e.g. an RSS feed on the blog index. */
  alternateTypes?: Record<string, string>
}

/** Every page renders as "<Page> | MacWall", brand last, even when the page title names MacWall. */
export function brandedTitle(title: string): string {
  const suffix = ` | ${macwall.name}`
  return title.endsWith(suffix) ? title : `${title}${suffix}`
}

export function createSeoPageMetadata(
  page: SeoContentPage,
  options: CreateSeoPageMetadataOptions = {}
): Metadata {
  const fullTitle = brandedTitle(page.title)
  const ogTitle = fullTitle
  const shareImage = options.image ?? ogImageForPath(page.pathname)
  const image = shareImage
    ? {
        url: shareImage.url,
        width: shareImage.width ?? openGraphImageSize.width,
        height: shareImage.height ?? openGraphImageSize.height,
        alt: shareImage.alt ?? page.headline,
      }
    : {
        url: openGraphImageAbsoluteUrl(),
        width: openGraphImageSize.width,
        height: openGraphImageSize.height,
        alt: page.headline,
      }

  const openGraphType = options.openGraphType ?? "website"

  const markdownPath =
    page.pathname === "/" ? "/index.md" : `${page.pathname}.md`
  const types: Record<string, string> = {
    ...feedAlternateTypes(),
    ...(options.markdownAlternate === false
      ? {}
      : { "text/markdown": canonicalSitePath(markdownPath) }),
    ...options.alternateTypes,
  }

  return {
    title: { absolute: fullTitle },
    description: page.description,
    alternates: {
      canonical: canonicalSitePath(page.pathname),
      ...(Object.keys(types).length > 0 ? { types } : {}),
    },
    keywords: page.keywords,
    openGraph: {
      title: ogTitle,
      description: page.description,
      url: canonicalSitePath(page.pathname),
      siteName: macwall.name,
      type: openGraphType,
      ...(openGraphType === "article"
        ? {
            publishedTime: options.publishedTime,
            modifiedTime: options.modifiedTime ?? options.publishedTime,
          }
        : {}),
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: page.description,
      images: [image.url],
    },
  }
}

/**
 * Metadata for pages without a `SeoContentPage` object (legal, contact, bend):
 * branded title, canonical, Markdown twin, Open Graph and Twitter.
 */
export function createSimplePageMetadata(input: {
  title: string
  description: string
  path: string
  markdownAlternate?: boolean
}): Metadata {
  const title = brandedTitle(input.title)
  const canonical = canonicalSitePath(input.path)
  const image = ogImageForPath(input.path) ?? {
    url: openGraphImageAbsoluteUrl(),
    width: openGraphImageSize.width,
    height: openGraphImageSize.height,
    alt: title,
  }
  const markdownPath = input.path === "/" ? "/index.md" : `${input.path}.md`
  return {
    title: { absolute: title },
    description: input.description,
    alternates: {
      canonical,
      types: {
        ...feedAlternateTypes(),
        ...(input.markdownAlternate === false
          ? {}
          : { "text/markdown": canonicalSitePath(markdownPath) }),
      },
    },
    openGraph: {
      title,
      description: input.description,
      url: canonical,
      siteName: macwall.name,
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: input.description,
      images: [image.url],
    },
  }
}
