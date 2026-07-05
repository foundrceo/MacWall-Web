/** Public Storage URL helpers — aligns with macOS app `WallpaperMacOS/CatalogEndpoints.swift`. */

const DEFAULT_SUPABASE_URL = "https://YOUR_SUPABASE_PROJECT_REF.supabase.co"
const STORAGE_BUCKET = "wallpaper-catalog"

export function catalogSupabaseOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  if (!raw?.startsWith("https://")) return DEFAULT_SUPABASE_URL
  try {
    return new URL(raw).origin
  } catch {
    return DEFAULT_SUPABASE_URL
  }
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
