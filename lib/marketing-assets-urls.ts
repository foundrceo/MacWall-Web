/**
 * Marketing site assets on Cloudflare R2 (`assets/` prefix on the catalog CDN).
 */

import { getR2PublicBaseUrl } from "@/lib/env/catalog-storage"

/** R2 key prefix inside `wallpaper-catalog` (public via cdn.macwall.app/assets/...). */
export const MARKETING_ASSETS_R2_PREFIX = "assets" as const

/**
 * Web-optimized hero walkthrough encodes, served from `/public` so Vercel's CDN
 * caches them immutably. The 82 MB `.mov` master on R2 is reachable only
 * through the env overrides below.
 */
export const MARKETING_HERO_VIDEO_MP4_PATH = "/hero/walkthrough.mp4" as const
export const MARKETING_HERO_VIDEO_MP4_720_PATH =
  "/hero/walkthrough-720.mp4" as const
export const MARKETING_HERO_VIDEO_POSTER_PATH =
  "/hero/walkthrough-poster.jpg" as const

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

export type MarketingVideoSource = {
  src: string
  /** MIME type so the browser can skip a codec it cannot decode. */
  type: string
}

function mimeTypeForSource(src: string): string {
  const path = src.split("?")[0]?.toLowerCase() ?? ""
  if (path.endsWith(".webm")) return "video/webm"
  if (path.endsWith(".mov")) return "video/quicktime"
  return "video/mp4"
}

/** Hero walkthrough sources, best-first. H.264 only: every target browser
 * decodes it, and VP9 gave no size win on this footage. */
export function marketingWalkthroughVideoSources(): readonly MarketingVideoSource[] {
  const sources = uniqueSources([
    browserVideoSourceFromEnv("NEXT_PUBLIC_MARKETING_WALKTHROUGH_VIDEO_URL"),
    browserVideoSourceFromEnv(
      "NEXT_PUBLIC_MARKETING_WALKTHROUGH_VIDEO_FALLBACK_URL"
    ),
    MARKETING_HERO_VIDEO_MP4_PATH,
  ])
  return sources.map((src) => ({ src, type: mimeTypeForSource(src) }))
}

/** Lighter encode for small viewports and metered connections. */
export function marketingWalkthroughVideoMobileSource(): MarketingVideoSource {
  return {
    src: MARKETING_HERO_VIDEO_MP4_720_PATH,
    type: "video/mp4",
  }
}

/** Poster still, which is all mobile downloads until the video is requested. */
export function marketingWalkthroughPosterUrl(): string {
  return (
    browserVideoSourceFromEnv("NEXT_PUBLIC_MARKETING_WALKTHROUGH_POSTER_URL") ??
    MARKETING_HERO_VIDEO_POSTER_PATH
  )
}
