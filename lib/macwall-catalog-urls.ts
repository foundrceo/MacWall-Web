/**
 * Public catalog media URLs — Cloudflare R2 via `cdn.macwall.app`.
 *
 * Videos are served from a public CDN base URL today. Player UI hardening and
 * short-lived presigned preview URLs (see `lib/public-catalog/preview-video-url.ts`)
 * reduce casual saving; true anti-hotlink still needs CDN signed URLs and/or
 * referrer policy on the bucket.
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

export function catalogPublicVideoUrlFromKey(videoKey: string): string {
  return publicObjectUrlFromPath(catalogVideoObjectKey(videoKey))
}

export function catalogPublicThumbUrlFromKey(thumbKey: string): string {
  return publicObjectUrlFromPath(normalizeThumbsPath(thumbKey))
}

/** Marketing gallery poster — full thumb URL (Next.js `<Image>` resizes on Vercel). */
export function catalogMarketingGalleryPosterUrlFromKey(
  thumbKey: string
): string {
  return catalogPublicThumbUrlFromKey(thumbKey)
}
