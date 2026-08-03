/** Auto-stamped — do not edit. Public page is feed-driven. */
import {
  CHANGELOG_TOTAL_PUBLIC_ENTRIES,
  curatedChangelogReleases,
} from "@/lib/changelog/curated-releases"
import { webAutoChangelogReleases } from "@/lib/changelog/web-auto-releases"

export const CHANGELOG_GENERATED_AT = "2026-08-03T17:54:14.803Z"

export const CHANGELOG_TOTAL_ENTRIES =
  CHANGELOG_TOTAL_PUBLIC_ENTRIES +
  webAutoChangelogReleases.reduce(
    (sum, release) =>
      sum +
      release.sections.reduce(
        (sectionSum, section) => sectionSum + section.items.length,
        0
      ),
    0
  )

export const changelogReleases = [
  ...webAutoChangelogReleases,
  ...curatedChangelogReleases,
] as const
