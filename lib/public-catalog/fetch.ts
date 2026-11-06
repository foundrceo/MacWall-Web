import "server-only"

import { normalizeCatalogQuery } from "@/lib/public-catalog/query"
import {
  rankSimilarWallpapers,
  SIMILAR_WALLPAPER_LIMIT,
  type SimilarSignals,
} from "@/lib/public-catalog/similar"
import { collectionsForWallpaper } from "@/lib/seo/wallpaper-collections"
import {
  currentWallpaperTags,
  displayTags,
  isThinWallpaper,
} from "@/lib/seo/wallpaper-detail-content"
import { wallpaperColors } from "@/lib/seo/wallpaper-palette"
import { unstable_cache } from "next/cache"
import { cache } from "react"
import {
  getCatalogSupabaseAnonKey,
  getCatalogSupabaseOrigin,
} from "@/lib/env/catalog-supabase"
import {
  catalogPublicThumbUrlFromKey,
  catalogPreviewVideoUrlFromKey,
} from "@/lib/macwall-catalog-urls"
import {
  MARKETING_CATALOG_REVALIDATE_SECONDS,
  PUBLIC_CATALOG_CACHE_TAG,
} from "@/lib/marketing-cache"
import type {
  PublicCatalogSort,
  PublicWallpaper,
  WallpaperOriginType,
  PublicWallpaperListQuery,
  PublicWallpaperListResult,
} from "@/lib/public-catalog/types"
import { REMOVED_WALLPAPER_ID_RULES } from "@/lib/public-catalog/redirects"
import {
  wallpaperDetailPath,
  wallpaperIdFromDetailSlug,
} from "@/lib/public-catalog/urls"

/**
 * Catalog ids removed for copyright / legal reasons.
 * Kept here so stale ISR/CDN cannot resurface a deleted row.
 */
/** Taken-down wallpapers: hidden here, 410 in the Worker (one list for both). */
const REMOVED_PUBLIC_WALLPAPER_IDS = new Set<string>(
  Object.keys(REMOVED_WALLPAPER_ID_RULES)
)

/**
 * Public columns of `wallpapers`. `is_pro`, `is_featured` and
 * `is_curated_pick` are app-side ranking flags, not facts a visitor or API
 * client can act on, so the public catalog never reads them.
 */
type WallpaperRow = {
  id: string
  name: string
  category: string
  tags: string[] | null
  resolution: string | null
  duration_seconds: number | null
  file_size_bytes: number | null
  video_key: string
  thumb_key: string
  like_count: number
  created_at: string
  author_display_name: string | null
  origin_type: WallpaperOriginType | null
}

type WallpaperListRow = Pick<
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

type WallpaperDetailRow = WallpaperListRow &
  Pick<WallpaperRow, "author_display_name" | "origin_type">

const LIST_SELECT_COLUMNS =
  "id,name,category,tags,resolution,duration_seconds,file_size_bytes,video_key,thumb_key,like_count,created_at"

const DETAIL_SELECT_COLUMNS = `${LIST_SELECT_COLUMNS},author_display_name,origin_type`

/** `3840x2160` as stored; placeholders such as "—" become "". */
function publicResolution(value: string | null): string {
  const resolution = value?.trim() ?? ""
  return /\d/.test(resolution) ? resolution : ""
}

function mapListRow(row: WallpaperListRow): PublicWallpaper {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    tags: row.tags ?? [],
    resolution: publicResolution(row.resolution),
    durationSeconds: row.duration_seconds ?? 0,
    fileSizeBytes: row.file_size_bytes ?? 0,
    videoKey: row.video_key,
    thumbKey: row.thumb_key,
    videoUrl: catalogPreviewVideoUrlFromKey(row.video_key),
    thumbUrl: catalogPublicThumbUrlFromKey(row.thumb_key),
    likeCount: row.like_count ?? 0,
    createdAt: row.created_at,
  }
}

