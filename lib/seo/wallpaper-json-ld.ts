import { macwall } from "@/lib/macwall-site"
import { wallpaperNamedAuthor } from "@/lib/public-catalog/attribution"
import type { PublicWallpaper } from "@/lib/public-catalog/types"
import { wallpaperImageAlt } from "@/lib/public-catalog/wallpaper-alt"
import { categoryDisplayLabel, categorySeoFor } from "@/lib/seo/category-seo"
import {
  isoDurationFromSeconds,
  organizationRef,
  siteEntityIds,
} from "@/lib/seo/json-ld-helpers"
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

/**
 * The wallpapers listed on the page. `numberOfItems` counts the listed
 * elements, not the catalog or collection total: the visible copy carries
 * the public count label (`macwallCatalog.liveCountLabel`), and a larger
 * raw total here would contradict it.
 */
function itemListElementFromWallpapers(
  origin: string,
  wallpapers: PublicWallpaper[],
  listName: string
) {
  return {
    "@type": "ItemList" as const,
    name: listName,
    numberOfItems: wallpapers.length,
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
  /** Not emitted: `numberOfItems` counts the listed wallpapers. */
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
          `${macwall.name} live wallpapers`
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
  /** Not emitted: `numberOfItems` counts the listed wallpapers. */
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
        // The visible crumb and chips say "More" for Others.
        { name: categoryDisplayLabel(input.categoryName), item: url },
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
          categorySeoFor(input.categoryName)?.headline ??
            `${input.categoryName} live wallpapers for Mac`
        ),
      },
    ],
  } as const
}

/**
 * Detail page structured data: breadcrumbs, WebPage, ImageObject, VideoObject.
 *
 * The VideoObject has no `contentUrl`: the only fetchable file today is the
 * full-resolution master, which is never published here. It has no
 * `embedUrl` either: that must be a player URL, and the page itself is not
 * one. Once a pre-rendered preview file exists, it becomes `contentUrl`.
 */
export function wallpaperDetailPageJsonLd(input: {
  origin: string
  wallpaper: PublicWallpaper
  /** Full description, never a clamped meta description. */
  description: string
  /** H1 text; defaults to the wallpaper name. */
  headline?: string
  durationSeconds?: number
}) {
  const origin = input.origin.replace(/\/+$/, "")
  const { wallpaper } = input
  const ids = siteEntityIds(origin)
  const path = wallpaperDetailPath(wallpaper)
  const url = absoluteUrl(origin, path)
  const pageId = `${url}#webpage`
  const categorySlug = wallpaperCategorySlugOrFallback(wallpaper.category)
  const categoryPath = wallpapersGalleryPath(categorySlug)
  const categoryUrl = absoluteUrl(origin, categoryPath)
  const wallpapersIndexUrl = absoluteUrl(origin, "/wallpapers")

  // Credit only from a real attribution record (or MacWall's own loops),
  // never the "Community" placeholder and never a licence claim: much of the
  // catalog shows characters, brands and people MacWall doesn't own.
  const namedAuthor = wallpaperNamedAuthor(wallpaper)
  const isOriginal = wallpaper.originType === "macwall_original"
  const creator = namedAuthor
    ? { "@type": "Person", name: namedAuthor }
    : isOriginal
      ? organizationRef(origin)
      : null
  const creditText = namedAuthor ?? (isOriginal ? macwall.name : null)

  const imageObject: Record<string, unknown> = {
    "@type": "ImageObject",
    "@id": `${url}#thumbnail`,
    url: wallpaper.thumbUrl,
    contentUrl: wallpaper.thumbUrl,
    name: `${wallpaper.name} preview`,
    caption: wallpaperImageAlt(wallpaper),
    representativeOfPage: true,
  }
  if (creator) imageObject.creator = creator
  if (creditText) imageObject.creditText = creditText

  const videoObject: Record<string, unknown> = {
    "@type": "VideoObject",
    "@id": `${url}#video`,
    name: wallpaper.name,
    description: input.description,
    thumbnailUrl: [wallpaper.thumbUrl],
    uploadDate: wallpaper.createdAt,
    inLanguage: "en-US",
    publisher: organizationRef(origin),
  }
  if (creator) videoObject.creator = creator

  if (input.durationSeconds && input.durationSeconds > 0) {
    videoObject.duration = isoDurationFromSeconds(input.durationSeconds)
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbListJsonLd([
        { name: macwall.name, item: origin },
        { name: "Wallpapers", item: wallpapersIndexUrl },
        { name: categoryDisplayLabel(wallpaper.category), item: categoryUrl },
        { name: wallpaper.name, item: url },
      ]),
      {
        "@type": "WebPage",
        "@id": pageId,
        url,
        name: wallpaper.name,
        headline: input.headline ?? wallpaper.name,
        description: input.description,
        inLanguage: "en-US",
        isPartOf: { "@id": ids.website },
        publisher: organizationRef(origin),
        primaryImageOfPage: { "@id": `${url}#thumbnail` },
        video: { "@id": `${url}#video` },
      },
      imageObject,
      videoObject,
    ],
  } as const
}

/** CollectionPage + ItemList for a topic collection (`/wallpapers/collections/{slug}`). */
export function wallpaperCollectionJsonLd(input: {
  origin: string
  pathname: string
  name: string
  pageTitle: string
  description: string
  wallpapers: PublicWallpaper[]
  /** Not emitted: `numberOfItems` counts the listed wallpapers. */
  totalCount?: number
  /**
   * What the collection is about, e.g. a character with its Wikidata URL.
   * Defaults to a Thing named after the collection.
   */
  about?: { name: string; sameAs?: readonly string[] }
}) {
  const origin = input.origin.replace(/\/+$/, "")
  const url = absoluteUrl(origin, input.pathname)
  const wallpapersIndexUrl = absoluteUrl(origin, "/wallpapers")
  const hubUrl = absoluteUrl(origin, "/wallpapers/collections")
  const cover = input.wallpapers[0]
  const about = input.about ?? { name: input.name }

  return {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbListJsonLd([
        { name: macwall.name, item: origin },
        { name: "Wallpapers", item: wallpapersIndexUrl },
        { name: "Collections", item: hubUrl },
        { name: input.name, item: url },
      ]),
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: input.pageTitle,
        headline: `${input.name} live wallpapers for Mac`,
        description: input.description,
        inLanguage: "en-US",
        isPartOf: { "@id": siteEntityIds(origin).website },
        // The page is about its topic; the app is only mentioned.
        about: {
          "@type": "Thing",
          name: about.name,
          ...(about.sameAs?.length ? { sameAs: [...about.sameAs] } : {}),
        },
        mentions: { "@id": siteEntityIds(origin).softwareApplication },
        ...(cover
          ? {
              primaryImageOfPage: {
                "@type": "ImageObject",
                url: cover.thumbUrl,
                caption: `${cover.name}: ${input.name} live wallpaper for Mac`,
              },
            }
          : {}),
        mainEntity: itemListElementFromWallpapers(
          origin,
          input.wallpapers,
          `${input.name} live wallpapers for Mac`
        ),
      },
    ],
  } as const
}
