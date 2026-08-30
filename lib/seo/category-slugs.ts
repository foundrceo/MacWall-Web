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

/** Retired gallery slugs → current name (detail pages 301 via canonical path). */
const LEGACY_SLUG_TO_NAME: Record<string, string> = {
  "video-games": "Gaming",
  "sci-fi": "Heroes",
  city: "Dark",
  cats: "Others",
  fantasy: "Others",
}

/** Old gallery paths → new slug. Keep in sync with `next.config.mjs` redirects. */
export const LEGACY_CATEGORY_SLUG_REDIRECTS: Record<string, string> = {
  "video-games": "gaming",
  "sci-fi": "heroes",
  city: "dark",
  cats: "others",
  fantasy: "others",
}

export function categoryNameFromSlug(slug: string): string | undefined {
  return CATEGORY_BY_SLUG[slug] ?? LEGACY_SLUG_TO_NAME[slug]
}

export function categorySlugFromName(name: string): string | undefined {
  return SLUG_BY_CATEGORY[name]
}

export const wallpaperCategorySlugs = macwall.categories
  .map((name) => categorySlugFromName(name))
  .filter((slug): slug is string => Boolean(slug))
