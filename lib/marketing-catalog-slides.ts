/**
 * Featured hero carousel for marketing — six live catalog wallpapers from Supabase.
 * Thumbnails are vendored under `public/marketing-supabase-thumbs/` (run
 * `pnpm run marketing:sync-catalog-thumbs`).
 * Videos stream from Storage public URLs (~same as shipped MacWall app).
 */
import { catalogPublicVideoUrlFromKey } from "@/lib/macwall-catalog-urls"

export type MarketingCatalogSlide = {
  id: string
  name: string
  category: string
  resolution: string
  file_size_bytes: number
  duration_seconds: number
  like_count: number
  /** Local JPG under `public/marketing-supabase-thumbs/` — sync via catalog thumb script. */
  thumbPath: string
  videoUrl: string
}

/** Top six by likes; categories diversified. Hero order left → newest selection index 0 starts at Spider-Man strip. */
const rows = [
  {
    id: "supra-anime-garage",
    name: "Supra Anime Garage",
    category: "Cars",
    resolution: "3840×2160",
    file_size_bytes: 27283170,
    duration_seconds: 30,
    like_count: 1,
    video_key: "videos/supra-anime-garage.mp4",
  },
  {
    id: "wallpaper-1773917256",
    name: "Ferrari Formula Front",
    category: "Cars",
    resolution: "4096×2304",
    file_size_bytes: 24865335,
    duration_seconds: 18.589,
    like_count: 1,
    video_key: "videos/wallpaper-1773917256.mp4",
  },
  {
    id: "orbital-station-above-earth",
    name: "Orbital Station Above Earth",
    category: "Space",
    resolution: "3456×2160",
    file_size_bytes: 86069884,
    duration_seconds: 0,
    like_count: 0,
    video_key: "videos/orbital-station-above-earth.mp4",
  },
  {
    id: "sukuna-battle-pose",
    name: "Sukuna Battle Pose",
    category: "Anime",
    resolution: "3840×2160",
    file_size_bytes: 44613681,
    duration_seconds: 0,
    like_count: 0,
    video_key: "videos/sukuna-battle-pose.mp4",
  },
  {
    id: "gentle-fern-leaves",
    name: "Gentle Fern Leaves",
    category: "Nature",
    resolution: "1920×1080",
    file_size_bytes: 23348258,
    duration_seconds: 12.6,
    like_count: 1,
    video_key: "videos/gentle-fern-leaves.mp4",
  },
] as const

export const MARKETING_CATALOG_SLIDES: MarketingCatalogSlide[] = rows.map(
  (r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    resolution: r.resolution,
    file_size_bytes: r.file_size_bytes,
    duration_seconds: r.duration_seconds,
    like_count: r.like_count,
    thumbPath: `/marketing-supabase-thumbs/${r.id}.jpg`,
    videoUrl: catalogPublicVideoUrlFromKey(r.video_key),
  })
)

/** Homepage “Wallpaper in motion” block — change when the final clip is chosen. */
export const MARKETING_LIVE_WALLPAPER_PREVIEW: MarketingCatalogSlide | null =
  MARKETING_CATALOG_SLIDES[0] ?? null
