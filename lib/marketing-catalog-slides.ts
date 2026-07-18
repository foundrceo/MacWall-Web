/**
 * Featured hero carousel IDs — videos and posters from R2 CDN (same as live catalog).
 */
import {
  catalogPublicThumbUrlFromKey,
  catalogPublicVideoUrlFromKey,
} from "@/lib/macwall-catalog-urls"

export type MarketingCatalogSlide = {
  id: string
  name: string
  category: string
  resolution: string
  file_size_bytes: number
  duration_seconds: number
  like_count: number
  /** R2 poster/thumb URL. */
  thumbPath: string
  /** Optional second URL if `thumbPath` fails to load (demo pick tiles). */
  thumbFallbackPath?: string
  videoUrl: string
}

/** Top picks by likes; categories diversified. */
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
    thumb_key: "thumbs/supra-anime-garage.jpg",
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
    thumb_key: "thumbs/wallpaper-1773917256.jpg",
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
    thumb_key: "thumbs/orbital-station-above-earth.jpg",
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
    thumb_key: "thumbs/sukuna-battle-pose.jpg",
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
    thumb_key: "thumbs/gentle-fern-leaves.jpg",
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
    thumbPath: catalogPublicThumbUrlFromKey(r.thumb_key),
    videoUrl: catalogPublicVideoUrlFromKey(r.video_key),
  })
)

/** Homepage “Wallpaper in motion” block — change when the final clip is chosen. */
export const MARKETING_LIVE_WALLPAPER_PREVIEW: MarketingCatalogSlide | null =
  MARKETING_CATALOG_SLIDES[0] ?? null
