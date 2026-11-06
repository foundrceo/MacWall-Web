import "server-only"

import { listPublicWallpapersForCollections } from "@/lib/public-catalog/fetch"
import type { PublicWallpaper } from "@/lib/public-catalog/types"
import {
  COLLECTION_MIN_WALLPAPERS,
  collectionPublishable,
  wallpaperCollections,
  wallpaperMatchesCollection,
  wallpaperMatchesCollectionFallback,
  type WallpaperCollection,
} from "@/lib/seo/wallpaper-collections"
import { wallpaperPalette } from "@/lib/seo/wallpaper-palette"

export type CollectionSummary = {
  collection: WallpaperCollection
  count: number
  cover: PublicWallpaper | null
  /** Built, at least `COLLECTION_MIN_WALLPAPERS` members: listed and in the sitemap. */
  indexable: boolean
}

/**
 * A collection's members from a catalog list (most-liked first, kept in that
 * order). Patterns and, for colour pages, the measured palette decide
 * membership; a seasonal page short of its `fallback.minimum` is topped up
 * with its fallback matches, which follow the real ones.
 */
export function collectionMembersFrom(
  catalog: readonly PublicWallpaper[],
  entry: WallpaperCollection
): PublicWallpaper[] {
  const matches = catalog.filter((wallpaper) =>
    wallpaperMatchesCollection(wallpaper, entry, wallpaperPalette(wallpaper.id))
  )
  if (!entry.fallback || matches.length >= entry.fallback.minimum) {
    return matches
  }
  const member = new Set(matches.map((wallpaper) => wallpaper.id))
  return [
    ...matches,
    ...catalog.filter(
      (wallpaper) =>
        !member.has(wallpaper.id) &&
        wallpaperMatchesCollectionFallback(wallpaper, entry)
    ),
  ]
}

/** Wallpapers in a collection, most-liked first (catalog read order). */
export async function listCollectionWallpapers(
  entry: WallpaperCollection
): Promise<PublicWallpaper[]> {
  if (!collectionPublishable(entry)) return []
  const all = await listPublicWallpapersForCollections()
  return collectionMembersFrom(all, entry)
}

/** Count + cover for every collection. Propagates catalog failures so ISR preserves prior content. */
export async function listCollectionSummaries(): Promise<CollectionSummary[]> {
  const all = await listPublicWallpapersForCollections()

  return wallpaperCollections.map((collection) => {
    const publishable = collectionPublishable(collection)
    const matches = publishable ? collectionMembersFrom(all, collection) : []
    return {
      collection,
      count: matches.length,
      cover: matches[0] ?? null,
      indexable: publishable && matches.length >= COLLECTION_MIN_WALLPAPERS,
    }
  })
}
