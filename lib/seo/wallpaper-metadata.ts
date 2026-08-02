import { macwall } from "@/lib/macwall-site"
import { wallpaperCategoryPage } from "@/lib/seo/landing-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import {
  canonicalSitePath,
  openGraphImageAbsoluteUrl,
  openGraphImageSize,
} from "@/lib/site-url"
import { formatLoopDurationLabel } from "@/lib/public-catalog/format"
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
  return {
    title: `${macwall.name} – ${input.title}`,
    description: input.description,
    url: input.url,
    siteName: macwall.name,
    type: "website" as const,
    images: [
      {
        url: openGraphImageAbsoluteUrl(),
        width: openGraphImageSize.width,
        height: openGraphImageSize.height,
        alt: input.alt,
      },
    ],
  }
}

function defaultGalleryTwitter(input: { title: string; description: string }) {
  return {
    card: "summary_large_image" as const,
    title: `${macwall.name} – ${input.title}`,
    description: input.description,
    images: [openGraphImageAbsoluteUrl()],
  }
}

/** Metadata for `/wallpapers` — canonical index; filtered views are noindex. */
export function wallpaperGalleryIndexMetadata(
  filters: GalleryFilterParams = {}
): Metadata {
  const filtered = isGalleryFilteredView(filters)
  const tag = filters.tag?.trim()
  const q = filters.q?.trim()

  let title = "Live Wallpapers for Mac"
  let description = `Browse cinematic live wallpapers for Mac on ${macwall.name}. Search by category, resolution, and style — then set any wallpaper in the MacWall app.`

  if (tag) {
    title = `${tag} Live Wallpapers for Mac`
    description = `Browse ${tag} live wallpapers for Mac — curated ${tag.toLowerCase()} motion video loops in ${macwall.name}. Preview in 4K and set on your Mac desktop.`
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
    alternates: { canonical },
    ...(filtered ? { robots: filteredGalleryRobots() } : {}),
    openGraph: defaultGalleryOpenGraph({
      title,
      description,
      url: canonical,
      alt: `${macwall.name} – ${title}`,
    }),
    twitter: defaultGalleryTwitter({ title, description }),
  }
}

/** Metadata for `/wallpapers/{category}` — filtered query views are noindex. */
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
      title: `${macwall.name} – ${title}`,
      description,
    },
    twitter: {
      ...base.twitter,
      title: `${macwall.name} – ${title}`,
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
  const durationLabel = formatLoopDurationLabel(wallpaper.durationSeconds)
  const title = `${wallpaper.name} – Live Wallpaper for Mac`
  const description = `${wallpaper.name} is a ${durationLabel} ${wallpaper.category.toLowerCase()} live wallpaper for Mac on ${macwall.name}. Preview the loop and set it on your Mac desktop.`
  const canonical = canonicalSitePath(wallpaperDetailPath(wallpaper))
  const thumbUrl = absoluteMediaUrl(wallpaper.thumbUrl)
  const keywords = [
    `${wallpaper.name} live wallpaper mac`,
    `${wallpaper.name} mac wallpaper`,
    `${wallpaper.category.toLowerCase()} live wallpaper macos`,
    `${wallpaper.category.toLowerCase()} wallpaper mac`,
    "live wallpaper macos",
    "animated desktop mac",
    `${macwall.name.toLowerCase()} wallpaper`,
  ]

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title: `${wallpaper.name} · ${macwall.name}`,
      description,
      url: canonical,
      siteName: macwall.name,
      type: "website",
      images: [
        {
          url: thumbUrl,
          alt: `${wallpaper.name} – ${wallpaper.category} live wallpaper for Mac`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${wallpaper.name} · ${macwall.name}`,
      description,
      images: [thumbUrl],
    },
  }
}
