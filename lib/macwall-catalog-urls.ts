/** Public catalog media URLs — Cloudflare R2 via `cdn.macwall.app`. */

import { getR2PublicBaseUrl } from "@/lib/env/catalog-storage"

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

function publicObjectUrlFromPath(path: string): string {
  return `${getR2PublicBaseUrl()}/${encodeObjectPath(path)}`
}

export function catalogPublicVideoUrlFromKey(videoKey: string): string {
  return publicObjectUrlFromPath(normalizeVideosPath(videoKey))
}

export function catalogPublicThumbUrlFromKey(thumbKey: string): string {
  return publicObjectUrlFromPath(normalizeThumbsPath(thumbKey))
}

/** Marketing gallery poster — full thumb URL (Next.js `<Image>` resizes on Vercel). */
export function catalogMarketingGalleryPosterUrlFromKey(
  thumbKey: string
): string {
  return publicObjectUrlFromPath(normalizeThumbsPath(thumbKey))
}
