import { CollectionLinkStrip } from "@/components/wallpaper-gallery/collection-link-strip"
import { GalleryPagination } from "@/components/wallpaper-gallery/gallery-pagination"
import { galleryPageCount } from "@/lib/seo/gallery-pages"
import { WallpaperGalleryPageShell } from "@/components/wallpaper-gallery/wallpaper-gallery-page"
import { wallpaperCollections } from "@/lib/seo/wallpaper-collections"
import { JsonLd } from "@/components/seo/json-ld"
import { wallpaperGalleryIndexJsonLd } from "@/lib/seo/wallpaper-json-ld"
import { wallpaperGalleryIndexMetadata } from "@/lib/seo/wallpaper-metadata"
import { listPublicWallpapers } from "@/lib/public-catalog/fetch"
import { macwall, macwallCatalog } from "@/lib/macwall-site"
import { canonicalSiteOrigin } from "@/lib/site-url"
import type { Metadata } from "next"

const PAGE_TITLE = "Live Wallpapers for Mac and MacBook"
const PAGE_DESCRIPTION = `Browse ${macwallCatalog.liveCountLabel} live wallpapers for Mac and MacBook, most in 4K. They are video loops that play in the ${macwall.name} app, not still image downloads.`

export const metadata: Metadata = wallpaperGalleryIndexMetadata()

/**
 * Prerendered (ISR via the catalog fetch's 6h revalidate + tag) with the
 * unfiltered list. `?q=&tag=&sort=` are applied client-side by the gallery,
 * and next.config marks those URLs `noindex` with an `X-Robots-Tag` header.
 */
export default async function WallpapersGalleryPage() {
  let initial
  let loadError = false
  try {
    initial = await listPublicWallpapers({
      sort: "popular",
      page: 1,
      limit: 24,
    })
  } catch {
    loadError = true
    initial = {
      wallpapers: [],
      total: 0,
      page: 1,
      limit: 24,
      hasMore: false,
    }
  }

  const origin = canonicalSiteOrigin()
  const showJsonLd = !loadError

  return (
    <>
      {showJsonLd ? (
        <JsonLd
          payload={wallpaperGalleryIndexJsonLd({
            origin,
            pageTitle: PAGE_TITLE,
            headline: `${macwall.name} Live Wallpapers for Mac`,
            description: PAGE_DESCRIPTION,
            wallpapers: initial.wallpapers,
            totalCount: initial.total,
          })}
        />
      ) : null}
      <WallpaperGalleryPageShell
        initial={initial}
        title="Live wallpapers for Mac"
        loadError={loadError}
        afterGallery={
          <>
            {!loadError ? (
              <GalleryPagination
                basePath="/wallpapers"
                current={1}
                totalPages={galleryPageCount(initial.total)}
                label="Live wallpaper pages"
              />
            ) : null}
            <CollectionLinkStrip
              title="Popular collections"
              collections={wallpaperCollections}
            />
          </>
        }
      />
    </>
  )
}
