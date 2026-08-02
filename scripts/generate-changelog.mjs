#!/usr/bin/env node
/**
 * Fully automated changelog pipeline (no hand edits for new entries):
 *   1. Validate frozen Mac seed (leaks + monotonic dates)
 *   2. Pull website git commits since the seed → public day releases
 *   3. Write lib/changelog/web-auto-releases.ts
 *   4. Stamp lib/changelog/entries.ts
 *
 * Runs on every `npm run build` / CI. Leaky commit subjects are dropped or rewritten.
 */
import { execFileSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")

/** Keep in sync with lib/changelog/public-sanitize.ts (plus generator-only ops terms). */
const BLOCKED_PATTERN =
  /\b(datafast|affonso|ahrefs|mixpanel|analytics|pixel|admin\s*portal|admin\s*panel|admin\b|open.?source|\.env\b|github\b|stripe\b|vercel\b|npm\s*audit|devlog|r2\b|supabase|middleware|proxy\b|diagnostics|sentry|webhook|api\s*key|secret|token|ticket|commit\b|pr\s*#|pull\s*request|ci\/cd|turbopack|webpack|eslint|typescript|refactor|harden|wip\b|todo\b|fixme|hack\b|whop|coupon|price_data|horizons|license\.md|readme|india|inr|regional\s+discount|charm\s+pricing|india50|india60|local\s+india|india\s+pricing|india\s+visitors|india\s+coupon|india\s+promo|pro\s+now\s+\$|pro\+\s+\$|drop\s+global\s+pro)\b|₹|\$\d+\.\d{2}|sale\s+banner.*(?:india|inr|pricing)|(?:india|inr).*sale\s+banner/i

function isPublicSafe(text) {
  return !BLOCKED_PATTERN.test(text)
}

/**
 * Map raw commit subjects → public bullets.
 * First match wins. Unmatched + blocked subjects are dropped.
 */
const PUBLIC_REWRITES = [
  [/command palette/i, "Command palette to jump anywhere on macwall.app."],
  [/wallpaper gallery|public wallpapers/i, "Public wallpaper gallery with search, SEO, and app deep links."],
  [/sale banner|announcement banner/i, "Limited-time sale banner with responsive layout."],
  [/discord.*10%|10%.*discord|discord 10/i, "Discord members get 10% off on the pricing page."],
  [/discord.*invite|discord entry|community invite/i, "Discord community links restored across macwall.app."],
  [/pro\+.*10\/15\/20|10\/15\/20 mac|mac packs|sliding pill|mac picker/i, "Pro+ licenses for 10, 15, or 20 Macs with clearer pack picking."],
  [/checkout.*prefetch|checkout.*instant|checkout redirect|faster checkout/i, "Faster checkout when upgrading to Pro."],
  [/pricing cards|conversion-focused pricing|pricing chrome|pricing ui|rotating pro badge|strike prices|local fx|benefits/i, "Clearer pricing cards, benefits, and upgrade prompts."],
  [/live support|assist|handoff|human support|support chat/i, "MacWall Assist live support chat improvements."],
  [/affiliate/i, "Affiliate partner entry points in navigation and footer."],
  [/mobile marketing|side-by-side ctas|blurred nav/i, "Polished mobile marketing layout and navigation."],
  [/annual billing|permanent/i, "Simpler pricing — permanent licenses only."],
  [/changelog/i, "Public changelog page synced with shipping updates."],
  [/marketing layout|marketing ui|nav aligned|spacing|padding/i, "Clearer spacing and alignment across marketing pages."],
]

const curatedPath = join(root, "lib/changelog/curated-releases.ts")
const curatedSource = readFileSync(curatedPath, "utf8")

// ── Seed leak filter ──────────────────────────────────────────────
const itemMatches = curatedSource.matchAll(/items:\s*\[([\s\S]*?)\]/g)
const blockedHits = []

for (const match of itemMatches) {
  const block = match[1]
  const strings = block.matchAll(/"((?:\\.|[^"\\])*)"/g)
  for (const [, text] of strings) {
    if (!isPublicSafe(text)) blockedHits.push(text)
  }
}

if (blockedHits.length > 0) {
  console.error("Blocked internal/sensitive strings in changelog seed:")
  for (const hit of blockedHits) console.error(`  - ${hit}`)
  process.exit(1)
}

const releaseBlocks = [
  ...curatedSource.matchAll(/version:\s*"([^"]+)"[\s\S]*?date:\s*"([^"]+)"/g),
]

