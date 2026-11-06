import { macwall } from "@/lib/macwall-site"

const SLUG_BY_CATEGORY: Record<string, string> = {
  Anime: "anime",
  Nature: "nature",
  Cars: "cars",
  Gaming: "gaming",
  Space: "space",
  Heroes: "heroes",
  Dark: "dark",
  Abstract: "abstract",
  Others: "others",
}

const CATEGORY_BY_SLUG: Record<string, string> = {
  anime: "Anime",
  nature: "Nature",
  cars: "Cars",
  gaming: "Gaming",
  space: "Space",
  heroes: "Heroes",
  dark: "Dark",
  abstract: "Abstract",
  others: "Others",
}

/**
 * Retired gallery slugs → the category their wallpapers moved to. Only for
 * resolving an old URL to its current hub (lib/public-catalog/redirects.ts).
 * Gallery routes never render a legacy slug: next.config.mjs 308s
 * `/wallpapers/{legacy}` to a collection and `/wallpapers/{legacy}/page/{n}`
 * to this category, and `canonicalCategoryNameFromSlug` 404s anything else.
 */
const LEGACY_SLUG_TO_NAME: Record<string, string> = {
  "video-games": "Gaming",
  "sci-fi": "Heroes",
  city: "Dark",
  cats: "Others",
  fantasy: "Others",
}

/**
 * Retired slug → slug of the category that holds its wallpapers: the
 * `category` of `LEGACY_GALLERY_CATEGORIES` in next.config.mjs. Not where the
 * old hub redirects (that is a collection, e.g. city → /wallpapers/collections/city).
 */
export const LEGACY_CATEGORY_SLUG_REDIRECTS: Record<string, string> = {
  "video-games": "gaming",
  "sci-fi": "heroes",
  city: "dark",
  cats: "others",
  fantasy: "others",
}

/** Category for a slug, retired slugs included. */
export function categoryNameFromSlug(slug: string): string | undefined {
  return CATEGORY_BY_SLUG[slug] ?? LEGACY_SLUG_TO_NAME[slug]
}

/**
 * Category for a current slug only. Gallery routes use this, so a retired
 * slug can never render, or become a canonical, as a copy of another hub.
 */
export function canonicalCategoryNameFromSlug(
  slug: string
): string | undefined {
  return CATEGORY_BY_SLUG[slug]
}

export function categorySlugFromName(name: string): string | undefined {
  return SLUG_BY_CATEGORY[name]
}

export const wallpaperCategorySlugs = macwall.categories
  .map((name) => categorySlugFromName(name))
  .filter((slug): slug is string => Boolean(slug))
