/**
 * Types and pure helpers for the wallpapers catalog screen. The limits mirror
 * `updateAdminWallpaper` in lib/admin/wallpapers.ts, which enforces them.
 */

import type { AdminWallpaper, WallpaperSort } from "@/lib/admin/wallpapers"
import { WALLPAPER_CATEGORIES } from "@/lib/wallpaper-categories"

export type Wallpaper = AdminWallpaper
export type { WallpaperSort }

export type CategoryCount = { category: string; count: number }

/** GET /api/admin/wallpapers */
export type WallpaperList = {
  wallpapers: Wallpaper[]
  total: number
  page: number
  limit: number
  sort: WallpaperSort
  categoryCounts: CategoryCount[] | null
}

export type CatalogFilters = {
  q: string
  /** Empty for all categories. */
  category: string
  sort: WallpaperSort
  page: number
}

export const PAGE_SIZE = 40

export const SORT_OPTIONS: readonly { value: WallpaperSort; label: string }[] =
  [
    { value: "likes_desc", label: "Most liked" },
    { value: "created_desc", label: "Newest first" },
    { value: "name_asc", label: "Name A–Z" },
    { value: "name_desc", label: "Name Z–A" },
  ]

export const NAME_MIN = 2
export const NAME_MAX = 140
export const TAG_LIMIT = 20
export const TAG_MAX_LENGTH = 32

/** The editable fields of a wallpaper, as the form holds them. */
export type WallpaperDraft = {
  name: string
  category: string
  /** Comma-separated, as typed. */
  tagsText: string
  isFeatured: boolean
  isCuratedPick: boolean
  isPro: boolean
}

export function toDraft(wallpaper: Wallpaper): WallpaperDraft {
  return {
    name: wallpaper.name,
    category: wallpaper.category,
    tagsText: wallpaper.tags.join(", "),
    isFeatured: wallpaper.isFeatured,
    isCuratedPick: wallpaper.isCuratedPick,
    isPro: wallpaper.isPro,
  }
}

export function parseTags(text: string): string[] {
  return text
    .split(/[,\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export function isDirty(draft: WallpaperDraft, wallpaper: Wallpaper): boolean {
  return (
    draft.name !== wallpaper.name ||
    draft.category !== wallpaper.category ||
    draft.isFeatured !== wallpaper.isFeatured ||
    draft.isCuratedPick !== wallpaper.isCuratedPick ||
    draft.isPro !== wallpaper.isPro ||
    parseTags(draft.tagsText).join(",") !==
      parseTags(wallpaper.tags.join(",")).join(",")
  )
}

/** PATCH /api/admin/wallpapers/[id] body. */
export function toPatch(draft: WallpaperDraft) {
  return {
    name: draft.name,
    category: draft.category,
    tags: parseTags(draft.tagsText),
    isFeatured: draft.isFeatured,
    isCuratedPick: draft.isCuratedPick,
    isPro: draft.isPro,
  }
}

export type DraftProblems = {
  /** Blocks saving. */
  name?: string
  /** Blocks saving. */
  category?: string
  /** Saving still works; the server trims the tags. */
  tags?: string
}

export function draftProblems(draft: WallpaperDraft): DraftProblems {
  const problems: DraftProblems = {}

  const name = draft.name.trim()
  if (name.length < NAME_MIN) {
    problems.name = `Use at least ${NAME_MIN} characters.`
  } else if (name.length > NAME_MAX) {
    problems.name = `Use ${NAME_MAX} characters or fewer.`
  }

  if (!WALLPAPER_CATEGORIES.includes(draft.category)) {
    problems.category = draft.category
      ? `“${draft.category}” is no longer a category. Pick a current one to save.`
      : "Pick a category."
  }

  const tags = parseTags(draft.tagsText)
  if (tags.length > TAG_LIMIT) {
    problems.tags = `Only the first ${TAG_LIMIT} tags are saved.`
  } else if (tags.some((tag) => tag.length > TAG_MAX_LENGTH)) {
    problems.tags = `Tags over ${TAG_MAX_LENGTH} characters are cut short.`
  }

  return problems
}
