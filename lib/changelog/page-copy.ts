import {
  formatChangelogVersion,
  type ChangelogSectionKind,
} from "@/lib/changelog/types"
import { macwall } from "@/lib/macwall-site"

/** First public MacWall semver shown on the changelog. */
export const CHANGELOG_FIRST_PUBLIC_VERSION = "1.3"

export type ChangelogPageCopy = {
  lead: string
  omittedNote: string
  autoUpdateNote: string
  syncedLabel: string | null
}

/** Static intro — page is fully automated from updater + website shipping. */
export const CHANGELOG_PAGE_LEAD =
  "Every shipped release, newest first. Mac updates sync from the in-app updater feed; website changes publish automatically when they ship — nothing to maintain by hand."

export function buildChangelogPageCopy(input: {
  latestVersion: string | null
  syncedAt: string | null
}): ChangelogPageCopy {
  const latestLabel = input.latestVersion
    ? formatChangelogVersion(input.latestVersion)
    : null

  const omittedNote = `Older releases before v${CHANGELOG_FIRST_PUBLIC_VERSION} predate the public MacWall launch and are intentionally omitted.`

  const autoUpdateNote = latestLabel
    ? `Auto-update is on by default — already running ${macwall.name}? You're up to date on ${latestLabel}.`
    : `Auto-update is on by default — already running ${macwall.name}? You're up to date.`

  const syncedLabel = input.syncedAt
    ? `Updater feed synced ${formatSyncedAt(input.syncedAt)}.`
    : null

  return {
    lead: CHANGELOG_PAGE_LEAD,
    omittedNote,
    autoUpdateNote,
    syncedLabel,
  }
}

function formatSyncedAt(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  })
}

/** SEO metadata description — static fallback for crawlers. */
export const CHANGELOG_SEO_DESCRIPTION = CHANGELOG_PAGE_LEAD

export function isChangelogSectionKind(value: string): value is ChangelogSectionKind {
  switch (value as ChangelogSectionKind) {
    case "highlights":
    case "features":
    case "improvements":
    case "fixes":
      return true
    default:
      return false
  }
}
