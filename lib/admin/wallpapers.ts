import { macwall } from "@/lib/macwall-site"
import {
  catalogMarketingGalleryPosterUrlFromKey,
  catalogPublicVideoUrlFromKey,
} from "@/lib/macwall-catalog-urls"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export const WALLPAPER_CATEGORIES: string[] = [...macwall.categories]

export type WallpaperSort =
  | "likes_desc"
  | "likes_asc"
  | "name_asc"
  | "name_desc"
  | "created_desc"
  | "created_asc"

export type AdminWallpaper = {
  id: string
  name: string
  category: string
  tags: string[]
  resolution: string
  durationSeconds: number
  fileSizeBytes: number
  videoKey: string
  thumbKey: string
  thumbUrl: string
  videoUrl: string
  isPro: boolean
  isFeatured: boolean
  isCuratedPick: boolean
  likeCount: number
  createdAt: string
  updatedAt: string
}

export type AdminWallpaperUpdate = {
  name?: string
  category?: string
  tags?: string[]
  isPro?: boolean
  isFeatured?: boolean
  isCuratedPick?: boolean
}

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
  updated_at: string
}

function mapWallpaper(row: WallpaperRow): AdminWallpaper {
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
    thumbUrl: catalogMarketingGalleryPosterUrlFromKey(row.thumb_key),
    videoUrl: catalogPublicVideoUrlFromKey(row.video_key),
    isPro: row.is_pro,
    isFeatured: row.is_featured,
    isCuratedPick: row.is_curated_pick,
    likeCount: row.like_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const SELECT_COLUMNS =
  "id,name,category,tags,resolution,duration_seconds,file_size_bytes,video_key,thumb_key,is_pro,is_featured,is_curated_pick,like_count,created_at,updated_at"

function sortColumn(sort: WallpaperSort): {
  column: string
  ascending: boolean
} {
  switch (sort) {
    case "likes_asc":
      return { column: "like_count", ascending: true }
    case "name_asc":
      return { column: "name", ascending: true }
    case "name_desc":
      return { column: "name", ascending: false }
    case "created_asc":
      return { column: "created_at", ascending: true }
    case "created_desc":
      return { column: "created_at", ascending: false }
    case "likes_desc":
    default:
      return { column: "like_count", ascending: false }
  }
}

export async function listAdminWallpapers(options: {
  q?: string
  category?: string
  sort?: WallpaperSort
  page?: number
  limit?: number
}): Promise<{
  wallpapers: AdminWallpaper[]
  total: number
  page: number
  limit: number
}> {
  const page = Math.max(1, options.page ?? 1)
  const limit = Math.min(100, Math.max(1, options.limit ?? 40))
  const offset = (page - 1) * limit
  const sort = options.sort ?? "likes_desc"
  const { column, ascending } = sortColumn(sort)

  const supabase = getSupabaseAdmin()
  let query = supabase
    .from("wallpapers")
    .select(SELECT_COLUMNS, { count: "exact" })

  const q = options.q?.trim()
  if (q) {
    const escaped = q.replace(/[%_]/g, "\\$&")
    query = query.or(`name.ilike.%${escaped}%,id.ilike.%${escaped}%`)
  }

  if (options.category?.trim()) {
    query = query.eq("category", options.category.trim())
  }

  const { data, error, count } = await query
    .order(column, { ascending })
    .range(offset, offset + limit - 1)

  if (error) throw new Error(error.message)

  return {
    wallpapers: (data as WallpaperRow[]).map(mapWallpaper),
    total: count ?? 0,
    page,
    limit,
  }
}

export async function getAdminWallpaper(
  wallpaperId: string
): Promise<AdminWallpaper | null> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("wallpapers")
    .select(SELECT_COLUMNS)
    .eq("id", wallpaperId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null
  return mapWallpaper(data as WallpaperRow)
}

export async function updateAdminWallpaper(
  wallpaperId: string,
  patch: AdminWallpaperUpdate
): Promise<AdminWallpaper> {
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (patch.name !== undefined) {
    const name = patch.name.trim()
    if (name.length < 2) throw new Error("Name must be at least 2 characters.")
    updates.name = name
  }

  if (patch.category !== undefined) {
    const category = patch.category.trim()
    if (!WALLPAPER_CATEGORIES.includes(category)) {
      throw new Error(`Invalid category: ${category}`)
    }
    updates.category = category
  }

  if (patch.tags !== undefined) {
    updates.tags = patch.tags.map((tag) => tag.trim()).filter(Boolean)
  }

  if (patch.isPro !== undefined) updates.is_pro = patch.isPro
  if (patch.isFeatured !== undefined) updates.is_featured = patch.isFeatured
  if (patch.isCuratedPick !== undefined)
    updates.is_curated_pick = patch.isCuratedPick

  if (Object.keys(updates).length === 1) {
    throw new Error("No fields to update.")
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("wallpapers")
    .update(updates)
    .eq("id", wallpaperId)
    .select(SELECT_COLUMNS)
    .single()

  if (error) throw new Error(error.message)
  return mapWallpaper(data as WallpaperRow)
}

export async function fetchWallpaperCategoryCounts(): Promise<
  Array<{ category: string; count: number }>
> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.rpc("admin_wallpaper_category_counts")

  if (!error && Array.isArray(data)) {
    return (data as Array<{ category: string; count: number }>)
      .map((row) => ({
        category: row.category,
        count: Number(row.count),
      }))
      .sort((a, b) => b.count - a.count)
  }

  const fallback = await supabase.from("wallpapers").select("category")
  if (fallback.error) throw new Error(fallback.error.message)

  const totals = new Map<string, number>()
  for (const row of fallback.data ?? []) {
    const category = (row as { category: string }).category
    totals.set(category, (totals.get(category) ?? 0) + 1)
  }

  return [...totals.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
}

export async function fetchTopLikedWallpapers(
  limit = 8
): Promise<
  Array<{ id: string; name: string; category: string; likeCount: number }>
> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("wallpapers")
    .select("id,name,category,like_count")
    .order("like_count", { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => ({
    id: (row as { id: string }).id,
    name: (row as { name: string }).name,
    category: (row as { category: string }).category,
    likeCount: (row as { like_count: number }).like_count,
  }))
}
