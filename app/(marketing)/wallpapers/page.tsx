import { WallpaperGalleryPageShell, parseGallerySort } from "@/components/wallpaper-gallery/wallpaper-gallery-page"
import { JsonLd } from "@/components/seo/json-ld"
import { wallpaperGalleryIndexJsonLd } from "@/lib/seo/wallpaper-json-ld"
import {
  isGalleryFilteredView,
  wallpaperGalleryIndexMetadata,
} from "@/lib/seo/wallpaper-metadata"
import { listPublicWallpapers } from "@/lib/public-catalog/fetch"
import { macwall } from "@/lib/macwall-site"
import { canonicalSiteOrigin } from "@/lib/site-url"
import type { Metadata } from "next"

const PAGE_TITLE = "Live Wallpapers for Mac"
const PAGE_DESCRIPTION = `Browse cinematic live wallpapers for Mac on ${macwall.name}. Search by category, resolution, and style — then set any wallpaper in the MacWall app.`

type PageProps = {
  searchParams: Promise<{
    q?: string
    tag?: string
    sort?: string
  }>
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams
  return wallpaperGalleryIndexMetadata(params)
}

export default async function WallpapersGalleryPage({ searchParams }: PageProps) {
  const params = await searchParams
  let initial
  let loadError = false
  try {
    initial = await listPublicWallpapers({
      q: params.q,
      tag: params.tag,
      sort: parseGallerySort(params.sort),
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
  const showJsonLd = !loadError && !isGalleryFilteredView(params)

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
      />
    </>
  )
}
