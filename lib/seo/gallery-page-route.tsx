import { GalleryPagination } from "@/components/wallpaper-gallery/gallery-pagination"
import { WallpaperCollectionPage } from "@/components/wallpaper-gallery/wallpaper-collection-page"
import { JsonLd } from "@/components/seo/json-ld"
import { listPublicWallpapers } from "@/lib/public-catalog/fetch"
import { categoryNameFromSlug } from "@/lib/seo/category-slugs"
import { brandedTitle } from "@/lib/seo/create-page-metadata"
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

function scopeInfo({ categorySlug }: GalleryScope) {
  const categoryName = categorySlug ? categoryNameFromSlug(categorySlug) : null
  if (categorySlug && !categoryName) return null
  return {
    categoryName,
    basePath: categorySlug ? `/wallpapers/${categorySlug}` : "/wallpapers",
    label: categoryName ? `${categoryName} Live Wallpapers` : "Live Wallpapers",
  }
}

export async function loadGalleryPage(scope: GalleryScope, rawPage: string) {
  const info = scopeInfo(scope)
  if (!info) return null
  // Same order as page 1 of the gallery.
  const first = await listPublicWallpapers({
    category: info.categoryName ?? undefined,
    sort: "popular",
    page: 1,
    limit: 1,
  })
  const page = parseGalleryPage(rawPage, first.total)
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
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: data.copy.description,
      images: [image.url],
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
    ...(data.categoryName
      ? [{ href: data.basePath, label: data.categoryName }]
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
          mainEntity: {
            "@type": "ItemList",
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
              name: crumb.label,
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
