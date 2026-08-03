import type { ChangelogSection, ChangelogSectionKind } from "@/lib/changelog/types"
import { isChangelogSectionKind } from "@/lib/changelog/page-copy"

/**
 * Public changelog leak filter.
 * Anything matching this never reaches /changelog — no review required.
 */
export const CHANGELOG_BLOCKED_PATTERN =
  /\b(datafast|affonso|ahrefs|mixpanel|analytics|pixel|admin\s*portal|admin\s*panel|admin\b|open.?source|\.env\b|github\b|stripe\b|vercel\b|npm\s*audit|devlog|r2\b|supabase|middleware|proxy\b|diagnostics|sentry|webhook|api\s*key|secret|token|commit\b|pr\s*#|pull\s*request|ci\/cd|turbopack|webpack|eslint|typescript|refactor|wip\b|todo\b|fixme|hack\b|Mac app\s*—|Website\s*—|india|inr|regional\s+discount|charm\s+pricing|india50|india60|local\s+india|india\s+pricing|india\s+visitors|india\s+coupon|india\s+promo|pro\s+now\s+\$|pro\+\s+\$|drop\s+global\s+pro)\b|₹|\$\d+\.\d{2}|sale\s+banner.*(?:india|inr|pricing)|(?:india|inr).*sale\s+banner/i

const PLATFORM_PREFIX_PATTERN = /^(?:Mac app|Website)\s*—\s*/i
const HTML_TAG_PATTERN = /<[^>]+>/g
const BULLET_PREFIX_PATTERN = /^(?:[-*•–—]|\d+[.)])\s+/
/** Section labels from MacWall `version.json` notes — not changelog bullets. */
const SECTION_HEADER_PATTERN =
  /^(?:#{1,3}\s*)?(?:\*\*)?(highlights?|what'?s new|new features|features|new|improvements?|polish|fixes?|bug fixes)(?:\*\*)?:?$/i
const FEATURE_PATTERN =
  /\b(new|added|add|launch|introduce[sd]?|support for|now support|enable[sd]?)\b/i
const FIX_PATTERN =
  /\b(fix(?:es|ed)?|bug|crash|resolv(?:e|ed)|patch(?:ed)?|hotfix|address(?:ed)?)\b/i
const IMPROVE_PATTERN =
  /\b(improv(?:e|ed|ement)?|faster|polish(?:ed)?|refine[sd]?|optimiz(?:e|ed|ation)|performance|smoother|redesign(?:ed)?|refresh(?:ed)?|update[sd]?)\b/i
const HIGHLIGHT_PATTERN =
  /\b(major|highlight|big|key|now available|launch)\b/i

export function stripPlatformPrefix(text: string): string {
  return text.replace(PLATFORM_PREFIX_PATTERN, "").trim()
}

export function stripHtml(text: string): string {
  return text
    .replace(HTML_TAG_PATTERN, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim()
}

/** Normalize one public bullet. Returns null if empty or leaky. */
export function sanitizePublicChangelogItem(text: string): string | null {
  const cleaned = stripPlatformPrefix(stripHtml(text))
    .replace(BULLET_PREFIX_PATTERN, "")
    .trim()

  if (cleaned.length < 3) return null
  if (SECTION_HEADER_PATTERN.test(cleaned)) return null
  if (CHANGELOG_BLOCKED_PATTERN.test(cleaned)) return null
  return cleaned
}

export function classifyChangelogItem(text: string): ChangelogSectionKind {
  if (FIX_PATTERN.test(text)) return "fixes"
  if (FEATURE_PATTERN.test(text)) return "features"
  if (HIGHLIGHT_PATTERN.test(text) && text.length < 120) return "highlights"
  if (IMPROVE_PATTERN.test(text)) return "improvements"
  return "improvements"
}

/** Split updater notes / freeform release text into public bullets. */
export function extractPublicChangelogItems(notes: string): string[] {
  const withoutHtmlBreaks = notes
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:li|p|div|h\d)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n- ")

  const plain = stripHtml(withoutHtmlBreaks)
  const chunks = plain
    .split(/\n+|;\s+(?=[A-Z])|(?<=\.)\s+(?=[A-Z•\-*])/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)

  const items: string[] = []
  const seen = new Set<string>()

  for (const chunk of chunks) {
    const item = sanitizePublicChangelogItem(chunk)
    if (!item) continue
    const key = item.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    items.push(item)
  }

  return items
}

export function sectionsFromPublicItems(
  items: readonly string[]
): ChangelogSection[] {
  const buckets: Record<ChangelogSectionKind, string[]> = {
    highlights: [],
    features: [],
    improvements: [],
    fixes: [],
  }

  for (const item of items) {
    const kind = classifyChangelogItem(item)
    buckets[kind].push(item)
  }

  return (Object.keys(buckets) as ChangelogSectionKind[])
    .filter((kind) => buckets[kind].length > 0)
    .map((kind) => ({ kind, items: buckets[kind] }))
}

export function mergeChangelogSections(
  ...lists: readonly (readonly ChangelogSection[])[]
): ChangelogSection[] {
  const buckets: Record<ChangelogSectionKind, string[]> = {
    highlights: [],
    features: [],
    improvements: [],
    fixes: [],
  }
  const seen = new Set<string>()

  for (const list of lists) {
    for (const section of list) {
      if (!isChangelogSectionKind(section.kind)) continue
      for (const raw of section.items) {
        const item = sanitizePublicChangelogItem(raw)
        if (!item) continue
        const key = `${section.kind}:${item.toLowerCase()}`
        if (seen.has(key)) continue
        seen.add(key)
        buckets[section.kind].push(item)
      }
    }
  }

  return (Object.keys(buckets) as ChangelogSectionKind[])
    .filter((kind) => buckets[kind].length > 0)
    .map((kind) => ({ kind, items: buckets[kind] }))
}

export function fallbackReleaseSections(version: string): ChangelogSection[] {
  return [
    {
      kind: "improvements",
      items: [`${version} is now available.`],
    },
  ]
}
