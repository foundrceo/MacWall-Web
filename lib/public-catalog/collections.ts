import "server-only"

import { listPublicWallpapersForCollections } from "@/lib/public-catalog/fetch"
import type { PublicWallpaper } from "@/lib/public-catalog/types"
import {
  COLLECTION_MIN_WALLPAPERS,
  wallpaperCollections,
  wallpaperMatchesCollection,
  type WallpaperCollection,
} from "@/lib/seo/wallpaper-collections"

export type CollectionSummary = {
  collection: WallpaperCollection
  count: number
  cover: PublicWallpaper | null
  indexable: boolean
}

/** Wallpapers in a collection, most-liked first (catalog read order). */
export async function listCollectionWallpapers(
  entry: WallpaperCollection
): Promise<PublicWallpaper[]> {
  const all = await listPublicWallpapersForCollections()
  return all.filter((wallpaper) => wallpaperMatchesCollection(wallpaper, entry))
}

/** Count + cover for every collection. Propagates catalog failures so ISR preserves prior content. */
export async function listCollectionSummaries(): Promise<CollectionSummary[]> {
  const all = await listPublicWallpapersForCollections()

  return wallpaperCollections.map((collection) => {
    const matches = all.filter((wallpaper) =>
      wallpaperMatchesCollection(wallpaper, collection)
    )
    return {
      collection,
      count: matches.length,
      cover: matches[0] ?? null,
      indexable: matches.length >= COLLECTION_MIN_WALLPAPERS,
    }
  })
}
