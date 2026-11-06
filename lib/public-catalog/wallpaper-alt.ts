import type { PublicWallpaper } from "@/lib/public-catalog/types"

/**
 * How a catalog category reads inside alt text: lowercase, as an adjective
 * ("anime live wallpaper"), so there is no "a Anime" article to get wrong.
 * "Others" is a catch-all bucket, not a description, so it adds no word.
 */
const CATEGORY_ALT_LABEL: Record<string, string> = {
  Cars: "car",
  Heroes: "superhero",
  Others: "",
}

export function wallpaperCategoryAltLabel(category: string): string {
  const name = category.trim()
  return CATEGORY_ALT_LABEL[name] ?? name.toLowerCase()
}

/**
 * Alt text for a wallpaper's image, e.g.
 * "Black Hole: space live wallpaper for Mac" or, for Others,
 * "Sunset Drive: live wallpaper for Mac".
 */
export function wallpaperImageAlt(
  wallpaper: Pick<PublicWallpaper, "name" | "category">
): string {
  const name = wallpaper.name.trim()
  const label = wallpaperCategoryAltLabel(wallpaper.category)
  const subject = `${label ? `${label} ` : ""}live wallpaper for Mac`
  if (name) return `${name}: ${subject}`
  return `${subject.charAt(0).toUpperCase()}${subject.slice(1)}`
}
