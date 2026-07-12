import {
  getCatalogSupabaseAnonKey,
  getCatalogSupabaseOrigin,
} from "@/lib/env/catalog-supabase"
import {
  catalogMarketingGalleryPosterUrlFromKey,
  catalogPublicThumbUrlFromKey,
  catalogPublicVideoUrlFromKey,
} from "@/lib/macwall-catalog-urls"
import { MARKETING_CATALOG_SLIDES } from "@/lib/marketing-catalog-slides"
import type { MarketingCatalogSlide } from "@/lib/marketing-catalog-slides"

export type MarketingCatalogWallpaperRow = {
  id: string
  name: string
  category: string
  video_key: string
  thumb_key: string
  is_featured?: boolean
  is_curated_pick?: boolean
  like_count?: number
  file_size_bytes?: number
}

export const MARKETING_HERO_WALLPAPER_IDS = new Set(
  MARKETING_CATALOG_SLIDES.map((slide) => slide.id)
)

export const MARKETING_GALLERY_WALLPAPER_COUNT = 20

export const MARKETING_HOME_PICK_WALLPAPER_COUNT = 6

const MAX_GALLERY_BYTES = 28 * 1024 * 1024

export function isBrowserMp4(videoKey: string): boolean {
  return videoKey.trim().toLowerCase().endsWith(".mp4")
}

export function scoreCatalogRow(row: MarketingCatalogWallpaperRow): number {
  let score =
    (row.is_featured ? 1000 : 0) +
    (row.is_curated_pick ? 500 : 0) +
    (row.like_count ?? 0)

  if (!isBrowserMp4(row.video_key)) score -= 250
  const bytes = row.file_size_bytes ?? 0
  if (bytes > MAX_GALLERY_BYTES) score -= 120
  else if (bytes > 0) score -= Math.floor(bytes / (8 * 1024 * 1024))

  return score
}

export function compareCatalogRows(
  a: MarketingCatalogWallpaperRow,
  b: MarketingCatalogWallpaperRow
): number {
  const scoreDiff = scoreCatalogRow(b) - scoreCatalogRow(a)
  if (scoreDiff !== 0) return scoreDiff
  return (
    (a.file_size_bytes ?? Number.MAX_SAFE_INTEGER) -
    (b.file_size_bytes ?? Number.MAX_SAFE_INTEGER)
  )
}

export async function fetchMarketingCatalogRows(): Promise<
  MarketingCatalogWallpaperRow[]
> {
  const origin = getCatalogSupabaseOrigin()
  const key = getCatalogSupabaseAnonKey()
  const params = new URLSearchParams({
    select:
      "id,name,category,video_key,thumb_key,is_featured,is_curated_pick,like_count,file_size_bytes",
    order:
      "is_featured.desc,is_curated_pick.desc,like_count.desc,created_at.desc",
    limit: "160",
  })

  const res = await fetch(`${origin}/rest/v1/wallpapers?${params}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`Catalog fetch failed: HTTP ${res.status}`)
  }

  return (await res.json()) as MarketingCatalogWallpaperRow[]
}

/** Homepage gallery — best 20, excluding hero carousel IDs only. */
export function pickMarketingGalleryRows(
  rows: MarketingCatalogWallpaperRow[]
): MarketingCatalogWallpaperRow[] {
  const candidates = rows.filter((row) => !MARKETING_HERO_WALLPAPER_IDS.has(row.id))
  const sorted = [...candidates].sort(compareCatalogRows)

  const picked: MarketingCatalogWallpaperRow[] = []
  const seenCategories = new Set<string>()

  for (const row of sorted) {
    if (!seenCategories.has(row.category) || picked.length < 12) {
      picked.push(row)
      seenCategories.add(row.category)
    }
    if (picked.length >= MARKETING_GALLERY_WALLPAPER_COUNT) break
  }

  if (picked.length < MARKETING_GALLERY_WALLPAPER_COUNT) {
    for (const row of sorted) {
      if (picked.some((item) => item.id === row.id)) continue
      picked.push(row)
      if (picked.length >= MARKETING_GALLERY_WALLPAPER_COUNT) break
    }
  }

  return picked.slice(0, MARKETING_GALLERY_WALLPAPER_COUNT)
}

/**
 * MacWall's Pick demo row — top 6 by catalog score, excluding hero + gallery wallpapers
 * so these clips are reserved for the in-app demo only.
 */
export function pickMarketingHomePickRows(
  rows: MarketingCatalogWallpaperRow[]
): MarketingCatalogWallpaperRow[] {
  const galleryIds = new Set(
    pickMarketingGalleryRows(rows).map((row) => row.id)
  )
  const exclude = new Set<string>([
    ...MARKETING_HERO_WALLPAPER_IDS,
    ...galleryIds,
  ])

  return rows
    .filter((row) => !exclude.has(row.id) && isBrowserMp4(row.video_key))
    .sort(compareCatalogRows)
    .slice(0, MARKETING_HOME_PICK_WALLPAPER_COUNT)
}

export function catalogRowToMarketingSlide(
  row: MarketingCatalogWallpaperRow
): MarketingCatalogSlide {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    resolution: "3840×2160",
    file_size_bytes: row.file_size_bytes ?? 0,
    duration_seconds: 0,
    like_count: row.like_count ?? 0,
    thumbPath: catalogMarketingGalleryPosterUrlFromKey(row.thumb_key),
    thumbFallbackPath: catalogPublicThumbUrlFromKey(row.thumb_key),
    videoUrl: catalogPublicVideoUrlFromKey(row.video_key),
  }
}