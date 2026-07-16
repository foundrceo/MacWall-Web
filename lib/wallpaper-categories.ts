import { macwall } from "@/lib/macwall-site"

export const WALLPAPER_CATEGORIES: string[] = [...macwall.categories]

export const DEFAULT_WALLPAPER_CATEGORY = WALLPAPER_CATEGORIES[0] ?? "Nature"
