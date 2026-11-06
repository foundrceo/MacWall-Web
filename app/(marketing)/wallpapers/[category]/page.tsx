import {
  GalleryHubProse,
  WallpaperGalleryPageShell,
} from "@/components/wallpaper-gallery/wallpaper-gallery-page"
import { CollectionLinkStrip } from "@/components/wallpaper-gallery/collection-link-strip"
import { DisplayLinkStrip } from "@/components/wallpaper-gallery/display-link-strip"
import { GalleryPagination } from "@/components/wallpaper-gallery/gallery-pagination"
import { galleryPageCount, GALLERY_PAGE_SIZE } from "@/lib/seo/gallery-pages"
import { JsonLd } from "@/components/seo/json-ld"
import { wallpaperCategoryGalleryJsonLd } from "@/lib/seo/wallpaper-json-ld"
import { wallpaperCategoryGalleryMetadata } from "@/lib/seo/wallpaper-metadata"
import { listPublicWallpapers } from "@/lib/public-catalog/fetch"
import {
  canonicalCategoryNameFromSlug,
  wallpaperCategorySlugs,
} from "@/lib/seo/category-slugs"
import {
  categoryCollections,
  categoryHubIntro,
  categoryHubSections,
  categorySeoFor,
} from "@/lib/seo/category-seo"
import { wallpaperCategoryPage } from "@/lib/seo/landing-pages"
import { faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { canonicalSiteOrigin } from "@/lib/site-url"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

type PageProps = {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  return wallpaperCategorySlugs.map((category) => ({ category }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category } = await params
  const name = canonicalCategoryNameFromSlug(category)
  if (!name) return {}

  return wallpaperCategoryGalleryMetadata(name)
}

/**
 * Prerendered per category (ISR via the catalog fetch's 6h revalidate + tag).
 * `?q=&tag=&sort=` are applied client-side by the gallery, and next.config
 * marks those URLs `noindex` with an `X-Robots-Tag` header. Retired slugs
 * (`/wallpapers/city`) 308 in next.config and never reach this page.
 *
 * All hub copy (title, H1, intro, body, FAQ) comes from lib/seo/category-seo.ts.
 */
export default async function WallpaperCategoryGalleryPage({
  params,
}: PageProps) {
  const { category } = await params
  const name = canonicalCategoryNameFromSlug(category)
  if (!name) notFound()

  const origin = canonicalSiteOrigin()

  let initial
  let loadError = false
  try {
    initial = await listPublicWallpapers({
      category: name,
      sort: "popular",
      page: 1,
      limit: GALLERY_PAGE_SIZE,
    })
  } catch {
    loadError = true
    initial = {
      wallpapers: [],
      total: 0,
      page: 1,
      limit: GALLERY_PAGE_SIZE,
      hasMore: false,
    }
  }

  const showSeoContent = !loadError
  // Same title, headline and description the metadata uses.
  const page = wallpaperCategoryPage(name)
  const seo = categorySeoFor(name)
  const faq = seo?.faq ?? []
  const displayLabel = seo?.displayLabel ?? name

  return (
    <>
      {showSeoContent ? (
        <JsonLd
          payload={wallpaperCategoryGalleryJsonLd({
            origin,
            categoryName: name,
            pageTitle: page.title,
            headline: page.headline,
            description: page.description,
            wallpapers: initial.wallpapers,
          })}
        />
      ) : null}
      {showSeoContent && faq.length > 0 ? (
        <JsonLd payload={faqPageJsonLd(faq)} />
      ) : null}
      <WallpaperGalleryPageShell
        initial={initial}
        activeCategory={name}
        title={page.headline}
        intro={categoryHubIntro(name, initial.total)}
        loadError={loadError}
        afterGallery={
          showSeoContent ? (
            <>
              <GalleryPagination
                basePath={`/wallpapers/${category}`}
                current={1}
                totalPages={galleryPageCount(initial.total)}
                label={`${displayLabel} live wallpaper pages`}
              />
              <CollectionLinkStrip
                title={`${displayLabel} collections`}
                collections={categoryCollections(name)}
              />
              <DisplayLinkStrip />
              <GalleryHubProse
                sections={categoryHubSections(name)}
                faq={faq}
                faqHeadingId="category-faq"
              />
            </>
          ) : null
        }
      />
    </>
  )
}
