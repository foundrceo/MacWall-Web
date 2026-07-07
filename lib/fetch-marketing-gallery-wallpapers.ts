import { unstable_cache } from "next/cache"
import {
  getCatalogSupabaseAnonKey,
  getCatalogSupabaseOrigin,
} from "@/lib/env/catalog-supabase"
import {
  catalogMarketingGalleryPosterUrlFromKey,
  catalogPublicThumbUrlFromKey,
  catalogPublicVideoUrlFromKey,
} from "@/lib/macwall-catalog-urls"
import {
  MARKETING_CATALOG_REVALIDATE_SECONDS,
  MARKETING_GALLERY_CACHE_TAG,
} from "@/lib/marketing-cache"
import { MARKETING_CATALOG_SLIDES } from "@/lib/marketing-catalog-slides"
import {
  MARKETING_GALLERY_WALLPAPER_COUNT,
  MARKETING_GALLERY_WALLPAPERS_FALLBACK,
  type MarketingGalleryWallpaper,
} from "@/lib/marketing-gallery-wallpapers"

type WallpaperRow = {
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

const HERO_EXCLUDE_IDS = new Set(
  MARKETING_CATALOG_SLIDES.map((slide) => slide.id)
)

const MAX_GALLERY_BYTES = 28 * 1024 * 1024

function isBrowserMp4(videoKey: string): boolean {
  return videoKey.trim().toLowerCase().endsWith(".mp4")
}

function rowScore(row: WallpaperRow): number {
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

function compareGalleryRows(a: WallpaperRow, b: WallpaperRow): number {
  const scoreDiff = rowScore(b) - rowScore(a)
  if (scoreDiff !== 0) return scoreDiff
  return (
    (a.file_size_bytes ?? Number.MAX_SAFE_INTEGER) -
    (b.file_size_bytes ?? Number.MAX_SAFE_INTEGER)
  )
}

function pickGalleryRows(rows: WallpaperRow[]): WallpaperRow[] {
  const candidates = rows.filter((row) => !HERO_EXCLUDE_IDS.has(row.id))
  const sorted = [...candidates].sort(compareGalleryRows)

  const picked: WallpaperRow[] = []
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

function mapRow(row: WallpaperRow): MarketingGalleryWallpaper {
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
    return MARKETING_GALLERY_WALLPAPERS_FALLBACK
  }

  const rows = (await res.json()) as WallpaperRow[]
  const picked = pickGalleryRows(rows)
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
