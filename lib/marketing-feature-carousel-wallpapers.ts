import {
  buildMarketingGalleryWallpaper,
  FALLBACK_SEEDS,
} from "@/lib/marketing-gallery-wallpapers"

export type MarketingFeatureCarouselWallpaper = {
  id: string
  name: string
  posterUrl: string
  thumbUrl: string
  videoUrl?: string
  videoKey?: string
  createdAt?: string
}

/** Static fallback when Supabase/R2 catalog fetch is unavailable at build time. */
export const MARKETING_FEATURE_CAROUSEL_FALLBACK: MarketingFeatureCarouselWallpaper[] =
  FALLBACK_SEEDS.map((seed) => {
    const built = buildMarketingGalleryWallpaper(seed)
    return {
      id: seed.id,
      name: seed.name,
      posterUrl: built.posterUrl,
      thumbUrl: built.thumbUrl,
      videoUrl: built.videoUrl,
      videoKey: seed.videoKey,
    }
  })

export const FEATURE_CAROUSEL_ROW_COUNT = 5

/** Split newest→oldest list into rows (row 0 = newest chunk). */
export function assignLatestWallpapersToRows(
  items: readonly MarketingFeatureCarouselWallpaper[],
  rowCount = FEATURE_CAROUSEL_ROW_COUNT
): MarketingFeatureCarouselWallpaper[][] {
  if (items.length === 0) return []

  const perRow = Math.ceil(items.length / rowCount)
  return Array.from({ length: rowCount }, (_, rowIndex) =>
    items.slice(rowIndex * perRow, (rowIndex + 1) * perRow)
  ).filter((row) => row.length > 0)
}
