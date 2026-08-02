import type { PublicWallpaper } from "@/lib/public-catalog/types"

export type CommandPaletteFilter = "all" | "wallpapers" | "pages" | "actions"

export type CommandPaletteItemKind = "page" | "action" | "wallpaper"

export type CommandPaletteStaticItem = {
  id: string
  kind: Exclude<CommandPaletteItemKind, "wallpaper">
  label: string
  description?: string
  href: string
  external?: boolean
  keywords?: string[]
  analyticsEvent?: "download_click" | "checkout_started"
  analyticsLocation?: string
}

export type CommandPaletteWallpaperItem = {
  id: string
  kind: "wallpaper"
  label: string
  description?: string
  href: string
  wallpaper: PublicWallpaper
}

export type CommandPaletteItem =
  | CommandPaletteStaticItem
  | CommandPaletteWallpaperItem

export type CommandPaletteSection = {
  id: string
  title: string
  items: CommandPaletteItem[]
}

export const COMMAND_PALETTE_FILTERS: ReadonlyArray<{
  id: CommandPaletteFilter
  label: string
  shortcut: string
}> = [
  { id: "all", label: "All results", shortcut: "1" },
  { id: "wallpapers", label: "Wallpapers", shortcut: "2" },
  { id: "pages", label: "Pages", shortcut: "3" },
  { id: "actions", label: "Actions", shortcut: "4" },
]
