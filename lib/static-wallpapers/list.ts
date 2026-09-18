import "server-only"

import { staticWallpaperPublicUrl } from "@/lib/admin/static-wallpaper-upload"
import { r2ListObjects } from "@/lib/storage/r2"

export const STATIC_WALLPAPERS_PREFIX = "static-wallpapers/" as const

export type PublicStaticWallpaper = {
  id: string
  name: string
  fileName: string
  key: string
  sizeBytes: number
  lastModified: string | null
  imageUrl: string
}

function displayNameFromFileName(fileName: string): string {
  const stem = fileName.replace(/\.[^.]+$/, "")
  const spaced = stem
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
  return spaced || fileName
}

function idFromFileName(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 128)
}

/** Lists still images under `static-wallpapers/` in the catalog R2 bucket. */
export async function listPublicStaticWallpapers(
  maxKeys = 500
): Promise<PublicStaticWallpaper[]> {
  const objects = await r2ListObjects(STATIC_WALLPAPERS_PREFIX, maxKeys)
  return objects
    .filter((object) => /\.(jpe?g|png|webp)$/i.test(object.key))
    .map((object) => {
      const fileName = object.key.slice(STATIC_WALLPAPERS_PREFIX.length)
      return {
        id: idFromFileName(fileName) || fileName.toLowerCase(),
        name: displayNameFromFileName(fileName),
        fileName,
        key: object.key,
        sizeBytes: object.sizeBytes,
        lastModified: object.lastModified,
        imageUrl: staticWallpaperPublicUrl(object.key),
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}
