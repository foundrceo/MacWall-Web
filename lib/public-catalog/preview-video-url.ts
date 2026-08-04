import "server-only"

import {
  catalogPublicVideoUrlFromKey,
  catalogVideoObjectKey,
} from "@/lib/macwall-catalog-urls"
import { isR2WriteEnabled, r2PresignGetUrl } from "@/lib/storage/r2"

/** Short-lived presigned GET when R2 credentials are configured; otherwise public CDN URL. */
const PREVIEW_URL_TTL_SECONDS = 900

/**
 * Fresh preview URL for the current request — never bake into ISR HTML.
 * Detail pages must mint this client-side (or on-demand via `/api/wallpapers/preview`)
 * because page `revalidate` (1h) is longer than the signed URL TTL (15m).
 */
export async function resolvePreviewVideoUrlFresh(
  videoKey: string
): Promise<string> {
  const key = videoKey.trim()
  if (!key) return catalogPublicVideoUrlFromKey(videoKey)

  if (!isR2WriteEnabled()) {
    return catalogPublicVideoUrlFromKey(key)
  }

  try {
    return await r2PresignGetUrl(
      catalogVideoObjectKey(key),
      PREVIEW_URL_TTL_SECONDS
    )
  } catch {
    return catalogPublicVideoUrlFromKey(key)
  }
}

/** @deprecated Prefer `resolvePreviewVideoUrlFresh` — cached signed URLs expire under ISR. */
export async function resolvePreviewVideoUrl(videoKey: string): Promise<string> {
  return resolvePreviewVideoUrlFresh(videoKey)
}
