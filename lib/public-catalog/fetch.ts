import "server-only"

import { unstable_cache } from "next/cache"
import { cache } from "react"
import {
  getCatalogSupabaseAnonKey,
  getCatalogSupabaseOrigin,
} from "@/lib/env/catalog-supabase"
import {
  catalogPublicThumbUrlFromKey,
  catalogPublicVideoUrlFromKey,
} from "@/lib/macwall-catalog-urls"
import {
  MARKETING_CATALOG_REVALIDATE_SECONDS,
  PUBLIC_CATALOG_CACHE_TAG,
} from "@/lib/marketing-cache"
import type {
  PublicCatalogSort,
  PublicWallpaper,
  PublicWallpaperListQuery,
  PublicWallpaperListResult,
} from "@/lib/public-catalog/types"
import {
  wallpaperDetailPath,
  wallpaperIdFromDetailSlug,
} from "@/lib/public-catalog/urls"

/**
 * Catalog ids removed for copyright / legal reasons.
 * Kept here so stale ISR/CDN cannot resurface a deleted row.
 */
const REMOVED_PUBLIC_WALLPAPER_IDS = new Set<string>(["rainy-parking-lot"])

type WallpaperRow = {
  id: string
  name: string
  category: string
  tags: string[] | null
  resolution: string
  duration_seconds: number
  file_size_bytes: number
  video_key: string
  thumb_key: string
  is_pro: boolean
  is_featured: boolean
  is_curated_pick: boolean
  like_count: number
  created_at: string
}

type WallpaperListRow = Pick<
  WallpaperRow,
  | "id"
  | "name"
  | "category"
  | "video_key"
  | "thumb_key"
  | "like_count"
  | "created_at"
>

type WallpaperDetailRow = Pick<
  WallpaperRow,
  | "id"
  | "name"
  | "category"
  | "tags"
  | "resolution"
  | "duration_seconds"
  | "file_size_bytes"
  | "video_key"
  | "thumb_key"
  | "like_count"
  | "created_at"
>

const LIST_SELECT_COLUMNS =
  "id,name,category,video_key,thumb_key,like_count,created_at"

const DETAIL_SELECT_COLUMNS =
  "id,name,category,tags,resolution,duration_seconds,file_size_bytes,video_key,thumb_key,like_count,created_at"

function mapListRow(row: WallpaperListRow): PublicWallpaper {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    tags: [],
    resolution: "",
    durationSeconds: 0,
    fileSizeBytes: 0,
    videoKey: row.video_key,
    thumbKey: row.thumb_key,
    videoUrl: catalogPublicVideoUrlFromKey(row.video_key),
    thumbUrl: catalogPublicThumbUrlFromKey(row.thumb_key),
    isPro: false,
    isFeatured: false,
    isCuratedPick: false,
    likeCount: row.like_count ?? 0,
    createdAt: row.created_at,
  }
}

function mapDetailRow(row: WallpaperDetailRow): PublicWallpaper {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    tags: row.tags ?? [],
    resolution: row.resolution,
    durationSeconds: row.duration_seconds,
    fileSizeBytes: row.file_size_bytes,
    videoKey: row.video_key,
    thumbKey: row.thumb_key,
    videoUrl: catalogPublicVideoUrlFromKey(row.video_key),
    thumbUrl: catalogPublicThumbUrlFromKey(row.thumb_key),
    isPro: false,
    isFeatured: false,
    isCuratedPick: false,
    likeCount: row.like_count ?? 0,
    createdAt: row.created_at,
  }
}

function sortParams(sort: PublicCatalogSort): string {
  switch (sort) {
    case "popular":
      return "like_count.desc,created_at.desc"
    case "older":
      return "created_at.asc"
    case "newest":
      return "created_at.desc"
    default: {
      const _exhaustive: never = sort
      return _exhaustive
    }
  }
}

function catalogHeaders(preferCount = false): HeadersInit {
  const key = getCatalogSupabaseAnonKey()
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Accept: "application/json",
    ...(preferCount ? { Prefer: "count=exact" } : {}),
  }
}

function requireOrigin(): string {
  const origin = getCatalogSupabaseOrigin()
  if (!origin) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required for catalog reads.")
  }
  return origin
}

function listQueryCacheKey(options: PublicWallpaperListQuery): string {
  return JSON.stringify({
    q: options.q?.trim() ?? "",
    category: options.category?.trim() ?? "",
    tag: options.tag?.trim() ?? "",
    sort: options.sort ?? "newest",
    page: options.page ?? 1,
    limit: options.limit ?? 24,
  })
}

