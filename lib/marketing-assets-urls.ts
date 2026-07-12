/**
 * Marketing site assets in Supabase Storage (`Assets` bucket).
 * Private bucket — use long-lived signed URLs or override via env.
 */

import { getCatalogSupabaseOrigin } from "@/lib/env/catalog-supabase"

export const MARKETING_ASSETS_BUCKET = "Assets" as const

/** Primary walkthrough clip (upload to `Assets/Video (1).mov`). */
export const MARKETING_WALKTHROUGH_VIDEO_PRIMARY_PATH = "Video (1).mov" as const

/** Fallback when the primary object is missing or fails to decode. */
export const MARKETING_WALKTHROUGH_VIDEO_FALLBACK_PATH = "Video.mov" as const

const MARKETING_WALKTHROUGH_VIDEO_PRIMARY_SIGNED =
  "https://YOUR_SUPABASE_PROJECT_REF.supabase.co/storage/v1/object/sign/Assets/Video%20(1).mov?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85NjM2NWM5NC1kNzFiLTRkMjMtOGRmMC1mYzhmNDE3NjczOWEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBc3NldHMvVmlkZW8gKDEpLm1vdiIsImlhdCI6MTc4MDY3MDQyNywiZXhwIjoyMDk2MDMwNDI3fQ.gdPaLqtoXigIjIkSs0TqIfFJnwcS_ByUd4TjAocWJ1Y" as const

const MARKETING_WALKTHROUGH_VIDEO_FALLBACK_SIGNED =
  "https://YOUR_SUPABASE_PROJECT_REF.supabase.co/storage/v1/object/sign/Assets/Video.mov?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85NjM2NWM5NC1kNzFiLTRkMjMtOGRmMC1mYzhmNDE3NjczOWEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJBc3NldHMvVmlkZW8ubW92IiwiaWF0IjoxNzgwNjQ4MTI4LCJleHAiOjQ5MzQyNDgxMjh9.8W4mHl-dInuoBe2CuzKdhY1HxIcoC_6b_GkxDseED20" as const

function encodeObjectPath(trimmedPath: string): string {
  return trimmedPath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/")
}

/** Signed object URL for a path in the marketing `Assets` bucket. */
export function marketingAssetsSignedObjectUrl(
  objectPath: string,
  signedToken: string
): string {
  const origin = getCatalogSupabaseOrigin()
  const encoded = encodeObjectPath(objectPath)
  return `${origin}/storage/v1/object/sign/${MARKETING_ASSETS_BUCKET}/${encoded}?token=${signedToken}`
}

/** Ordered walkthrough sources: known-good clip first (fast first frame), then primary. */
export function marketingWalkthroughVideoSources(): readonly string[] {
  const override = process.env.NEXT_PUBLIC_MARKETING_WALKTHROUGH_VIDEO_URL?.trim()
  const primary =
    override || MARKETING_WALKTHROUGH_VIDEO_PRIMARY_SIGNED
  const fallback = MARKETING_WALKTHROUGH_VIDEO_FALLBACK_SIGNED
  return primary === fallback ? [primary] : [fallback, primary]
}