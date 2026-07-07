/** Public Storage URL helpers — aligns with MacWall macOS `CatalogEndpoints.swift`. */

import { getCatalogSupabaseOrigin } from "@/lib/env/catalog-supabase"

const STORAGE_BUCKET = "wallpaper-catalog"

/** Gallery poster — Supabase Image Transform (16:9, ~640px wide, tuned for marquee tiles). */
export const MARKETING_GALLERY_POSTER_TRANSFORM = {
  width: 640,
  height: 360,
  quality: 78,
} as const

export function catalogSupabaseOrigin(): string {
  return getCatalogSupabaseOrigin()
}

/** Bucket-relative path encoded per segment (`foo/bar baz` → encoded segments). */
function encodeObjectPath(trimmedPath: string): string {
  return trimmedPath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/")
}

function normalizeVideosPath(key: string): string {
  const k = key.trim().replace(/^\/+/, "")
  return k.startsWith("videos/") ? k : `videos/${k}`
}

function normalizeThumbsPath(key: string): string {
  const k = key.trim().replace(/^\/+/, "")
  return k.startsWith("thumbs/") ? k : `thumbs/${k}`
}

export function catalogPublicVideoUrlFromKey(videoKey: string): string {
  const p = normalizeVideosPath(videoKey)
  const origin = catalogSupabaseOrigin()
  return `${origin}/storage/v1/object/public/${STORAGE_BUCKET}/${encodeObjectPath(p)}`
}

export function catalogPublicThumbUrlFromKey(thumbKey: string): string {
  const p = normalizeThumbsPath(thumbKey)
  const origin = catalogSupabaseOrigin()
  return `${origin}/storage/v1/object/public/${STORAGE_BUCKET}/${encodeObjectPath(p)}`
}

/** Lightweight poster for marketing gallery tiles (Supabase render API). */
export function catalogMarketingGalleryPosterUrlFromKey(
  thumbKey: string
): string {
  const p = normalizeThumbsPath(thumbKey)
  const origin = catalogSupabaseOrigin()
  const { width, height, quality } = MARKETING_GALLERY_POSTER_TRANSFORM
  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    quality: String(quality),
    resize: "cover",
  })
  return `${origin}/storage/v1/render/image/public/${STORAGE_BUCKET}/${encodeObjectPath(p)}?${params}`
}
