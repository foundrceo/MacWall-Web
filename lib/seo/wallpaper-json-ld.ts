import { macwall } from "@/lib/macwall-site"
import type { PublicWallpaper } from "@/lib/public-catalog/types"
import {
  wallpaperDetailPath,
  wallpapersGalleryPath,
  wallpaperCategorySlugOrFallback,
} from "@/lib/public-catalog/urls"

function absoluteUrl(origin: string, pathname: string): string {
  const base = origin.replace(/\/+$/, "")
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`
  return `${base}${path}`
}

type BreadcrumbItem = {
  name: string
  item: string
}

function breadcrumbListJsonLd(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList" as const,
    itemListElement: items.map((entry, index) => ({
      "@type": "ListItem" as const,
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  }
}

function itemListElementFromWallpapers(
  origin: string,
  wallpapers: PublicWallpaper[],
  listName: string,
  totalCount?: number
) {
  return {
    "@type": "ItemList" as const,
    name: listName,
    numberOfItems: totalCount ?? wallpapers.length,
    itemListElement: wallpapers.map((wallpaper, index) => {
      const path = wallpaperDetailPath(wallpaper)
      return {
        "@type": "ListItem" as const,
        position: index + 1,
        url: absoluteUrl(origin, path),
        name: wallpaper.name,
      }
    }),
  }
}

/** CollectionPage + ItemList for the main `/wallpapers` index. */
export function wallpaperGalleryIndexJsonLd(input: {
  origin: string
  pageTitle: string
  headline: string
  description: string
  wallpapers: PublicWallpaper[]
  totalCount?: number
}) {
  const origin = input.origin.replace(/\/+$/, "")
  const url = absoluteUrl(origin, "/wallpapers")
  const siteId = `${origin}/#website`
  const pageId = `${url}#webpage`

  return {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbListJsonLd([
        { name: macwall.name, item: origin },
        { name: "Wallpapers", item: url },
      ]),
      {
        "@type": "CollectionPage",
        "@id": pageId,
        url,
        name: input.pageTitle,
        headline: input.headline,
        description: input.description,
        inLanguage: "en-US",
        isPartOf: { "@id": siteId },
        mainEntity: itemListElementFromWallpapers(
          origin,
          input.wallpapers,
          `${macwall.name} live wallpapers`,
          input.totalCount
        ),
      },
    ],
  } as const
}

/** CollectionPage + ItemList for a category gallery (`/wallpapers/{slug}`). */
export function wallpaperCategoryGalleryJsonLd(input: {
  origin: string
  categoryName: string
  pageTitle: string
  headline: string
  description: string
  wallpapers: PublicWallpaper[]
  totalCount?: number
}) {
  const origin = input.origin.replace(/\/+$/, "")
  const categorySlug = wallpaperCategorySlugOrFallback(input.categoryName)
  const categoryPath = wallpapersGalleryPath(categorySlug)
  const url = absoluteUrl(origin, categoryPath)
  const siteId = `${origin}/#website`
  const pageId = `${url}#webpage`
  const wallpapersIndexUrl = absoluteUrl(origin, "/wallpapers")

  return {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbListJsonLd([
        { name: macwall.name, item: origin },
        { name: "Wallpapers", item: wallpapersIndexUrl },
        { name: input.categoryName, item: url },
      ]),
      {
        "@type": "CollectionPage",
        "@id": pageId,
        url,
        name: input.pageTitle,
        headline: input.headline,
        description: input.description,
        inLanguage: "en-US",
        isPartOf: { "@id": siteId },
        mainEntity: itemListElementFromWallpapers(
          origin,
          input.wallpapers,
          `${input.categoryName} live wallpapers for Mac`,
          input.totalCount
        ),
      },
    ],
  } as const
}

/**
 * Detail page structured data — breadcrumbs, WebPage, ImageObject, VideoObject.
 * Omits `contentUrl` on VideoObject (anti-theft); uses thumbnail + embed page URL only.
 */
export function wallpaperDetailPageJsonLd(input: {
  origin: string
  wallpaper: PublicWallpaper
  description: string
  durationSeconds?: number
}) {
  const origin = input.origin.replace(/\/+$/, "")
  const { wallpaper } = input
  const path = wallpaperDetailPath(wallpaper)
  const url = absoluteUrl(origin, path)
  const siteId = `${origin}/#website`
  const pageId = `${url}#webpage`
  const categorySlug = wallpaperCategorySlugOrFallback(wallpaper.category)
  const categoryPath = wallpapersGalleryPath(categorySlug)
  const categoryUrl = absoluteUrl(origin, categoryPath)
  const wallpapersIndexUrl = absoluteUrl(origin, "/wallpapers")

  const imageObject: Record<string, unknown> = {
    "@type": "ImageObject",
    "@id": `${url}#thumbnail`,
    url: wallpaper.thumbUrl,
    contentUrl: wallpaper.thumbUrl,
    name: `${wallpaper.name} preview`,
    caption: `${wallpaper.name} live wallpaper preview`,
    representativeOfPage: true,
  }

  const videoObject: Record<string, unknown> = {
    "@type": "VideoObject",
    "@id": `${url}#video`,
    name: wallpaper.name,
    description: input.description,
    thumbnailUrl: [wallpaper.thumbUrl],
    uploadDate: wallpaper.createdAt,
    embedUrl: url,
    isFamilyFriendly: true,
    publisher: {
      "@type": "Organization",
      name: macwall.name,
      url: origin,
    },
  }

  if (input.durationSeconds && input.durationSeconds > 0) {
    videoObject.duration = `PT${Math.round(input.durationSeconds)}S`
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbListJsonLd([
        { name: macwall.name, item: origin },
        { name: "Wallpapers", item: wallpapersIndexUrl },
        { name: wallpaper.category, item: categoryUrl },
        { name: wallpaper.name, item: url },
      ]),
      {
        "@type": "WebPage",
        "@id": pageId,
        url,
        name: wallpaper.name,
        headline: wallpaper.name,
        description: input.description,
        inLanguage: "en-US",
        isPartOf: { "@id": siteId },
        primaryImageOfPage: { "@id": `${url}#thumbnail` },
        video: { "@id": `${url}#video` },
      },
      imageObject,
      videoObject,
    ],
  } as const
}
