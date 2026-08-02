import { macwall } from "@/lib/macwall-site"
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

export function createSeoPageMetadata(
  page: SeoContentPage,
  options: CreateSeoPageMetadataOptions = {}
): Metadata {
  // Titles that already include the brand must be absolute so the root
  // `%s — MacWall App` template does not double-append the name.
  const title = page.title.includes(macwall.name)
    ? { absolute: page.title }
    : page.title

  const ogTitle = `${macwall.name} – ${page.headline}`
  const image = options.image
    ? {
        url: options.image.url,
        width: options.image.width ?? openGraphImageSize.width,
        height: options.image.height ?? openGraphImageSize.height,
        alt: options.image.alt ?? ogTitle,
      }
    : {
        url: openGraphImageAbsoluteUrl(),
        width: openGraphImageSize.width,
        height: openGraphImageSize.height,
        alt: ogTitle,
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
    title,
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
