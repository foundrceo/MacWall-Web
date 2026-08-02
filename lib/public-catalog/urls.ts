import {
  categoryNameFromSlug,
  categorySlugFromName,
} from "@/lib/seo/category-slugs"
import type { PublicCatalogSort } from "@/lib/public-catalog/types"

const UUID_SUFFIX_RE =
  /(?:^|-)([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i

/** URL-safe slug from a wallpaper display name. */
export function slugifyWallpaperName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 80)
}

export function isUuidWallpaperId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id.trim()
  )
}

/**
 * Path segment for a wallpaper detail URL.
 * UUID ids: `{name-slug}-{uuid}`.
 * Slug ids (admin uploads): use the id alone (already SEO-friendly).
 */
export function wallpaperDetailSlug(wallpaper: {
  id: string
  name: string
}): string {
  const id = wallpaper.id.trim()
  if (isUuidWallpaperId(id)) {
    const nameSlug = slugifyWallpaperName(wallpaper.name) || "wallpaper"
    return `${nameSlug}-${id.toLowerCase()}`
  }
  return id
}

/** Stable public path: `/wallpaper/{category}/{slug-or-id}`. */
export function wallpaperDetailPath(wallpaper: {
  id: string
  name: string
  category: string
}): string {
  const categorySlug =
    categorySlugFromName(wallpaper.category) ??
    (slugifyWallpaperName(wallpaper.category) || "other")
  return `/wallpaper/${categorySlug}/${wallpaperDetailSlug(wallpaper)}`
}

/** Absolute share URL for marketing / Mac app clipboard. */
export function wallpaperShareUrl(
  wallpaper: { id: string; name: string; category: string },
  origin = "https://macwall.app"
): string {
  const base = origin.replace(/\/+$/, "")
  return `${base}${wallpaperDetailPath(wallpaper)}`
}

/**
 * Extract the catalog id from a detail slug.
 * Prefers a trailing UUID; otherwise the whole segment is the id.
 */
export function wallpaperIdFromDetailSlug(slug: string): string {
  const trimmed = slug.trim()
  if (!trimmed) return ""
  const uuidMatch = trimmed.match(UUID_SUFFIX_RE)
  if (uuidMatch?.[1]) return uuidMatch[1].toLowerCase()
  return trimmed
}

export function wallpaperCategorySlugOrFallback(category: string): string {
  return (
    categorySlugFromName(category) ??
    (slugifyWallpaperName(category) || "other")
  )
}

export function wallpaperCategoryNameFromPathSlug(
  slug: string
): string | undefined {
  return categoryNameFromSlug(slug)
}

/** Gallery index / filtered category paths. */
export function wallpapersGalleryPath(categorySlug?: string | null): string {
  if (!categorySlug) return "/wallpapers"
  return `/wallpapers/${categorySlug}`
}

export type WallpapersGalleryQuery = {
  q?: string | null
  tag?: string | null
  sort?: PublicCatalogSort | null
}

/** Build a crawlable gallery URL with optional search, tag, or sort params. */
export function wallpapersGalleryHref(
  categorySlug?: string | null,
  query: WallpapersGalleryQuery = {}
): string {
  const base = wallpapersGalleryPath(categorySlug)
  const params = new URLSearchParams()

  const q = query.q?.trim()
  const tag = query.tag?.trim()
  const sort = query.sort

  if (q) params.set("q", q)
  if (tag) params.set("tag", tag)
  if (sort && sort !== "newest") params.set("sort", sort)

  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}
