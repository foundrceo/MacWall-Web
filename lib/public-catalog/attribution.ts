import type { PublicWallpaper } from "@/lib/public-catalog/types"

/**
 * Who a wallpaper is credited to on public pages. Every value comes from a
 * stored record; nothing is generated:
 * - a credit name typed on the submission (`author_display_name`)
 * - "Community" for a real community submission whose uploader left no name
 * - "MacWall" only for wallpapers MacWall made itself
 * - null for the legacy catalog, whose original creator was never recorded
 */
export function wallpaperCreditName(
  wallpaper: Pick<PublicWallpaper, "authorDisplayName" | "originType">
): string | null {
  const author = wallpaper.authorDisplayName?.trim()
  if (author) return author
  switch (wallpaper.originType) {
    case "community_upload":
      return "Community"
    case "macwall_original":
      return "MacWall"
    default:
      return null
  }
}

/** A named person or account, as opposed to the "Community" placeholder. */
export function wallpaperNamedAuthor(
  wallpaper: Pick<PublicWallpaper, "authorDisplayName">
): string | null {
  return wallpaper.authorDisplayName?.trim() || null
}
