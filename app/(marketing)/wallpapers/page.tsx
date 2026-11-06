import { CollectionLinkStrip } from "@/components/wallpaper-gallery/collection-link-strip"
import { DisplayLinkStrip } from "@/components/wallpaper-gallery/display-link-strip"
import { GalleryPagination } from "@/components/wallpaper-gallery/gallery-pagination"
import { galleryPageCount, GALLERY_PAGE_SIZE } from "@/lib/seo/gallery-pages"
import {
  GalleryHubProse,
  WallpaperGalleryPageShell,
} from "@/components/wallpaper-gallery/wallpaper-gallery-page"
import {
  collectionPublishable,
  wallpaperCollections,
} from "@/lib/seo/wallpaper-collections"
import { JsonLd } from "@/components/seo/json-ld"
import { galleryIndexSeo } from "@/lib/seo/category-seo"
import { faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { wallpaperGalleryIndexJsonLd } from "@/lib/seo/wallpaper-json-ld"
import { wallpaperGalleryIndexMetadata } from "@/lib/seo/wallpaper-metadata"
import { listPublicWallpapers } from "@/lib/public-catalog/fetch"
import { canonicalSiteOrigin } from "@/lib/site-url"
import type { Metadata } from "next"

export const metadata: Metadata = wallpaperGalleryIndexMetadata()

/** Collections linked from the index: every built topic (never real-person ones). */
const indexCollections = wallpaperCollections.filter(collectionPublishable)

/**
 * Prerendered (ISR via the catalog fetch's 6h revalidate + tag) with the
 * unfiltered list. `?q=&tag=&sort=` are applied client-side by the gallery,
 * and next.config marks those URLs `noindex` with an `X-Robots-Tag` header.
 *
 * All hub copy (title, H1, intro, FAQ) comes from `galleryIndexSeo` in
 * lib/seo/category-seo.ts.
 */
export default async function WallpapersGalleryPage() {
  let initial
  let loadError = false
  try {
    initial = await listPublicWallpapers({
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

  const origin = canonicalSiteOrigin()
  const showSeoContent = !loadError

  return (
    <>
      {showSeoContent ? (
        <JsonLd
          payload={wallpaperGalleryIndexJsonLd({
            origin,
            pageTitle: galleryIndexSeo.title,
            headline: galleryIndexSeo.headline,
            description: galleryIndexSeo.description,
            wallpapers: initial.wallpapers,
          })}
        />
      ) : null}
      {showSeoContent && galleryIndexSeo.faq.length > 0 ? (
        <JsonLd payload={faqPageJsonLd(galleryIndexSeo.faq)} />
      ) : null}
      <WallpaperGalleryPageShell
        initial={initial}
        title={galleryIndexSeo.headline}
        intro={galleryIndexSeo.intro}
        loadError={loadError}
        afterGallery={
          <>
            {showSeoContent ? (
              <GalleryPagination
                basePath="/wallpapers"
                current={1}
                totalPages={galleryPageCount(initial.total)}
                label="Live wallpaper pages"
              />
            ) : null}
            <CollectionLinkStrip
              title="Popular collections"
              collections={indexCollections}
            />
            <DisplayLinkStrip />
            {showSeoContent ? (
              <GalleryHubProse faq={galleryIndexSeo.faq} />
            ) : null}
          </>
        }
      />
    </>
  )
}
