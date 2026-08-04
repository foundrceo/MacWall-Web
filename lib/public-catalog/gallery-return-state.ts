/**
 * Survives App Router remounts when you open a wallpaper and hit Back.
 *
 * Root cause (verified in browser): a remount “seed” wrote SSR page-1 over the
 * expanded Show-more snapshot (48 → 24), so Back always looked like a fresh page.
 *
 * Rules:
 * - Never shrink an existing same-view snapshot unless `replace: true`
 * - Restore list from module cache + sessionStorage before paint
 * - Manually scroll to the opened card (Next scroll restoration → footer)
 */

import type { PublicWallpaper } from "@/lib/public-catalog/types"

export type GalleryReturnFilters = {
  pathname: string
  category: string | null
  q: string
  tag: string
  sort: string
}

export type GalleryReturnSnapshot = {
  filters: GalleryReturnFilters
  wallpapers: PublicWallpaper[]
  page: number
  hasMore: boolean
  focusWallpaperId: string | null
  scrollY: number
  updatedAt: number
}

const STORAGE_KEY = "macwall_gallery_return_v2"
export const GALLERY_RETURN_MAX_ITEMS = 288

let memoryCache: GalleryReturnSnapshot | null = null

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

export function wallpaperCardDomId(wallpaperId: string): string {
  return `wallpaper-card-${wallpaperId}`
}

function trimWallpapers(wallpapers: PublicWallpaper[]): PublicWallpaper[] {
  if (wallpapers.length <= GALLERY_RETURN_MAX_ITEMS) return wallpapers
  return wallpapers.slice(0, GALLERY_RETURN_MAX_ITEMS)
}

function readSessionSnapshot(): GalleryReturnSnapshot | null {
  if (!canUseSessionStorage()) return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as GalleryReturnSnapshot
    if (
      !parsed ||
      !Array.isArray(parsed.wallpapers) ||
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

function writeSessionSnapshot(snapshot: GalleryReturnSnapshot): void {
  if (!canUseSessionStorage()) return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
  } catch {
    // Quota — memory cache still covers SPA back.
  }
}

export function readGalleryReturnSnapshot(): GalleryReturnSnapshot | null {
  if (memoryCache) return memoryCache
  const fromSession = readSessionSnapshot()
  if (fromSession) memoryCache = fromSession
  return fromSession
}

export function writeGalleryReturnSnapshot(
  next: Omit<GalleryReturnSnapshot, "updatedAt">,
  options?: { replace?: boolean }
): void {
  const existing = memoryCache ?? readSessionSnapshot()
  const sameView =
    !!existing && galleryReturnFiltersMatch(existing.filters, next.filters)

  // Hard guard: never let a page-1 seed clobber an expanded same-view list.
  if (
    !options?.replace &&
    existing &&
    sameView &&
    next.wallpapers.length < existing.wallpapers.length
  ) {
    memoryCache = {
      ...existing,
      focusWallpaperId:
        next.focusWallpaperId !== undefined
          ? next.focusWallpaperId
          : existing.focusWallpaperId,
      scrollY:
        typeof next.scrollY === "number" ? next.scrollY : existing.scrollY,
      updatedAt: Date.now(),
    }
    writeSessionSnapshot(memoryCache)
    return
  }

  // Also refuse shrink across transient filter identity glitches on same path.
  if (
    !options?.replace &&
    existing &&
    existing.filters.pathname === next.filters.pathname &&
    next.wallpapers.length < existing.wallpapers.length &&
    existing.wallpapers.length > 24
  ) {
    memoryCache = {
      ...existing,
      focusWallpaperId:
        next.focusWallpaperId !== undefined
          ? next.focusWallpaperId
          : existing.focusWallpaperId,
      scrollY:
        typeof next.scrollY === "number" ? next.scrollY : existing.scrollY,
      updatedAt: Date.now(),
    }
    writeSessionSnapshot(memoryCache)
    return
  }

  const snapshot: GalleryReturnSnapshot = {
    ...next,
    wallpapers: trimWallpapers(next.wallpapers),
    page: Math.max(1, Math.floor(next.page)),
    updatedAt: Date.now(),
  }
  memoryCache = snapshot
  writeSessionSnapshot(snapshot)
}

export function getGalleryReturnForFilters(
  filters: GalleryReturnFilters
): GalleryReturnSnapshot | null {
  const saved = readGalleryReturnSnapshot()
  if (!saved || !galleryReturnFiltersMatch(saved.filters, filters)) return null
  if (!saved.wallpapers.length) return null
  return saved
}

export function shouldRestoreGallerySnapshot(
  saved: GalleryReturnSnapshot,
  initialCount: number
): boolean {
  return (
    saved.page > 1 ||
    saved.wallpapers.length > initialCount ||
    Boolean(saved.focusWallpaperId)
  )
}

export function markGalleryReturnFocus(wallpaperId: string): void {
  if (typeof window === "undefined") return
  const existing = readGalleryReturnSnapshot()
  if (!existing) return
  writeGalleryReturnSnapshot({
    ...existing,
    focusWallpaperId: wallpaperId,
    scrollY: window.scrollY,
  })
  try {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual"
    }
  } catch {
    // ignore
  }
}

export function clearGalleryReturnFocus(): void {
  const existing = readGalleryReturnSnapshot()
  if (!existing) return
  writeGalleryReturnSnapshot({
    ...existing,
    focusWallpaperId: null,
  })
}

/** Scroll to the opened card; retries beat Next’s late scroll restoration. */
export function scrollGalleryToWallpaper(
  wallpaperId: string | null | undefined
): () => void {
  if (typeof window === "undefined" || !wallpaperId) return () => {}

  try {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual"
    }
  } catch {
    // ignore
  }

  let cancelled = false
  let tries = 0
  const timers: number[] = []

  const findCard = (): HTMLElement | null => {
    const byId = document.getElementById(wallpaperCardDomId(wallpaperId))
    if (byId) return byId
    try {
      return document.querySelector(
        `[data-wallpaper-id="${CSS.escape(wallpaperId)}"]`
      )
    } catch {
      return document.querySelector(`[data-wallpaper-id="${wallpaperId}"]`)
    }
  }

  const apply = () => {
    if (cancelled) return false
    const el = findCard()
    if (!el) return false
    el.scrollIntoView({ block: "center", behavior: "auto" })
    clearGalleryReturnFocus()
    return true
  }

  window.scrollTo({ top: 0, behavior: "auto" })

  const tick = () => {
    if (cancelled) return
    if (apply()) return
    tries += 1
    if (tries < 40) {
      timers.push(window.setTimeout(tick, tries < 8 ? 16 : 50))
    }
  }

  timers.push(window.setTimeout(tick, 0))
  for (const delay of [50, 150, 300]) {
    timers.push(
      window.setTimeout(() => {
        if (!cancelled) apply()
      }, delay)
    )
  }

  return () => {
    cancelled = true
    for (const id of timers) window.clearTimeout(id)
  }
}
