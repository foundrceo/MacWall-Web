/**
 * Marketing site assets in Supabase Storage (`Assets` bucket).
 * Browser video sources must be intentionally public or explicitly provided by env.
 */

export const MARKETING_ASSETS_BUCKET = "Assets" as const

/** Primary walkthrough clip (upload to `Assets/Video (1).mov`). */
export const MARKETING_WALKTHROUGH_VIDEO_PRIMARY_PATH = "Video (1).mov" as const

/** Fallback when the primary object is missing or fails to decode. */
export const MARKETING_WALKTHROUGH_VIDEO_FALLBACK_PATH = "Video.mov" as const

const LOCAL_WALKTHROUGH_VIDEO_PRIMARY = "/Video.webm" as const
const LOCAL_WALKTHROUGH_VIDEO_FALLBACK =
  "/marketing-shell/video/wallpaper1-fallback.mp4" as const

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

/** Ordered walkthrough sources: env override first, then local public fallbacks. */
export function marketingWalkthroughVideoSources(): readonly string[] {
  return [
    browserVideoSourceFromEnv("NEXT_PUBLIC_MARKETING_WALKTHROUGH_VIDEO_URL"),
    browserVideoSourceFromEnv(
      "NEXT_PUBLIC_MARKETING_WALKTHROUGH_VIDEO_FALLBACK_URL"
    ),
    LOCAL_WALKTHROUGH_VIDEO_PRIMARY,
    LOCAL_WALKTHROUGH_VIDEO_FALLBACK,
  ].filter((source, index, sources): source is string => {
    return Boolean(source) && sources.indexOf(source) === index
  })
}
