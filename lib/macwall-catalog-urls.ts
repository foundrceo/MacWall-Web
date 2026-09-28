/**
 * Public catalog media URLs — Cloudflare R2 via `cdn.macwall.app`.
 *
 * `videos/*` objects are the full-resolution masters that Pro unlocks in the
 * app. The website must never hand those out: anything rendered on a public
 * page or returned by a public API uses `catalogPreviewVideoUrlFromKey`
 * (a downscaled, silent Cloudflare Media Transformation). The master URL
 * builder is for admin/server-only code.
 */

import { getR2PublicBaseUrl } from "@/lib/env/catalog-storage"

/** Bucket-relative path encoded per segment (`foo/bar baz` → encoded segments). */
function encodeObjectPath(trimmedPath: string): string {
  return trimmedPath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/")
}

function normalizeCatalogObjectPath(
  key: string,
  defaultPrefix: "videos" | "thumbs"
): string {
  const k = key.trim().replace(/^\/+/, "")
  if (!k) return `${defaultPrefix}/`

  if (
    k.startsWith("community-pending/") ||
    k.startsWith("videos/") ||
    k.startsWith("thumbs/") ||
    k.startsWith("assets/")
  ) {
    return k
  }

  return `${defaultPrefix}/${k}`
}

function normalizeVideosPath(key: string): string {
  return normalizeCatalogObjectPath(key, "videos")
}

function normalizeThumbsPath(key: string): string {
  return normalizeCatalogObjectPath(key, "thumbs")
}

function publicObjectUrlFromPath(path: string): string {
  return `${getR2PublicBaseUrl()}/${encodeObjectPath(path)}`
}

/** Bucket-relative object key for a catalog video (used for presigned GET). */
export function catalogVideoObjectKey(videoKey: string): string {
  return normalizeVideosPath(videoKey)
}

/**
 * Full-resolution master file. Admin/server only — never render this on a
 * public page or return it from a public API (it is the paid Pro asset).
 */
export function catalogPublicVideoUrlFromKey(videoKey: string): string {
  return publicObjectUrlFromPath(catalogVideoObjectKey(videoKey))
}

/**
 * Web preview: width-capped, silent Media Transformation of the master.
 * Never falls back to the master — callers show the poster if this fails.
 */
export function catalogPreviewVideoUrlFromKey(
  videoKey: string,
  width: 854 | 1280 = 1280
): string {
  if (!videoKey.trim()) return ""
  try {
    const url = new URL(catalogPublicVideoUrlFromKey(videoKey))
    url.pathname = `/cdn-cgi/media/mode=video,width=${width},fit=scale-down,audio=false${url.pathname}`
    return url.toString()
  } catch {
    return ""
  }
}

export function catalogPublicThumbUrlFromKey(thumbKey: string): string {
  return publicObjectUrlFromPath(normalizeThumbsPath(thumbKey))
}

/**
 * Marketing gallery poster — full thumb URL on Cloudflare R2 CDN.
 * Call sites must use `unoptimized` (or plain `<img>`) so Vercel Image
 * Optimization does not re-encode every catalog thumb.
 */
export function catalogMarketingGalleryPosterUrlFromKey(
  thumbKey: string
): string {
  return catalogPublicThumbUrlFromKey(thumbKey)
}