function mapDetailRow(row: WallpaperDetailRow): PublicWallpaper {
  return {
    ...mapListRow(row),
    authorDisplayName: row.author_display_name,
    originType: row.origin_type,
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
  return JSON.stringify(normalizeCatalogQuery(options))
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

  params.set("id", `not.in.(${[...REMOVED_PUBLIC_WALLPAPER_IDS].join(",")})`)

  const q = options.q?.trim()
  if (q) {
    // PostgREST treats `*` as `%` in like/ilike patterns.
    const escaped = q
      .replace(/[%*,()]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
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
    // Catalog tags mix cases ("anime", "Anime"): match the tag as given, in
    // lower case and capitalised. Commas and braces never get this far.
    const lower = tag.toLowerCase()
    const variants = new Set([
      tag,
      lower,
      lower.charAt(0).toUpperCase() + lower.slice(1),
    ])
    const quoted = [...variants].map(
      (value) => `"${value.replace(/["\\]/g, "\\$&")}"`
    )
    params.set("tags", `ov.{${quoted.join(",")}}`)
  }

  const res = await fetch(`${origin}/rest/v1/wallpapers?${params}`, {
    headers: catalogHeaders(true),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  })

  // With an exact count, PostgREST answers an offset past the last row with
  // 416. Past the end is an empty page, not an outage.
  if (res.status === 416) {
    const total =
      totalFromContentRange(res.headers.get("content-range")) ??
      (await fetchListTotal(params))
    return { wallpapers: [], total, page, limit, hasMore: false }
  }

  if (!res.ok) {
    throw new Error(`Public catalog list failed: HTTP ${res.status}`)
  }

  const rows = (await res.json()) as WallpaperListRow[]
  const total =
    totalFromContentRange(res.headers.get("content-range")) ?? rows.length

  return {
    wallpapers: rows.map(mapListRow),
    total,
    page,
    limit,
    hasMore: offset + rows.length < total,
  }
}

/** The total after the slash in a `Content-Range` header, e.g. `0-23/1132`. */
function totalFromContentRange(header: string | null): number | null {
  const total = Number(header?.split("/")[1])
  return header && Number.isSafeInteger(total) && total >= 0 ? total : null
}

/** Row count for a list query's filters, without reading any rows. */
async function fetchListTotal(listParams: URLSearchParams): Promise<number> {
  const params = new URLSearchParams(listParams)
  params.set("select", "id")
  params.set("limit", "1")
  params.set("offset", "0")
  params.delete("order")
  const res = await fetch(`${requireOrigin()}/rest/v1/wallpapers?${params}`, {
    method: "HEAD",
    headers: catalogHeaders(true),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  })
  const total = res.ok
    ? totalFromContentRange(res.headers.get("content-range"))
    : null
  if (total === null) {
    throw new Error(`Public catalog count failed: HTTP ${res.status}`)
  }
  return total
}

const getCachedListPublicWallpapers = unstable_cache(
  async (cacheKey: string) => {
    const options = JSON.parse(cacheKey) as PublicWallpaperListQuery
    return fetchListPublicWallpapersUncached(options)
  },
  ["public-wallpaper-list-v3"],
  {
    revalidate: MARKETING_CATALOG_REVALIDATE_SECONDS,
    tags: [PUBLIC_CATALOG_CACHE_TAG],
  }
)

/** Pages this shallow are cached without first looking up the total. */
const ALWAYS_CACHED_PAGES = 20

/**
 * Deepest page of a filter that gets a Data Cache entry: every real page plus
 * one, so the page the next upload opens is cached when it appears. Deeper
 * requests are past the end, and caching them would only add entries.
 */
async function lastCachedPage(
  normalized: ReturnType<typeof normalizeCatalogQuery>
): Promise<number> {
  // Same key as the gallery's own total lookup (`loadGalleryPage`).
  const first = await getCachedListPublicWallpapers(
    listQueryCacheKey({
      category: normalized.category,
      sort: normalized.sort,
      page: 1,
      limit: 1,
    })
  )
  return Math.ceil(first.total / normalized.limit) + 1
}

export async function listPublicWallpapers(
  options: PublicWallpaperListQuery = {}
): Promise<PublicWallpaperListResult> {
  const normalized = normalizeCatalogQuery(options)
  // Free-form searches must not create a persisted cache entry for every input.
  if (normalized.q || normalized.tag)
    return fetchListPublicWallpapersUncached(normalized)
  // Every gallery page is cached (`/wallpapers/page/48` too), so crawlers on
  // the deepest pages don't each wait on a Supabase read.
  if (normalized.page > ALWAYS_CACHED_PAGES) {
    const lastPage = await lastCachedPage(normalized).catch(() => 0)
    if (normalized.page > lastPage)
      return fetchListPublicWallpapersUncached(normalized)
  }
  return getCachedListPublicWallpapers(listQueryCacheKey(normalized))
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
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) {
    throw new Error(`Public catalog get failed: HTTP ${res.status}`)
  }

  const rows = (await res.json()) as WallpaperDetailRow[]
  const row = rows[0]
  return row ? mapDetailRow(row) : null
}

/**
 * Detail pages read their wallpaper (and "similar") from the one cached
 * catalog index instead of a data-cache entry per wallpaper: crawlers open
 * every detail page, and per-id entries cost two KV writes per wallpaper.
 */
export const getPublicWallpaperById = cache(async (wallpaperId: string) => {
  const id = wallpaperId.trim()
  if (!id) return null
  if (REMOVED_PUBLIC_WALLPAPER_IDS.has(id)) return null
  const indexed = (await listPublicCatalogIndex()).find(
    (wallpaper) => wallpaper.id === id
  )
  // Not in the index (unknown id, or published since it was cached): read the
  // row directly, without creating a cache entry for arbitrary ids.
  return indexed ?? fetchPublicWallpaperByIdUncached(id)
})

/** Resolve a detail-page slug (`name-uuid` or bare id) to a wallpaper. */
export const getPublicWallpaperByDetailSlug = cache(
  async (slug: string): Promise<PublicWallpaper | null> => {
    const id = wallpaperIdFromDetailSlug(slug)
    if (!id) return null
    return getPublicWallpaperById(id)
  }
)

/**
 * Collection slugs per name + tags. Matching runs every collection's patterns
 * over a wallpaper, and the rail needs it for the whole catalog on each detail
 * render, so warm isolates reuse it. The key holds every input, so an edited
 * name or tag gets a fresh entry.
 */
const similarCollectionsMemo = new Map<string, readonly string[]>()
const SIMILAR_MEMO_MAX = 20_000

/** A collection about a real person (`rights: "likeness"`). */
function isLikenessCollection(entry: { slug: string; rights?: string }) {
  return entry.rights === "likeness"
}

/**
 * Topic collections as a similarity signal. Likeness collections (real
 * people) are left out: two wallpapers of one person are not a theme the
 * rail should cluster on.
 */
function similarCollectionSlugs(wallpaper: PublicWallpaper): readonly string[] {
  const key = `${wallpaper.name}\u0000${wallpaper.tags.join("\u0000")}`
  let slugs = similarCollectionsMemo.get(key)
  if (!slugs) {
    slugs = collectionsForWallpaper(wallpaper)
      .filter((entry) => !isLikenessCollection(entry))
      .map((entry) => entry.slug)
    if (similarCollectionsMemo.size >= SIMILAR_MEMO_MAX)
      similarCollectionsMemo.clear()
    similarCollectionsMemo.set(key, slugs)
  }
  return slugs
}

const similarSignals: SimilarSignals = {
  collections: similarCollectionSlugs,
  // Rename leftovers (an old title's words kept as tags) don't pair wallpapers.
  tags: (wallpaper) =>
    displayTags({ ...wallpaper, tags: currentWallpaperTags(wallpaper) }),
  palette: (wallpaper) => wallpaperColors(wallpaper.id).map((c) => c.hex),
  // Thin pages are served noindex (wallpaper-metadata.ts); linking them from
  // every rail sent link equity to pages Google is told to drop.
  excluded: (wallpaper) => isThinWallpaper(wallpaper),
}

/**
 * "More like this": wallpapers that share collections, themes, colours or the
 * category with `wallpaper`, a different set on every page, never a noindex
 * page. See `rankSimilarWallpapers`.
 */
export async function listSimilarPublicWallpapers(
  wallpaper: PublicWallpaper,
  limit = SIMILAR_WALLPAPER_LIMIT
): Promise<PublicWallpaper[]> {
  const index = await listPublicCatalogIndex()
  return rankSimilarWallpapers(wallpaper, index, similarSignals, limit)
}

type SitemapWallpaperRow = {
  id: string
  name: string
  category: string
  tags: string[] | null
  thumb_key: string | null
  duration_seconds: number | null
  created_at: string
}

const SITEMAP_SELECT_COLUMNS =
  "id,name,category,tags,thumb_key,duration_seconds,created_at"

export type PublicWallpaperSitemapEntry = {
  path: string
  /** Wallpaper name, for image and video sitemap titles. */
  name: string
  /** Loop length in seconds; 0 when unknown. */
  durationSeconds: number
  lastModified: Date
  /** Poster for the image sitemap. */
  imageUrl: string | null
  /** No themes and no collection: the page is noindex (see `thin`). */
  thin: boolean
}

// Larger batches reduce serial reads during builds and cache refreshes.
// Keep the same 5,000-item ceiling, within Supabase's default row cap.
const SITEMAP_PAGE_SIZE = 500
const SITEMAP_MAX_PAGES = 10

function mapSitemapRow(row: SitemapWallpaperRow): PublicWallpaperSitemapEntry {
  const parsed = Date.parse(row.created_at)
  return {
    path: wallpaperDetailPath({
      id: row.id,
      name: row.name,
      category: row.category,
    }),
    name: row.name,
    durationSeconds: row.duration_seconds ?? 0,
    lastModified: Number.isFinite(parsed) ? new Date(parsed) : new Date(),
    imageUrl: row.thumb_key
      ? catalogPublicThumbUrlFromKey(row.thumb_key)
      : null,
    thin: isThinWallpaper({
      name: row.name,
      category: row.category,
      tags: row.tags ?? [],
    }),
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
      id: `not.in.(${[...REMOVED_PUBLIC_WALLPAPER_IDS].join(",")})`,
      order: "created_at.desc",
      limit: String(SITEMAP_PAGE_SIZE),
      offset: String(offset),
    })

    const res = await fetch(`${origin}/rest/v1/wallpapers?${params}`, {
      headers: catalogHeaders(),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
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
  ["public-wallpaper-sitemap-v3"],
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

async function fetchCatalogIndexRowsUncached(): Promise<WallpaperDetailRow[]> {
  const origin = requireOrigin()
  const rows: WallpaperDetailRow[] = []
  const seen = new Set<string>()

  for (let page = 1; page <= SITEMAP_MAX_PAGES; page += 1) {
    const params = new URLSearchParams({
      select: DETAIL_SELECT_COLUMNS,
      id: `not.in.(${[...REMOVED_PUBLIC_WALLPAPER_IDS].join(",")})`,
      order: "like_count.desc,created_at.desc",
      limit: String(SITEMAP_PAGE_SIZE),
      offset: String((page - 1) * SITEMAP_PAGE_SIZE),
    })

    const res = await fetch(`${origin}/rest/v1/wallpapers?${params}`, {
      headers: catalogHeaders(),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) {
      throw new Error(`Collection catalog list failed: HTTP ${res.status}`)
    }

    const batch = (await res.json()) as WallpaperDetailRow[]
    for (const row of batch) {
      if (seen.has(row.id) || REMOVED_PUBLIC_WALLPAPER_IDS.has(row.id)) continue
      seen.add(row.id)
      rows.push(row)
    }

    if (batch.length < SITEMAP_PAGE_SIZE) break
  }

  return rows
}

const getCachedCatalogIndexRows = unstable_cache(
  async () => fetchCatalogIndexRowsUncached(),
  ["public-wallpaper-catalog-index-v1"],
  {
    revalidate: MARKETING_CATALOG_REVALIDATE_SECONDS,
    tags: [PUBLIC_CATALOG_CACHE_TAG],
  }
)

/**
 * Every public wallpaper with full detail fields, most-liked first.
 * One cached read shared by detail pages, "similar", collection pages, the
 * hub, and detail-page collection links.
 */
const listPublicCatalogIndex = cache(async (): Promise<PublicWallpaper[]> => {
  const rows = await getCachedCatalogIndexRows()
  return rows.map(mapDetailRow)
})

/** Every public wallpaper with its tags, most-liked first. */
export const listPublicWallpapersForCollections = listPublicCatalogIndex
