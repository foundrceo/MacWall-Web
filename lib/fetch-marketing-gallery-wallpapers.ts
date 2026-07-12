import { unstable_cache } from "next/cache"
import {
  catalogMarketingGalleryPosterUrlFromKey,
  catalogPublicThumbUrlFromKey,
  catalogPublicVideoUrlFromKey,
} from "@/lib/macwall-catalog-urls"
import {
  MARKETING_CATALOG_REVALIDATE_SECONDS,
  MARKETING_GALLERY_CACHE_TAG,
} from "@/lib/marketing-cache"
import {
  fetchMarketingCatalogRows,
  pickMarketingGalleryRows,
  type MarketingCatalogWallpaperRow,
} from "@/lib/marketing-catalog-selection"
import {
  MARKETING_GALLERY_WALLPAPER_COUNT,
  MARKETING_GALLERY_WALLPAPERS_FALLBACK,
  type MarketingGalleryWallpaper,
} from "@/lib/marketing-gallery-wallpapers"

function mapRow(row: MarketingCatalogWallpaperRow): MarketingGalleryWallpaper {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    videoUrl: catalogPublicVideoUrlFromKey(row.video_key),
    thumbUrl: catalogPublicThumbUrlFromKey(row.thumb_key),
    posterUrl: catalogMarketingGalleryPosterUrlFromKey(row.thumb_key),
  }
}

async function fetchMarketingGalleryWallpapersFromSupabase(): Promise<
  MarketingGalleryWallpaper[]
> {
  const rows = await fetchMarketingCatalogRows()
  const picked = pickMarketingGalleryRows(rows)
  if (picked.length < MARKETING_GALLERY_WALLPAPER_COUNT) {
    return MARKETING_GALLERY_WALLPAPERS_FALLBACK
  }

  return picked.map(mapRow)
}

const getCachedMarketingGalleryWallpapers = unstable_cache(
  async () => {
    try {
      return await fetchMarketingGalleryWallpapersFromSupabase()
    } catch {
      return MARKETING_GALLERY_WALLPAPERS_FALLBACK
    }
  },
  ["marketing-gallery-wallpapers-v1"],
  {
    revalidate: MARKETING_CATALOG_REVALIDATE_SECONDS,
    tags: [MARKETING_GALLERY_CACHE_TAG],
  }
)

/** Top catalog picks for the homepage gallery — cached with ISR + on-demand tags. */
export async function fetchMarketingGalleryWallpapers(): Promise<
  MarketingGalleryWallpaper[]
> {
  return getCachedMarketingGalleryWallpapers()
}