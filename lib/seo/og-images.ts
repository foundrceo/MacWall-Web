import manifest from "@/lib/seo/og-manifest.json"
import { canonicalSiteOrigin } from "@/lib/site-url"

/**
 * Share images made once by `npm run og:generate` (scripts/generate-og-images.mjs)
 * and committed under `public/og/`. File names carry a content hash, so they
 * are served `immutable` and nothing is rendered when a link is shared.
 */
export type OgManifestEntry = {
  file: string
  width: number
  height: number
  alt: string
}

const entries = manifest as Record<string, OgManifestEntry>

export function ogImageForPath(
  pathname: string
): { url: string; width: number; height: number; alt: string } | undefined {
  const entry = entries[pathname]
  if (!entry) return undefined
  return {
    url: `${canonicalSiteOrigin()}/og/${entry.file}`,
    width: entry.width,
    height: entry.height,
    alt: entry.alt,
  }
}
