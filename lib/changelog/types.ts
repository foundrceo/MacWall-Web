export type ChangelogSectionKind =
  | "highlights"
  | "features"
  | "improvements"
  | "fixes"

export type ChangelogSection = {
  kind: ChangelogSectionKind
  items: readonly string[]
}

export type ChangelogRelease = {
  id: string
  /** Semver without a leading v — e.g. "2.9" */
  version: string
  build?: number
  date: string
  sections: readonly ChangelogSection[]
}

export const CHANGELOG_SECTION_LABELS: Record<ChangelogSectionKind, string> = {
  highlights: "Highlights",
  features: "New features",
  improvements: "Improvements",
  fixes: "Fixes",
}

export const CHANGELOG_SECTION_ORDER: readonly ChangelogSectionKind[] = [
  "highlights",
  "features",
  "improvements",
  "fixes",
] as const

export const CHANGELOG_PAGE_EYEBROW = "Updates"

export const CHANGELOG_PAGE_TITLE = "Changelog"

export function formatChangelogVersion(
  version: string,
  _build?: number
): string {
  // CalVer day releases from the website git feed (e.g. 2026.8.1).
  if (/^\d{4}\.\d{1,2}\.\d{1,2}$/.test(version)) return "Web"
  return `v${version}`
}

export function sortChangelogSections(
  sections: readonly ChangelogSection[]
): ChangelogSection[] {
  return [...sections].sort(
    (a, b) =>
      CHANGELOG_SECTION_ORDER.indexOf(a.kind) -
      CHANGELOG_SECTION_ORDER.indexOf(b.kind)
  )
}
