/** Client-only return state so gallery “Show more” + scroll survive detail navigation. */

export type GalleryReturnFilters = {
  pathname: string
  category: string | null
  q: string
  tag: string
  sort: string
}

export type GalleryReturnState = {
  filters: GalleryReturnFilters
  /** Last successfully loaded page (1 = first batch only). */
  page: number
  hasMore: boolean
  /** Wallpaper the user opened — scroll target on return. */
  focusWallpaperId: string | null
  scrollY: number
  updatedAt: number
}

const STORAGE_KEY = "macwall_gallery_return_v1"
/** Cap restored pages so back-nav can’t stampede the API. */
export const GALLERY_RETURN_MAX_PAGE = 12

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined"
}

export function galleryReturnFiltersMatch(
  a: GalleryReturnFilters,
  b: GalleryReturnFilters
): boolean {
  return (
    a.pathname === b.pathname &&
    a.category === b.category &&
    a.q === b.q &&
    a.tag === b.tag &&
    a.sort === b.sort
  )
}

export function readGalleryReturnState(): GalleryReturnState | null {
  if (!canUseSessionStorage()) return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as GalleryReturnState
    if (
      !parsed ||
      typeof parsed.page !== "number" ||
      !parsed.filters ||
      typeof parsed.filters.pathname !== "string"
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function writeGalleryReturnState(
  next: Omit<GalleryReturnState, "updatedAt">
): void {
  if (!canUseSessionStorage()) return
  try {
    const payload: GalleryReturnState = {
      ...next,
      page: Math.max(
        1,
        Math.min(GALLERY_RETURN_MAX_PAGE, Math.floor(next.page))
      ),
      updatedAt: Date.now(),
    }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Quota / private mode — ignore.
  }
}

/** Remember which card was opened so back-nav can scroll to it. */
export function markGalleryReturnFocus(wallpaperId: string): void {
  if (!canUseSessionStorage()) return
  const existing = readGalleryReturnState()
  if (!existing) return
  writeGalleryReturnState({
    ...existing,
    focusWallpaperId: wallpaperId,
    scrollY: window.scrollY,
  })
}

export function clearGalleryReturnFocus(): void {
  const existing = readGalleryReturnState()
  if (!existing) return
  writeGalleryReturnState({
    ...existing,
    focusWallpaperId: null,
  })
}
