import { GalleryPagination } from "@/components/wallpaper-gallery/gallery-pagination"
import { WallpaperCollectionPage } from "@/components/wallpaper-gallery/wallpaper-collection-page"
import { JsonLd } from "@/components/seo/json-ld"
import { macwall } from "@/lib/macwall-site"
import { listPublicWallpapers } from "@/lib/public-catalog/fetch"
import {
  canonicalCategoryNameFromSlug,
  wallpaperCategorySlugs,
} from "@/lib/seo/category-slugs"
import { categorySeoFor } from "@/lib/seo/category-seo"
import { brandedTitle, OPEN_GRAPH_LOCALE } from "@/lib/seo/create-page-metadata"
import {
  GALLERY_PAGE_SIZE,
  galleryPageCopy,
  galleryPageCount,
  parseGalleryPage,
} from "@/lib/seo/gallery-pages"
import { wallpaperDetailPath } from "@/lib/public-catalog/urls"
import {
  canonicalSitePath,
  feedAlternateTypes,
  openGraphImageAbsoluteUrl,
  openGraphImageSize,
} from "@/lib/site-url"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

/**
 * Shared by `/wallpapers/page/[page]` and `/wallpapers/[category]/page/[page]`:
 * a server-rendered page of the gallery with plain links, so every wallpaper
 * is a few clicks from the gallery without running "Show more".
 */
type GalleryScope = { categorySlug: string | null }

/** "Car Live Wallpapers" from the hub H1 "Car live wallpapers for Mac". */
function categoryPageLabel(categoryName: string): string {
  const seo = categorySeoFor(categoryName)
  const subject =
    seo?.headline.match(/^(.+?) live wallpapers for Mac$/i)?.[1] ??
    seo?.displayLabel ??
    categoryName
  return `${subject} Live Wallpapers`
}

/**
 * Current category slugs only: a retired slug (`/wallpapers/city/page/2`)
 * would otherwise render a self-canonical copy of another category's pages.
 * next.config.mjs 308s those to the category that holds their wallpapers.
 */
function scopeInfo({ categorySlug }: GalleryScope) {
  const categoryName = categorySlug
    ? (canonicalCategoryNameFromSlug(categorySlug) ?? null)
    : null
  if (categorySlug && !categoryName) return null
  return {
    categoryName,
    crumbLabel: categoryName
      ? (categorySeoFor(categoryName)?.displayLabel ?? categoryName)
      : null,
    basePath: categorySlug ? `/wallpapers/${categorySlug}` : "/wallpapers",
    label: categoryName ? categoryPageLabel(categoryName) : "Live Wallpapers",
  }
}

/** Total wallpapers in a scope: the same cached lookup page 1 of the gallery uses. */
async function scopeTotal(categoryName: string | null): Promise<number> {
  const first = await listPublicWallpapers({
    category: categoryName ?? undefined,
    sort: "popular",
    page: 1,
    limit: 1,
  })
  return first.total
}

/**
 * Every `/page/{n}` of a scope (2 to the last page), for generateStaticParams,
 * so each one is prerendered and served from cache instead of rendered cold
 * for the first crawler. Pages added after the build still render on demand.
 */
export async function galleryStaticPageNumbers(
  scope: GalleryScope
): Promise<string[]> {
  const info = scopeInfo(scope)
  if (!info) return []
  const total = await scopeTotal(info.categoryName).catch(() => 0)
  const totalPages = galleryPageCount(total)
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) =>
    String(index + 2)
  )
}

/** `{ category, page }` for every category's `/page/{n}`. */
export async function categoryGalleryStaticParams(): Promise<
  { category: string; page: string }[]
> {
  const perCategory = await Promise.all(
    wallpaperCategorySlugs.map(async (category) =>
      (await galleryStaticPageNumbers({ categorySlug: category })).map(
        (page) => ({ category, page })
      )
    )
  )
  return perCategory.flat()
}

export async function loadGalleryPage(scope: GalleryScope, rawPage: string) {
  const info = scopeInfo(scope)
  if (!info) return null
  // Same order as page 1 of the gallery.
  const page = parseGalleryPage(rawPage, await scopeTotal(info.categoryName))
  if (!page) return null
  const result = await listPublicWallpapers({
    category: info.categoryName ?? undefined,
    sort: "popular",
    page,
    limit: GALLERY_PAGE_SIZE,
  })
  const totalPages = galleryPageCount(result.total)
  const copy = galleryPageCopy({
    label: info.label,
    page,
    totalPages,
    total: result.total,
    firstName: result.wallpapers[0]?.name,
  })
  return { ...info, page, totalPages, result, copy }
}

export async function galleryPageMetadata(
  scope: GalleryScope,
  rawPage: string
): Promise<Metadata> {
  const data = await loadGalleryPage(scope, rawPage).catch(() => null)
  if (!data) return {}
  const path = `${data.basePath}/page/${data.page}`
  const title = brandedTitle(data.copy.title)
  const image = {
    url: openGraphImageAbsoluteUrl(),
    ...openGraphImageSize,
    alt: data.copy.title,
  }
  return {
    title: { absolute: title },
    description: data.copy.description,
    alternates: {
      canonical: canonicalSitePath(path),
      types: {
        ...feedAlternateTypes(),
        "text/markdown": canonicalSitePath(`${path}.md`),
      },
    },
    openGraph: {
      title,
      description: data.copy.description,
      url: canonicalSitePath(path),
      siteName: macwall.name,
      locale: OPEN_GRAPH_LOCALE,
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: data.copy.description,
      images: [{ url: image.url, alt: image.alt }],
    },
  }
}

export async function GalleryPageRoute({
  scope,
  rawPage,
}: {
  scope: GalleryScope
  rawPage: string
}) {
  const data = await loadGalleryPage(scope, rawPage)
  if (!data) notFound()
  const path = `${data.basePath}/page/${data.page}`
  const crumbs = [
    { href: "/", label: "Home" },
    { href: "/wallpapers", label: "Wallpapers" },
    ...(data.categoryName && data.crumbLabel
      ? [{ href: data.basePath, label: data.crumbLabel }]
      : []),
    { href: path, label: `Page ${data.page}` },
  ]
  return (
    <>
      <JsonLd
        payload={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: data.copy.title,
          url: canonicalSitePath(path),
          description: data.copy.description,
          inLanguage: "en-US",
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: data.result.wallpapers.length,
            itemListElement: data.result.wallpapers.map((wallpaper, index) => ({
              "@type": "ListItem",
              position: (data.page - 1) * GALLERY_PAGE_SIZE + index + 1,
              url: canonicalSitePath(wallpaperDetailPath(wallpaper)),
              name: wallpaper.name,
            })),
          },
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: crumbs.map((crumb, index) => ({
              "@type": "ListItem",
              position: index + 1,
              // The site's root crumb is the brand everywhere in JSON-LD.
              name: index === 0 ? macwall.name : crumb.label,
              item: canonicalSitePath(crumb.href),
            })),
          },
        }}
      />
      <WallpaperCollectionPage
        breadcrumbs={crumbs}
        title={`${data.label} for Mac, page ${data.page}`}
        intro={data.copy.description}
        wallpapers={data.result.wallpapers}
        footer={
          <GalleryPagination
            basePath={data.basePath}
            current={data.page}
            totalPages={data.totalPages}
            label={`${data.label} pages`}
          />
        }
      />
    </>
  )
}
