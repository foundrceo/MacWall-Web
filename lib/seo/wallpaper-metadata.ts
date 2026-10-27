import { macwall, macwallCatalog } from "@/lib/macwall-site"
import { ogImageForPath } from "@/lib/seo/og-images"
import {
  catalogOpenGraphImageSize,
  catalogOpenGraphImageUrl,
} from "@/lib/macwall-catalog-urls"
import { wallpaperCategoryPage } from "@/lib/seo/landing-pages"
import {
  brandedTitle,
  createSeoPageMetadata,
} from "@/lib/seo/create-page-metadata"
import {
  canonicalSitePath,
  feedAlternateTypes,
  openGraphImageAbsoluteUrl,
  openGraphImageSize,
} from "@/lib/site-url"
import { buildWallpaperDetailContent } from "@/lib/seo/wallpaper-detail-content"
import { wallpaperDetailPath } from "@/lib/public-catalog/urls"
import type { PublicWallpaper } from "@/lib/public-catalog/types"
import type { Metadata } from "next"

export type GalleryFilterParams = {
  q?: string
  tag?: string
  sort?: string
}

const GALLERY_INDEX_KEYWORDS = [
  "live wallpapers for mac",
  "mac live wallpaper",
  "animated wallpaper macos",
  "4k live wallpaper mac",
  "video wallpaper mac",
  "macwall wallpapers",
  "macwall live wallpaper catalog",
] as const

export function isGalleryFilteredView(params: GalleryFilterParams): boolean {
  const q = params.q?.trim()
  const tag = params.tag?.trim()
  const sort = params.sort?.trim()
  return Boolean(q || tag || (sort && sort !== "newest"))
}

function filteredGalleryRobots(): NonNullable<Metadata["robots"]> {
  return { index: false, follow: true }
}

function defaultGalleryOpenGraph(input: {
  title: string
  description: string
  url: string
  alt: string
}) {
  const share = ogImageForPath(new URL(input.url).pathname)
  return {
    title: brandedTitle(input.title),
    description: input.description,
    url: input.url,
    siteName: macwall.name,
    type: "website" as const,
    images: [
      share ?? {
        url: openGraphImageAbsoluteUrl(),
        width: openGraphImageSize.width,
        height: openGraphImageSize.height,
        alt: input.alt,
      },
    ],
  }
}

function defaultGalleryTwitter(input: {
  title: string
  description: string
  url: string
}) {
  return {
    card: "summary_large_image" as const,
    title: brandedTitle(input.title),
    description: input.description,
    images: [
      ogImageForPath(new URL(input.url).pathname)?.url ??
        openGraphImageAbsoluteUrl(),
    ],
  }
}

/** Metadata for `/wallpapers`: canonical index; filtered views are noindex. */
export function wallpaperGalleryIndexMetadata(
  filters: GalleryFilterParams = {}
): Metadata {
  const filtered = isGalleryFilteredView(filters)
  const tag = filters.tag?.trim()
  const q = filters.q?.trim()

  let title = "Live Wallpapers for Mac and MacBook"
  let description = `Browse ${macwallCatalog.liveCountLabel} live wallpapers for Mac and MacBook, most in 4K. They are video loops that play in the ${macwall.name} app, not still image downloads.`

  if (tag) {
    title = `${tag} Live Wallpapers for Mac`
    description = `Browse ${tag} live wallpapers for Mac. Hand-picked ${tag.toLowerCase()} motion video loops in ${macwall.name}. Preview in 4K and set on your Mac desktop.`
  } else if (q) {
    title = `"${q}" Live Wallpapers for Mac`
    description = `Search results for "${q}" in the ${macwall.name} live wallpaper catalog for Mac. Preview loops and set them with the MacWall app.`
  }

  const canonical = canonicalSitePath("/wallpapers")

  return {
    title,
    description,
    keywords: tag
      ? [
          `${tag.toLowerCase()} live wallpaper mac`,
          `${tag.toLowerCase()} wallpaper macos`,
          "live wallpapers for mac",
          "macwall wallpapers",
        ]
      : [...GALLERY_INDEX_KEYWORDS],
    alternates: {
      canonical,
      ...(!filtered
        ? { types: { "text/markdown": canonicalSitePath("/wallpapers.md") } }
        : {}),
    },
    ...(filtered ? { robots: filteredGalleryRobots() } : {}),
    openGraph: defaultGalleryOpenGraph({
      title,
      description,
      url: canonical,
      alt: title,
    }),
    twitter: defaultGalleryTwitter({ title, description, url: canonical }),
  }
}

