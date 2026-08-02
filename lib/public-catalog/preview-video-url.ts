import "server-only"

import { unstable_cache } from "next/cache"
import {
  catalogPublicVideoUrlFromKey,
  catalogVideoObjectKey,
} from "@/lib/macwall-catalog-urls"
import { isR2WriteEnabled, r2PresignGetUrl } from "@/lib/storage/r2"

/** Short-lived presigned GET when R2 credentials are configured; otherwise public CDN URL. */
const PREVIEW_URL_TTL_SECONDS = 900

/** Cache presigned URLs slightly below TTL to avoid serving expired links. */
const PREVIEW_URL_CACHE_SECONDS = 840

async function resolvePreviewVideoUrlUncached(
  videoKey: string
): Promise<string> {
  if (!isR2WriteEnabled()) {
    return catalogPublicVideoUrlFromKey(videoKey)
  }

  try {
    return await r2PresignGetUrl(
      catalogVideoObjectKey(videoKey),
      PREVIEW_URL_TTL_SECONDS
    )
  } catch {
    return catalogPublicVideoUrlFromKey(videoKey)
  }
}

const getCachedPreviewVideoUrl = unstable_cache(
  async (videoKey: string) => resolvePreviewVideoUrlUncached(videoKey),
  ["preview-video-url-v1"],
  { revalidate: PREVIEW_URL_CACHE_SECONDS }
)

export async function resolvePreviewVideoUrl(videoKey: string): Promise<string> {
  const key = videoKey.trim()
  if (!key) return catalogPublicVideoUrlFromKey(videoKey)
  return getCachedPreviewVideoUrl(key)
}
