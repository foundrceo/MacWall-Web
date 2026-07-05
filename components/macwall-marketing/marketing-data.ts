import { macwallDemoWallpapers } from "@/lib/macwall-marketing-copy"

/** Match `highlights.slides` length — vendored highlight CSS binds backgrounds by these ids. */
export const HIGHLIGHT_PAGE_IDS = [
  "Highlights_page-0__viphf",
  "Highlights_page-1__OzLG_",
] as const

export type WallpaperSlide = (typeof macwallDemoWallpapers)[number]

/** Demo carousel rows (MacWall copy; media paths wherever `macwallDemoWallpapers` points). */
export const WALLPAPER_SLIDES: WallpaperSlide[] = [...macwallDemoWallpapers]
