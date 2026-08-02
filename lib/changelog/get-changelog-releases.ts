import "server-only"

import { curatedChangelogReleases } from "@/lib/changelog/curated-releases"
import { webAutoChangelogReleases } from "@/lib/changelog/web-auto-releases"
import {
  buildChangelogPageCopy,
  isChangelogSectionKind,
  type ChangelogPageCopy,
} from "@/lib/changelog/page-copy"
import {
  extractPublicChangelogItems,
  fallbackReleaseSections,
  mergeChangelogSections,
  sanitizePublicChangelogItem,
  sectionsFromPublicItems,
} from "@/lib/changelog/public-sanitize"
import type {
  ChangelogRelease,
  ChangelogSectionKind,
} from "@/lib/changelog/types"
import { canonicalSiteOrigin } from "@/lib/site-url"
import { r2InstallersGetText } from "@/lib/storage/r2-installers"

const VERSION_KEY = "releases/version.json"
const CHANGELOG_KEY = "releases/changelog.json"

type UpdaterMetadata = {
  version: string
  build?: number
  notes?: string
  /** Stable ship date when the feed provides one. */
  date?: string
}

export type ChangelogPageData = {
  releases: readonly ChangelogRelease[]
  latestVersion: string | null
  syncedAt: string
  copy: ChangelogPageCopy
}

function compareSemverDesc(a: string, b: string): number {
  const partsA = a.split(".").map((part) => Number.parseInt(part, 10))
  const partsB = b.split(".").map((part) => Number.parseInt(part, 10))
  const length = Math.max(partsA.length, partsB.length)

  for (let index = 0; index < length; index += 1) {
    const diff = (partsB[index] ?? 0) - (partsA[index] ?? 0)
    if (diff !== 0) return diff
  }

  return 0
}

function sortNewestFirst(
  releases: readonly ChangelogRelease[]
): readonly ChangelogRelease[] {
  return [...releases].sort((a, b) => {
    // Ship date first so website day releases land on the correct calendar day.
    const byDate = Date.parse(b.date) - Date.parse(a.date)
    if (byDate !== 0) return byDate
    return compareSemverDesc(a.version, b.version)
  })
}

/** Accept ISO / date-only strings; reject Invalid Date. */
function parseStableIsoDate(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed) return null

  const parsed = Date.parse(trimmed)
  if (!Number.isFinite(parsed)) return null

  return new Date(parsed).toISOString()
}

function pickReleaseDate(record: Record<string, unknown>): string | null {
  return (
    parseStableIsoDate(record.date) ??
    parseStableIsoDate(record.publishedAt) ??
    parseStableIsoDate(record.releasedAt) ??
    parseStableIsoDate(record.pub_date)
  )
}

/** Prefer the older (original) ship date when both are valid. */
function preferOriginalDate(a: string, b: string): string {
  const timeA = Date.parse(a)
  const timeB = Date.parse(b)
  if (!Number.isFinite(timeA)) return b
  if (!Number.isFinite(timeB)) return a
  return timeA <= timeB ? a : b
}

function parseUpdaterMetadata(raw: string): UpdaterMetadata | null {
  try {
    const metadata = JSON.parse(raw) as Record<string, unknown>
    const version =
      typeof metadata.version === "string" ? metadata.version.trim() : ""
    if (!version) return null

    const build =
      typeof metadata.build === "number" && Number.isSafeInteger(metadata.build)
        ? metadata.build
        : undefined
    const notes =
      typeof metadata.notes === "string" ? metadata.notes.trim() : undefined
    const date = pickReleaseDate(metadata) ?? undefined

    return { version, build, notes, date }
  } catch {
    return null
  }
}

function parseRelease(value: unknown): ChangelogRelease | null {
  if (!value || typeof value !== "object") return null

  const record = value as Record<string, unknown>
  const version =
    typeof record.version === "string" ? record.version.trim() : ""
  const date = pickReleaseDate(record)
  if (!version || !date) return null

  const build =
    typeof record.build === "number" && Number.isSafeInteger(record.build)
      ? record.build
      : undefined

  const rawSections = Array.isArray(record.sections) ? record.sections : []
  const parsedSections = rawSections
    .map((section) => {
      if (!section || typeof section !== "object") return null
      const sectionRecord = section as Record<string, unknown>
      const kind =
        typeof sectionRecord.kind === "string" ? sectionRecord.kind : ""
      if (!isChangelogSectionKind(kind)) return null

      const items = Array.isArray(sectionRecord.items)
        ? sectionRecord.items
            .filter(
              (item): item is string =>
                typeof item === "string" && item.trim().length > 0
            )
            .map((item) => sanitizePublicChangelogItem(item))
            .filter((item): item is string => item !== null)
        : []

      if (items.length === 0) return null
      return { kind, items }
    })
    .filter(
      (
        section
      ): section is { kind: ChangelogSectionKind; items: string[] } =>
        section !== null
    )

  // Freeform notes fallback on feed entries
  const freeformNotes =
    typeof record.notes === "string" ? record.notes : undefined
  const fromNotes = freeformNotes
    ? sectionsFromPublicItems(extractPublicChangelogItems(freeformNotes))
    : []

  const sections = mergeChangelogSections(parsedSections, fromNotes)
  if (sections.length === 0) return null

  return {
    id: typeof record.id === "string" ? record.id : `v${version}`,
    version,
    ...(build === undefined ? {} : { build }),
    date,
    sections,
  }
}