/** Metadata for `/wallpapers/{category}`: filtered query views are noindex. */
export function wallpaperCategoryGalleryMetadata(
  categoryName: string,
  filters: GalleryFilterParams = {}
): Metadata {
  const page = wallpaperCategoryPage(categoryName)
  const base = createSeoPageMetadata(page)
  const filtered = isGalleryFilteredView(filters)

  if (!filtered) return base

  const tag = filters.tag?.trim()
  const q = filters.q?.trim()
  let title = page.title
  let description = page.description

  if (tag) {
    title = `${tag} ${categoryName} Live Wallpapers for Mac`
    description = `Browse ${tag} ${categoryName.toLowerCase()} live wallpapers for Mac in ${macwall.name}. Cinematic motion loops with GPU hardware decode.`
  } else if (q) {
    title = `"${q}" in ${categoryName} Live Wallpapers for Mac`
    description = `Search results for "${q}" in ${categoryName} live wallpapers on ${macwall.name} for Mac.`
  }

  return {
    ...base,
    title,
    description,
    robots: filteredGalleryRobots(),
    openGraph: {
      ...base.openGraph,
      title: brandedTitle(title),
      description,
    },
    twitter: {
      ...base.twitter,
      title: brandedTitle(title),
      description,
    },
  }
}

function absoluteMediaUrl(url: string): string {
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return new URL(trimmed, canonicalSitePath("/")).toString()
}

/** Detail page metadata with absolute OG/Twitter thumbnail URLs. */
export function wallpaperDetailMetadata(wallpaper: PublicWallpaper): Metadata {
  const content = buildWallpaperDetailContent(wallpaper)
  // People search "{name} wallpaper"; keep that phrase at the front of the title.
  const title = brandedTitle(content.pageTitle)
  const description = content.metaDescription
  const detailPath = wallpaperDetailPath(wallpaper)
  const canonical = canonicalSitePath(detailPath)
  const thumbUrl = absoluteMediaUrl(wallpaper.thumbUrl)
  // The wallpaper's own poster (the one the app shows), sent at the standard
  // share size; the original poster when it isn't on the CDN.
  const shareUrl = catalogOpenGraphImageUrl(thumbUrl)
  const shareImage = shareUrl
    ? {
        url: shareUrl,
        width: catalogOpenGraphImageSize.width,
        height: catalogOpenGraphImageSize.height,
        type: "image/jpeg",
      }
    : { url: thumbUrl }
  const shareAlt = `${wallpaper.name}, ${wallpaper.category.toLowerCase()} live wallpaper for Mac`
  const name = wallpaper.name.toLowerCase()
  const category = wallpaper.category.toLowerCase()
  const keywords = [
    `${name} wallpaper`,
    `${name} live wallpaper`,
    `${name} live wallpaper mac`,
    `${name} 4k wallpaper`,
    `${name} macbook wallpaper`,
    `${category} live wallpaper mac`,
    ...content.collections
      .slice(0, 3)
      .map((entry) => `${entry.name.toLowerCase()} live wallpaper`),
    "live wallpaper macos",
    `${macwall.name.toLowerCase()} wallpaper`,
  ]

  return {
    title: { absolute: title },
    description,
    keywords,
    ...(content.thin ? { robots: { index: false, follow: true } } : {}),
    alternates: {
      canonical,
      types: {
        ...feedAlternateTypes(),
        "text/markdown": canonicalSitePath(`${detailPath}.md`),
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: macwall.name,
      type: "website",
      images: [{ ...shareImage, alt: shareAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: shareImage.url, alt: shareAlt }],
    },
  }
}
