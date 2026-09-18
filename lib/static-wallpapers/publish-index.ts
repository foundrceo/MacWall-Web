import "server-only"

import {
  listPublicStaticWallpapers,
  type PublicStaticWallpaper,
} from "@/lib/static-wallpapers/list"
import { getR2PublicBaseUrl } from "@/lib/env/catalog-storage"
import { r2DeleteObject, r2PresignPutUrl } from "@/lib/storage/r2"

export const STATIC_WALLPAPERS_INDEX_KEY = "static-wallpapers/index.json" as const

export type StaticWallpapersIndex = {
  generatedAt: string
  prefix: "static-wallpapers/"
  count: number
  images: PublicStaticWallpaper[]
}

export function staticWallpapersIndexPublicUrl(): string {
  return `${getR2PublicBaseUrl()}/${STATIC_WALLPAPERS_INDEX_KEY}`
}

/** Rebuilds the public CDN index the MacWall app reads. */
export async function publishStaticWallpapersIndex(
  images?: PublicStaticWallpaper[]
): Promise<StaticWallpapersIndex> {
  const listed = images ?? (await listPublicStaticWallpapers())
  const payload: StaticWallpapersIndex = {
    generatedAt: new Date().toISOString(),
    prefix: "static-wallpapers/",
    count: listed.length,
    images: listed,
  }

  // Replace any stale index before writing the new one.
  await r2DeleteObject(STATIC_WALLPAPERS_INDEX_KEY).catch(() => undefined)

  const signedUrl = await r2PresignPutUrl(STATIC_WALLPAPERS_INDEX_KEY, 600, {
    contentType: "application/json",
  })
  const body = JSON.stringify(payload)
  const response = await fetch(signedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60, stale-while-revalidate=600",
    },
    body,
  })
  if (!response.ok) {
    const text = await response.text().catch(() => "")
    throw new Error(
      `Failed to publish static wallpapers index (HTTP ${response.status}) ${text}`
    )
  }

  return payload
}
