/** Public catalog wallpaper — wire shape for gallery + detail pages. */

export type PublicCatalogSort = "newest" | "popular" | "older"

export type PublicWallpaper = {
  id: string
  name: string
  category: string
  tags: string[]
  resolution: string
  durationSeconds: number
  fileSizeBytes: number
  videoKey: string
  thumbKey: string
  videoUrl: string
  thumbUrl: string
  isPro: boolean
  isFeatured: boolean
  isCuratedPick: boolean
  likeCount: number
  createdAt: string
}

export type PublicWallpaperListResult = {
  wallpapers: PublicWallpaper[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export type PublicWallpaperListQuery = {
  q?: string
  category?: string
  tag?: string
  sort?: PublicCatalogSort
  page?: number
  limit?: number
}
