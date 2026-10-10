import type { PublicWallpaperListQuery } from "./types"
import { WALLPAPER_CATEGORIES } from "@/lib/wallpaper-categories"

export class InvalidCatalogQuery extends Error {}

export function normalizeCatalogQuery(options: PublicWallpaperListQuery = {}) {
  const text = (value: string | undefined, max: number, filter = false) => {
    const normalized = (value ?? "").trim().replace(/\s+/g, " ")
    if (normalized.length > max || (filter && /[,{}()\u0000-\u001f]/.test(normalized))) {
      throw new InvalidCatalogQuery("Invalid catalog filter")
    }
    return normalized
  }
  const integer = (value: number | undefined, fallback: number, max: number) =>
    value === undefined || !Number.isFinite(value) ? fallback : Math.min(max, Math.max(1, Math.floor(value)))
  const categoryInput = text(options.category, 64, true)
  const category = WALLPAPER_CATEGORIES.find((value) => value.toLowerCase() === categoryInput.toLowerCase()) ?? ""
  if (categoryInput && !category) throw new InvalidCatalogQuery("Unknown catalog category")
  return {
    q: text(options.q, 100).replace(/[%*,()]/g, " ").replace(/\s+/g, " ").trim(),
    category,
    tag: text(options.tag, 64, true),
    sort: options.sort === "popular" || options.sort === "older" ? options.sort : "newest" as const,
    page: integer(options.page, 1, 1000),
    limit: integer(options.limit, 24, 60),
  }
}
