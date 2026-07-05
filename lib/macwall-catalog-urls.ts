/** Public Storage URL helpers — aligns with MacWall macOS `CatalogEndpoints.swift`. */

import { getCatalogSupabaseOrigin } from "@/lib/env/catalog-supabase"

const STORAGE_BUCKET = "wallpaper-catalog"

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