function compareSemverAsc(a, b) {
  const partsA = a.split(".").map((part) => Number.parseInt(part, 10))
  const partsB = b.split(".").map((part) => Number.parseInt(part, 10))
  const length = Math.max(partsA.length, partsB.length)
  for (let index = 0; index < length; index += 1) {
    const diff = (partsA[index] ?? 0) - (partsB[index] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

const seedReleases = releaseBlocks.map((match) => {
  const version = match[1]
  const date = match[2]
  const time = Date.parse(date)
  if (!Number.isFinite(time)) {
    console.error(`Invalid ISO date for v${version}: ${date}`)
    process.exit(1)
  }
  return { version, date, time }
})

if (seedReleases.length === 0) {
  console.error("No releases found in curated-releases.ts")
  process.exit(1)
}

const oldestFirst = [...seedReleases].sort((a, b) =>
  compareSemverAsc(a.version, b.version)
)

for (let index = 1; index < oldestFirst.length; index += 1) {
  const prev = oldestFirst[index - 1]
  const curr = oldestFirst[index]
  if (curr.time < prev.time) {
    console.error(
      `Changelog dates go backwards: v${prev.version} (${prev.date.slice(0, 10)}) → v${curr.version} (${curr.date.slice(0, 10)})`
    )
    process.exit(1)
  }
}

const latestSeed = [...seedReleases].sort((a, b) => b.time - a.time)[0]
const sinceDate = latestSeed.date.slice(0, 10)

// ── Publicify helpers ─────────────────────────────────────────────
function publicifySubject(subject) {
  const cleaned = subject.replace(/\s+/g, " ").trim()
  if (!cleaned) return null

  for (const [pattern, replacement] of PUBLIC_REWRITES) {
    if (pattern.test(cleaned) && isPublicSafe(replacement)) return replacement
  }

  if (!isPublicSafe(cleaned)) return null

  // Keep short, user-facing subjects that survived the filter.
  const sentence = /[.!?]$/.test(cleaned) ? cleaned : `${cleaned}.`
  if (sentence.length < 12 || sentence.length > 140) return null
  const publicItem = sentence.charAt(0).toUpperCase() + sentence.slice(1)
  return isPublicSafe(publicItem) ? publicItem : null
}

function classifyItem(text) {
  if (/\b(fix(?:es|ed)?|bug|crash)\b/i.test(text)) return "fixes"
  if (/\b(new|added|add|launch|introduce|command palette|gallery|affiliate|pro\+)\b/i.test(text))
    return "features"
  if (/\b(major|highlight|now available)\b/i.test(text)) return "highlights"
  return "improvements"
}

function calverFromDay(day) {
  const [y, m, d] = day.split("-").map((part) => Number.parseInt(part, 10))
  return `${y}.${m}.${d}`
}

function sectionsFromItems(items) {
  const buckets = {
    highlights: [],
    features: [],
    improvements: [],
    fixes: [],
  }
  for (const item of items) {
    buckets[classifyItem(item)].push(item)
  }
  return ["highlights", "features", "improvements", "fixes"]
    .filter((kind) => buckets[kind].length > 0)
    .map((kind) => ({ kind, items: buckets[kind] }))
}

// ── Git → daily web releases ──────────────────────────────────────
let gitLog = ""
try {
  gitLog = execFileSync(
    "git",
    [
      "log",
      `--since=${sinceDate}`,
      "--pretty=format:%ad%x09%s",
      "--date=short",
      "--no-merges",
    ],
    { cwd: root, encoding: "utf8" }
  )
} catch {
  console.warn("git log unavailable — skipping web auto releases.")
}

const byDay = new Map()

for (const line of gitLog.split("\n")) {
  if (!line.trim()) continue
  const tab = line.indexOf("\t")
  if (tab === -1) continue
  const day = line.slice(0, tab).trim()
  const subject = line.slice(tab + 1).trim()
  if (!day || day <= sinceDate) continue

  const publicItem = publicifySubject(subject)
  if (!publicItem) continue

  const list = byDay.get(day) ?? []
  if (!list.some((item) => item.toLowerCase() === publicItem.toLowerCase())) {
    list.push(publicItem)
  }
  byDay.set(day, list)
}

const webReleases = [...byDay.entries()]
  .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
  .map(([day, items]) => {
    const version = calverFromDay(day)
    return {
      id: `web-${day}`,
      version,
      date: `${day}T12:00:00.000Z`,
      sections: sectionsFromItems(items),
    }
  })
  .filter((release) => release.sections.length > 0)

function serializeRelease(release) {
  const sections = release.sections
    .map((section) => {
      const items = section.items
        .map((item) => `          ${JSON.stringify(item)},`)
        .join("\n")
      return `      {
        kind: ${JSON.stringify(section.kind)},
        items: [
${items}
        ],
      },`
    })
    .join("\n")

  return `  {
    id: ${JSON.stringify(release.id)},
    version: ${JSON.stringify(release.version)},
    date: ${JSON.stringify(release.date)},
    sections: [
${sections}
    ],
  },`
}

const webFile = `/**
 * AUTO-GENERATED — do not edit.
 * Built from public-safe website git commits by scripts/generate-changelog.mjs
 */
import type { ChangelogRelease } from "@/lib/changelog/types"

export const webAutoChangelogReleases: readonly ChangelogRelease[] = [
${webReleases.map(serializeRelease).join("\n")}
]
`

writeFileSync(join(root, "lib/changelog/web-auto-releases.ts"), webFile, "utf8")

const generatedAt = new Date().toISOString()
const entriesFile = `/** Auto-stamped — do not edit. Public page is feed-driven. */
import {
  CHANGELOG_TOTAL_PUBLIC_ENTRIES,
  curatedChangelogReleases,
} from "@/lib/changelog/curated-releases"
import { webAutoChangelogReleases } from "@/lib/changelog/web-auto-releases"

export const CHANGELOG_GENERATED_AT = ${JSON.stringify(generatedAt)}

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
`

writeFileSync(join(root, "lib/changelog/entries.ts"), entriesFile, "utf8")

console.log(
  `Changelog OK — seed ${seedReleases.length} + web days ${webReleases.length} (since ${sinceDate}), leak filter clean.`
)
for (const release of webReleases.slice(0, 5)) {
  const count = release.sections.reduce((n, s) => n + s.items.length, 0)
  console.log(`  web v${release.version} (${release.date.slice(0, 10)}): ${count} public items`)
}
