/**
 * Public catalog media URLs: Cloudflare R2 via `cdn.macwall.app`.
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
 * Full-resolution master file. Admin/server only, never render this on a
 * public page or return it from a public API (it is the paid Pro asset).
 */
export function catalogPublicVideoUrlFromKey(videoKey: string): string {
  return publicObjectUrlFromPath(catalogVideoObjectKey(videoKey))
}

/**
 * Web preview: width-capped, silent Media Transformation of the master.
 * Never falls back to the master: callers show the poster if this fails.
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
 * Width-capped catalog image via Cloudflare Image Transformations on the CDN
 * zone: AVIF/WebP when the browser accepts it, never upscaled, and
 * `onerror=redirect` falls back to the original if a transform fails.
 * Non-CDN URLs pass through untouched.
 */
export function catalogImageUrlAtWidth(
  url: string,
  width: number,
  quality = 75
): string {
  const base = getR2PublicBaseUrl()
  if (!url.startsWith(`${base}/`) || url.includes("/cdn-cgi/")) return url
  const path = url.slice(base.length)
  const w = Math.max(16, Math.round(width))
  const q = Math.min(100, Math.max(1, Math.round(quality)))
  return `${base}/cdn-cgi/image/width=${w},quality=${q},format=auto,fit=scale-down,onerror=redirect${path}`
}

/** Share-preview size every wallpaper page's poster is sent at (1.91:1). */
export const catalogOpenGraphImageSize = { width: 1200, height: 630 } as const

/**
 * A wallpaper's poster for link previews (og:image / twitter:image): exactly
 * 1200×630, cropped to fill, as JPEG (~80 KB). Posters on the CDN run from
 * 960×540 to 4K (up to ~1.5 MB); the big ones were too heavy for some
 * previews (WhatsApp), and a fixed size and type let Facebook / LinkedIn draw
 * the large card on a link's first share. JPEG, not `format=auto`: preview
 * bots don't all take WebP/AVIF. Returns null for a non-CDN URL (no transform).
 */
export function catalogOpenGraphImageUrl(url: string): string | null {
  const base = getR2PublicBaseUrl()
  if (!url.startsWith(`${base}/`) || url.includes("/cdn-cgi/")) return null
  const path = url.slice(base.length)
  const { width, height } = catalogOpenGraphImageSize
  return `${base}/cdn-cgi/image/width=${width},height=${height},fit=cover,quality=82,format=jpeg,onerror=redirect${path}`
}

/**
 * Marketing gallery poster: full thumb URL on Cloudflare R2 CDN.
 * Call sites must use `unoptimized` (or a plain `<img>`) so the image
 * optimizer doesn't re-encode every catalog thumb.
 */
export function catalogMarketingGalleryPosterUrlFromKey(
  thumbKey: string
): string {
  return catalogPublicThumbUrlFromKey(thumbKey)
}
