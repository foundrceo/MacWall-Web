/**
 * Featured hero carousel for marketing — six live catalog wallpapers from Supabase.
 * Thumbnails are vendored under `public/marketing-supabase-thumbs/` (run
 * `npm run marketing:sync-wallpapers`).
 * Videos stream from Storage public URLs (~same as shipped MacWall app).
 */
import { catalogPublicVideoUrlFromKey } from "@/lib/macwall-catalog-urls"

export type MarketingWallpaperSlide = {
  id: string
  name: string
  category: string
  resolution: string
  file_size_bytes: number
  duration_seconds: number
  like_count: number
  /** Local JPG under `public/marketing-supabase-thumbs/` — sync via `npm run marketing:sync-wallpapers`. */
  thumbPath: string
  videoUrl: string
}

/** Top six by likes; categories diversified. Hero order left → newest selection index 0 starts at Spider-Man strip. */
const rows = [
  {
    id: "spider-man-in-the-rain-moewalls-com",
    name: "Spider Man In The Rain",
    category: "Anime",
    resolution: "3840×2160",
    file_size_bytes: 28461238,
    duration_seconds: 19,
    like_count: 3,
    video_key: "videos/spider-man-in-the-rain-moewalls-com.mp4",
  },
  {
    id: "midnight-magic-cat-moewalls-com",
    name: "Midnight Magic Cat",
    category: "Cats",
    resolution: "—",
    file_size_bytes: 51150137,
    duration_seconds: 0,
    like_count: 2,
    video_key: "videos/midnight-magic-cat-moewalls-com.mp4",
  },
  {
    id: "silent-train-ride-just-listen-to-the-song-moewalls-com",
    name: "Silent Train Ride (Listen to the Song)",
    category: "City",
    resolution: "—",
    file_size_bytes: 26395450,
    duration_seconds: 0,
    like_count: 2,
    video_key:
      "videos/silent-train-ride-just-listen-to-the-song-moewalls-com.mp4",
  },
  {
    id: "classic-cars-on-the-street-moewalls-com",
    name: "Classic Cars On The Street",
    category: "Cars",
    resolution: "3840×2160",
    file_size_bytes: 32303099,
    duration_seconds: 24.95,
    like_count: 1,
    video_key: "videos/classic-cars-on-the-street-moewalls-com.mp4",
  },
  {
    id: "sci-fi-black-hole-moewalls-com",
    name: "Sci-Fi Black Hole",
    category: "Sci-fi",
    resolution: "—",
    file_size_bytes: 26718723,
    duration_seconds: 0,
    like_count: 1,
    video_key: "videos/sci-fi-black-hole-moewalls-com.mp4",
  },
  {
    id: "sunlight-grass-moewalls-com",
    name: "Sunlight Grass",
    category: "Nature",
    resolution: "—",
    file_size_bytes: 10476420,
    duration_seconds: 0,
    like_count: 1,
    video_key: "videos/sunlight-grass-moewalls-com.mp4",
  },
] as const

export const MARKETING_SUPABASE_WALLPAPER_SLIDES: MarketingWallpaperSlide[] =
  rows.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    resolution: r.resolution,
    file_size_bytes: r.file_size_bytes,
    duration_seconds: r.duration_seconds,
    like_count: r.like_count,
    thumbPath: `/marketing-supabase-thumbs/${r.id}.jpg`,
    videoUrl: catalogPublicVideoUrlFromKey(r.video_key),
  }))