async function fetchListPublicWallpapersUncached(
  options: PublicWallpaperListQuery = {}
): Promise<PublicWallpaperListResult> {
  const page = Math.max(1, options.page ?? 1)
  const limit = Math.min(60, Math.max(1, options.limit ?? 24))
  const offset = (page - 1) * limit
  const sort = options.sort ?? "newest"
  const origin = requireOrigin()

  const params = new URLSearchParams({
    select: LIST_SELECT_COLUMNS,
    order: sortParams(sort),
    limit: String(limit),
    offset: String(offset),
  })

  const q = options.q?.trim()
  if (q) {
    // PostgREST treats `*` as `%` in like/ilike patterns.
    const escaped = q.replace(/[%*,()]/g, " ").replace(/\s+/g, " ").trim()
    if (escaped) {
      params.set(
        "or",
        `(name.ilike.*${escaped}*,id.ilike.*${escaped}*,category.ilike.*${escaped}*,resolution.ilike.*${escaped}*)`
      )
    }
  }

  const category = options.category?.trim()
  if (category) {
    params.set("category", `eq.${category}`)
  }

  const tag = options.tag?.trim()
  if (tag) {
    params.set("tags", `cs.{${tag}}`)
  }

  const res = await fetch(`${origin}/rest/v1/wallpapers?${params}`, {
    headers: catalogHeaders(true),
    next: {
      revalidate: MARKETING_CATALOG_REVALIDATE_SECONDS,
      tags: [PUBLIC_CATALOG_CACHE_TAG],
    },
  })

  if (!res.ok) {
    throw new Error(`Public catalog list failed: HTTP ${res.status}`)
  }

  const rows = (await res.json()) as WallpaperListRow[]
  const contentRange = res.headers.get("content-range")
  const totalFromRange = contentRange?.split("/")[1]
  const total = totalFromRange ? Number(totalFromRange) : rows.length
  const safeTotal = Number.isFinite(total) ? total : rows.length

  return {
    wallpapers: rows.map(mapListRow),
    total: safeTotal,
    page,
    limit,
    hasMore: offset + rows.length < safeTotal,
  }
}

const getCachedListPublicWallpapers = unstable_cache(
  async (cacheKey: string) => {
    const options = JSON.parse(cacheKey) as PublicWallpaperListQuery
    return fetchListPublicWallpapersUncached(options)
  },
  ["public-wallpaper-list-v2"],
  {
    revalidate: MARKETING_CATALOG_REVALIDATE_SECONDS,
    tags: [PUBLIC_CATALOG_CACHE_TAG],
  }
)

export async function listPublicWallpapers(
  options: PublicWallpaperListQuery = {}
): Promise<PublicWallpaperListResult> {
  return getCachedListPublicWallpapers(listQueryCacheKey(options))
}

async function fetchPublicWallpaperByIdUncached(
  wallpaperId: string
): Promise<PublicWallpaper | null> {
  const id = wallpaperId.trim()
  if (!id) return null

  const origin = requireOrigin()
  const params = new URLSearchParams({
    select: DETAIL_SELECT_COLUMNS,
    id: `eq.${id}`,
    limit: "1",
  })

  const res = await fetch(`${origin}/rest/v1/wallpapers?${params}`, {
    headers: catalogHeaders(),
    next: {
      revalidate: MARKETING_CATALOG_REVALIDATE_SECONDS,
      tags: [PUBLIC_CATALOG_CACHE_TAG, `wallpaper-${id}`],
    },
  })

  if (!res.ok) {
    throw new Error(`Public catalog get failed: HTTP ${res.status}`)
  }

  const rows = (await res.json()) as WallpaperDetailRow[]
  const row = rows[0]
  return row ? mapDetailRow(row) : null
}

const getCachedPublicWallpaperById = unstable_cache(
  async (id: string) => fetchPublicWallpaperByIdUncached(id),
  ["public-wallpaper-by-id-v3"],
  {
    revalidate: MARKETING_CATALOG_REVALIDATE_SECONDS,
    tags: [PUBLIC_CATALOG_CACHE_TAG],
  }
)

/** Dedupes generateMetadata + page render within one request. */
export const getPublicWallpaperById = cache(async (wallpaperId: string) => {
  const id = wallpaperId.trim()
  if (!id) return null
  if (REMOVED_PUBLIC_WALLPAPER_IDS.has(id)) return null
  return getCachedPublicWallpaperById(id)
})

/** Resolve a detail-page slug (`name-uuid` or bare id) to a wallpaper. */
export const getPublicWallpaperByDetailSlug = cache(
  async (slug: string): Promise<PublicWallpaper | null> => {
    const id = wallpaperIdFromDetailSlug(slug)
    if (!id) return null
    return getPublicWallpaperById(id)
  }
)

