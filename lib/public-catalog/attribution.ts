import type { PublicWallpaper } from "@/lib/public-catalog/types"

type AttributionFields = Pick<
  PublicWallpaper,
  "authorDisplayName" | "originType"
>

/**
 * Who a wallpaper is credited to on public pages. Every value comes from a
 * stored record; nothing is generated:
 * - a credit name typed on the submission (`author_display_name`)
 * - "MacWall" only for wallpapers MacWall made itself
 * - null otherwise: a community submission whose uploader left no name, and
 *   the legacy catalog, whose original creator was never recorded
 *
 * There is no "Community" placeholder: as a byline it reads like a person's
 * name, so an unnamed submission is described as community-submitted instead
 * (`isCommunitySubmission`, `wallpaperSourceLabel`).
 */
export function wallpaperCreditName(
  wallpaper: AttributionFields
): string | null {
  const author = wallpaperNamedAuthor(wallpaper)
  if (author) return author
  return wallpaper.originType === "macwall_original" ? "MacWall" : null
}

/** A named person or account from the attribution record, nothing else. */
export function wallpaperNamedAuthor(
  wallpaper: Pick<PublicWallpaper, "authorDisplayName">
): string | null {
  return wallpaper.authorDisplayName?.trim() || null
}

/** Submitted by someone in the community (named or not). */
export function isCommunitySubmission(
  wallpaper: Pick<PublicWallpaper, "originType">
): boolean {
  return wallpaper.originType === "community_upload"
}

/**
 * Short source line for the details panel: the credit when there is one,
 * "Community upload" for an unnamed submission, null for the legacy catalog.
 */
export function wallpaperSourceLabel(
  wallpaper: AttributionFields
): string | null {
  const credit = wallpaperCreditName(wallpaper)
  if (credit) return credit
  return isCommunitySubmission(wallpaper) ? "Community upload" : null
}
