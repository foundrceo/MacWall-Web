/**
 * Marketing site assets on Cloudflare R2 (`assets/` prefix on the catalog CDN).
 */

import { getR2PublicBaseUrl } from "@/lib/env/catalog-storage"

/** R2 key prefix inside `wallpaper-catalog` (public via cdn.macwall.app/assets/...). */
export const MARKETING_ASSETS_R2_PREFIX = "assets" as const

/** Primary walkthrough clip. */
export const MARKETING_WALKTHROUGH_VIDEO_PRIMARY_PATH = "Video (1).mov" as const

/** Fallback when the primary object is missing or fails to decode. */
export const MARKETING_WALKTHROUGH_VIDEO_FALLBACK_PATH = "Video.mov" as const

function encodeObjectPath(path: string): string {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/")
}

function browserVideoSourceFromEnv(name: string): string | null {
  const raw = process.env[name]?.trim()
  if (!raw) return null
  if (raw.startsWith("/")) return raw

  try {
    const url = new URL(raw)
    return url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

function uniqueSources(sources: readonly (string | null)[]): string[] {
  return sources.filter((source, index, all): source is string => {
    return Boolean(source) && all.indexOf(source) === index
  })
}

/** Public URL for a marketing asset object key (e.g. `Video.mov`). */
export function marketingAssetPublicUrl(objectKey: string): string {
  const path = encodeObjectPath(`${MARKETING_ASSETS_R2_PREFIX}/${objectKey}`)
  return `${getR2PublicBaseUrl()}/${path}`
}

/** Hero walkthrough — env override, then R2 CDN only (no local `/public` fallbacks). */
export function marketingWalkthroughVideoSources(): readonly string[] {
  return uniqueSources([
    browserVideoSourceFromEnv("NEXT_PUBLIC_MARKETING_WALKTHROUGH_VIDEO_URL"),
    browserVideoSourceFromEnv(
      "NEXT_PUBLIC_MARKETING_WALKTHROUGH_VIDEO_FALLBACK_URL"
    ),
    marketingAssetPublicUrl(MARKETING_WALKTHROUGH_VIDEO_PRIMARY_PATH),
    marketingAssetPublicUrl(MARKETING_WALKTHROUGH_VIDEO_FALLBACK_PATH),
  ])
}

/** Lock Screen feature demo — same R2 clips as the hero walkthrough. */
export function marketingLockScreenVideoSources(): readonly string[] {
  return uniqueSources([
    browserVideoSourceFromEnv("NEXT_PUBLIC_MARKETING_LOCK_SCREEN_VIDEO_URL"),
    browserVideoSourceFromEnv("NEXT_PUBLIC_MARKETING_WALKTHROUGH_VIDEO_URL"),
    marketingAssetPublicUrl(MARKETING_WALKTHROUGH_VIDEO_PRIMARY_PATH),
    marketingAssetPublicUrl(MARKETING_WALKTHROUGH_VIDEO_FALLBACK_PATH),
  ])
}