async function fetchSimilarPublicWallpapersUncached(
  wallpaper: PublicWallpaper,
  limit = 6
): Promise<PublicWallpaper[]> {
  const origin = requireOrigin()
  const params = new URLSearchParams({
    select: LIST_SELECT_COLUMNS,
    category: `eq.${wallpaper.category}`,
    id: `neq.${wallpaper.id}`,
    order: "like_count.desc,created_at.desc",
    limit: String(Math.min(24, Math.max(1, limit))),
  })

  const res = await fetch(`${origin}/rest/v1/wallpapers?${params}`, {
    headers: catalogHeaders(),
    next: {
      revalidate: MARKETING_CATALOG_REVALIDATE_SECONDS,
      tags: [PUBLIC_CATALOG_CACHE_TAG],
    },
  })

  if (!res.ok) {
    throw new Error(`Similar wallpapers fetch failed: HTTP ${res.status}`)
  }

  const rows = (await res.json()) as WallpaperListRow[]
  return rows.map(mapListRow)
}

const getCachedSimilarPublicWallpapers = unstable_cache(
  async (wallpaperId: string, category: string, limit: number) => {
    return fetchSimilarPublicWallpapersUncached(
      {
        id: wallpaperId,
        category,
      } as PublicWallpaper,
      limit
    )
  },
  ["public-wallpaper-similar-v2"],
  {
    revalidate: MARKETING_CATALOG_REVALIDATE_SECONDS,
    tags: [PUBLIC_CATALOG_CACHE_TAG],
  }
)

export async function listSimilarPublicWallpapers(
  wallpaper: PublicWallpaper,
  limit = 6
): Promise<PublicWallpaper[]> {
  const safeLimit = Math.min(24, Math.max(1, limit))
  return getCachedSimilarPublicWallpapers(
    wallpaper.id,
    wallpaper.category,
    safeLimit
  )
}

type SitemapWallpaperRow = {
  id: string
  name: string
  category: string
  created_at: string
}

const SITEMAP_SELECT_COLUMNS = "id,name,category,created_at"

export type PublicWallpaperSitemapEntry = {
  path: string
  lastModified: Date
}

const SITEMAP_PAGE_SIZE = 100
const SITEMAP_MAX_PAGES = 50

function mapSitemapRow(row: SitemapWallpaperRow): PublicWallpaperSitemapEntry {
  const parsed = Date.parse(row.created_at)
  return {
    path: wallpaperDetailPath({
      id: row.id,
      name: row.name,
      category: row.category,
    }),
    lastModified: Number.isFinite(parsed) ? new Date(parsed) : new Date(),
  }
}

async function fetchPublicWallpaperSitemapEntriesUncached(): Promise<
  PublicWallpaperSitemapEntry[]
> {
  const origin = requireOrigin()
  const entries: PublicWallpaperSitemapEntry[] = []
  const seen = new Set<string>()

  for (let page = 1; page <= SITEMAP_MAX_PAGES; page += 1) {
    const offset = (page - 1) * SITEMAP_PAGE_SIZE
    const params = new URLSearchParams({
      select: SITEMAP_SELECT_COLUMNS,
      order: "created_at.desc",
      limit: String(SITEMAP_PAGE_SIZE),
      offset: String(offset),
    })

    const res = await fetch(`${origin}/rest/v1/wallpapers?${params}`, {
      headers: catalogHeaders(),
      next: {
        revalidate: MARKETING_CATALOG_REVALIDATE_SECONDS,
        tags: [PUBLIC_CATALOG_CACHE_TAG],
      },
    })

    if (!res.ok) {
      throw new Error(`Sitemap catalog list failed: HTTP ${res.status}`)
    }

    const rows = (await res.json()) as SitemapWallpaperRow[]
    if (rows.length === 0) break

    for (const row of rows) {
      if (seen.has(row.id)) continue
      seen.add(row.id)
      entries.push(mapSitemapRow(row))
    }

    if (rows.length < SITEMAP_PAGE_SIZE) break
  }

  return entries
}

const getCachedPublicWallpaperSitemapEntries = unstable_cache(
  async () => fetchPublicWallpaperSitemapEntriesUncached(),
  ["public-wallpaper-sitemap-v1"],
  {
    revalidate: MARKETING_CATALOG_REVALIDATE_SECONDS,
    tags: [PUBLIC_CATALOG_CACHE_TAG],
  }
)

/** Lightweight, paginated catalog read for sitemap generation. */
export async function listPublicWallpaperSitemapEntries(): Promise<
  PublicWallpaperSitemapEntry[]
> {
  return getCachedPublicWallpaperSitemapEntries()
}

export async function countPublicWallpapers(
  category?: string
): Promise<number> {
  const result = await listPublicWallpapers({
    category,
    page: 1,
    limit: 1,
    sort: "newest",
  })
  return result.total
}