function parseChangelogFeed(raw: string): ChangelogRelease[] {
  try {
    const parsed = JSON.parse(raw) as unknown
    const list = Array.isArray(parsed)
      ? parsed
      : parsed &&
          typeof parsed === "object" &&
          Array.isArray((parsed as { releases?: unknown }).releases)
        ? (parsed as { releases: unknown[] }).releases
        : []

    return list
      .map((entry) => parseRelease(entry))
      .filter((entry): entry is ChangelogRelease => entry !== null)
  } catch {
    return []
  }
}

async function readInstallerText(key: string): Promise<string | null> {
  try {
    return await r2InstallersGetText(key)
  } catch {
    return null
  }
}

async function fetchUpdaterMetadataFromApi(): Promise<UpdaterMetadata | null> {
  try {
    const response = await fetch(
      `${canonicalSiteOrigin()}/api/installers/releases/version.json`,
      { cache: "no-store" }
    )
    if (!response.ok) return null
    return parseUpdaterMetadata(await response.text())
  } catch {
    return null
  }
}

async function loadUpdaterMetadata(): Promise<UpdaterMetadata | null> {
  const raw = await readInstallerText(VERSION_KEY)
  if (raw) {
    const parsed = parseUpdaterMetadata(raw)
    if (parsed) return parsed
  }
  return fetchUpdaterMetadataFromApi()
}

function releaseFromUpdater(metadata: UpdaterMetadata): ChangelogRelease {
  const items = metadata.notes
    ? extractPublicChangelogItems(metadata.notes)
    : []
  const sections =
    items.length > 0
      ? sectionsFromPublicItems(items)
      : fallbackReleaseSections(metadata.version)

  return {
    id: `v${metadata.version}`,
    version: metadata.version,
    ...(metadata.build === undefined ? {} : { build: metadata.build }),
    // Prefer feed ship date; only fall back to "now" for brand-new versions.
    date: metadata.date ?? new Date().toISOString(),
    sections,
  }
}

function mergeReleaseLists(
  baseline: readonly ChangelogRelease[],
  feed: readonly ChangelogRelease[]
): ChangelogRelease[] {
  const byVersion = new Map<string, ChangelogRelease>()

  for (const release of baseline) {
    byVersion.set(release.version, {
      ...release,
      sections: mergeChangelogSections(release.sections),
    })
  }

  for (const release of feed) {
    const existing = byVersion.get(release.version)
    if (!existing) {
      byVersion.set(release.version, release)
      continue
    }

    byVersion.set(release.version, {
      ...existing,
      id: release.id || existing.id,
      build: release.build ?? existing.build,
      // Keep the original ship date — never jump forward because a feed rewrote it.
      date: preferOriginalDate(existing.date, release.date),
      sections: mergeChangelogSections(existing.sections, release.sections),
    })
  }

  return [...byVersion.values()]
}

function applyUpdaterMetadata(
  releases: readonly ChangelogRelease[],
  metadata: UpdaterMetadata
): ChangelogRelease[] {
  const autoRelease = releaseFromUpdater(metadata)
  const index = releases.findIndex(
    (release) => release.version === metadata.version
  )

  if (index === -1) {
    return [autoRelease, ...releases]
  }

  const current = releases[index]
  const next = [...releases]
  next[index] = {
    ...current,
    build: metadata.build ?? current.build,
    // Never replace a known seed/feed date with "today".
    date: metadata.date
      ? preferOriginalDate(current.date, metadata.date)
      : current.date,
    sections: mergeChangelogSections(current.sections, autoRelease.sections),
  }
  return next
}

/**
 * Fully automated changelog:
 * website git day-releases + frozen Mac seed + R2 changelog.json + updater.
 * Leaky / internal lines are dropped automatically — no manual review.
 */
export async function getChangelogPageData(): Promise<ChangelogPageData> {
  const syncedAt = new Date().toISOString()

  const [updater, feedRaw] = await Promise.all([
    loadUpdaterMetadata(),
    readInstallerText(CHANGELOG_KEY),
  ])

  const feedReleases = feedRaw ? parseChangelogFeed(feedRaw) : []
  const baseline = mergeReleaseLists(
    curatedChangelogReleases,
    webAutoChangelogReleases
  )
  let releases = mergeReleaseLists(baseline, feedReleases)

  if (updater) {
    releases = applyUpdaterMetadata(releases, updater)
  }

  const sorted = sortNewestFirst(releases)
  const latestVersion = updater?.version ?? sorted[0]?.version ?? null

  return {
    releases: sorted,
    latestVersion,
    syncedAt,
    copy: buildChangelogPageCopy({ latestVersion, syncedAt }),
  }
}

/** @deprecated Use getChangelogPageData */
export async function getChangelogReleases(): Promise<
  readonly ChangelogRelease[]
> {
  const data = await getChangelogPageData()
  return data.releases
}
