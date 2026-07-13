import { macwall } from "@/lib/macwall-site"

const SLUG_BY_CATEGORY: Record<string, string> = {
  Nature: "nature",
  Space: "space",
  Anime: "anime",
  Cars: "cars",
  City: "city",
  "Video Games": "video-games",
  "Sci-fi": "sci-fi",
  Fantasy: "fantasy",
  Cats: "cats",
}

const CATEGORY_BY_SLUG = Object.fromEntries(
  Object.entries(SLUG_BY_CATEGORY).map(([name, slug]) => [slug, name])
) as Record<string, string>

export function categoryNameFromSlug(slug: string): string | undefined {
  return CATEGORY_BY_SLUG[slug]
}

export function categorySlugFromName(name: string): string | undefined {
  return SLUG_BY_CATEGORY[name]
}

export const wallpaperCategorySlugs = macwall.categories
  .map((name) => categorySlugFromName(name))
  .filter((slug): slug is string => Boolean(slug))
