import { catalogPublicVideoUrlFromKey } from "@/lib/macwall-catalog-urls"
import type { MarketingCatalogSlide } from "@/lib/marketing-catalog-slides"
import { MARKETING_HOME_PICK_WALLPAPER_COUNT } from "@/lib/marketing-catalog-selection"

/**
 * Vendored thumbs under `public/marketing-supabase-thumbs/` — used when Supabase
 * fetch fails or returns fewer than six pick rows. Not used in hero or gallery.
 */
const LOCAL_HOME_PICK_ROWS = [
  {
    id: "spider-man-in-the-rain-moewalls-com",
    name: "Spider-Man in the Rain",
    category: "Anime",
    video_key: "videos/spider-man-in-the-rain-moewalls-com.mp4",
  },
  {
    id: "silent-train-ride-just-listen-to-the-song-moewalls-com",
    name: "Silent Train Ride",
    category: "City",
    video_key:
      "videos/silent-train-ride-just-listen-to-the-song-moewalls-com.mp4",
  },
  {
    id: "midnight-magic-cat-moewalls-com",
    name: "Midnight Magic Cat",
    category: "Cats",
    video_key: "videos/midnight-magic-cat-moewalls-com.mp4",
  },
  {
    id: "classic-cars-on-the-street-moewalls-com",
    name: "Classic Cars on the Street",
    category: "Cars",
    video_key: "videos/classic-cars-on-the-street-moewalls-com.mp4",
  },
  {
    id: "sci-fi-black-hole-moewalls-com",
    name: "Sci-Fi Black Hole",
    category: "Sci-fi",
    video_key: "videos/sci-fi-black-hole-moewalls-com.mp4",
  },
  {
    id: "sunlight-grass-moewalls-com",
    name: "Sunlight Grass",
    category: "Nature",
    video_key: "videos/sunlight-grass-moewalls-com.mp4",
  },
] as const

function localPickSlide(
  row: (typeof LOCAL_HOME_PICK_ROWS)[number]
): MarketingCatalogSlide {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    resolution: "3840×2160",
    file_size_bytes: 0,
    duration_seconds: 0,
    like_count: 0,
    thumbPath: `/marketing-supabase-thumbs/${row.id}.jpg`,
    videoUrl: catalogPublicVideoUrlFromKey(row.video_key),
  }
}

/** Always six tiles with local posters — never empty. */
export const MARKETING_HOME_PICKS_FALLBACK: MarketingCatalogSlide[] =
  LOCAL_HOME_PICK_ROWS.map(localPickSlide)

export function mergeMarketingHomePickSlides(
  primary: MarketingCatalogSlide[]
): MarketingCatalogSlide[] {
  const merged = [...primary]
  const seen = new Set(merged.map((slide) => slide.id))

  for (const slide of MARKETING_HOME_PICKS_FALLBACK) {
    if (merged.length >= MARKETING_HOME_PICK_WALLPAPER_COUNT) break
    if (seen.has(slide.id)) continue
    merged.push(slide)
    seen.add(slide.id)
  }

  return merged.slice(0, MARKETING_HOME_PICK_WALLPAPER_COUNT)
}