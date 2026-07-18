import { unstable_cache } from "next/cache"
import {
  catalogMarketingGalleryPosterUrlFromKey,
  catalogPublicThumbUrlFromKey,
} from "@/lib/macwall-catalog-urls"
import {
  MARKETING_CATALOG_REVALIDATE_SECONDS,
  MARKETING_GALLERY_CACHE_TAG,
} from "@/lib/marketing-cache"
import {
  fetchLatestMarketingCatalogRows,
  MARKETING_FEATURE_CAROUSEL_WALLPAPER_COUNT,
  pickLatestMarketingCarouselRows,
  type MarketingCatalogWallpaperRow,
} from "@/lib/marketing-catalog-selection"
import { MARKETING_FEATURE_CAROUSEL_FALLBACK } from "@/lib/marketing-feature-carousel-wallpapers"
import type { MarketingFeatureCarouselWallpaper } from "@/lib/marketing-feature-carousel-wallpapers"

export type { MarketingFeatureCarouselWallpaper }

const CAROUSEL_THUMB_PROBE_TIMEOUT_MS = 4_000

function mapRow(row: MarketingCatalogWallpaperRow): MarketingFeatureCarouselWallpaper {
  return {
    id: row.id,
    name: row.name,
    posterUrl: catalogMarketingGalleryPosterUrlFromKey(row.thumb_key),
    thumbUrl: catalogPublicThumbUrlFromKey(row.thumb_key),
    createdAt: row.created_at,
  }
}

async function isR2ThumbReachable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(CAROUSEL_THUMB_PROBE_TIMEOUT_MS),
    })
    return res.ok
  } catch {
    return false
  }
}

async function filterRowsWithReachableThumbs(
  rows: MarketingCatalogWallpaperRow[]
): Promise<MarketingCatalogWallpaperRow[]> {
  const checks = await Promise.all(
    rows.map(async (row) => ({
      row,
      ok: await isR2ThumbReachable(
        catalogPublicThumbUrlFromKey(row.thumb_key)
      ),
    }))
  )

  return checks.filter((entry) => entry.ok).map((entry) => entry.row)
}

async function fetchFromCatalog(): Promise<MarketingFeatureCarouselWallpaper[]> {
  const rows = await fetchLatestMarketingCatalogRows()
  const candidates = pickLatestMarketingCarouselRows(
    rows,
    rows.length
  )
  const validated = await filterRowsWithReachableThumbs(candidates)
  const picked = validated.slice(0, MARKETING_FEATURE_CAROUSEL_WALLPAPER_COUNT)

  if (picked.length === 0) {
    return MARKETING_FEATURE_CAROUSEL_FALLBACK
  }

  return picked.map(mapRow)
}

const getCachedFeatureCarouselWallpapers = unstable_cache(
  async () => {
    try {
      return await fetchFromCatalog()
    } catch {
      return MARKETING_FEATURE_CAROUSEL_FALLBACK
    }
  },
  ["marketing-feature-carousel-wallpapers-v2"],
  {
    revalidate: MARKETING_CATALOG_REVALIDATE_SECONDS,
    tags: [MARKETING_GALLERY_CACHE_TAG],
  }
)

/** Latest catalog wallpapers for the homepage browse carousel (R2 thumb URLs). */
export async function fetchMarketingFeatureCarouselWallpapers(): Promise<
  MarketingFeatureCarouselWallpaper[]
> {
  return getCachedFeatureCarouselWallpapers()
}
