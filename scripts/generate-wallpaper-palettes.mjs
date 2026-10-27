#!/usr/bin/env node
/**
 * Extracts a five-colour palette from every public catalog poster and writes
 * lib/seo/wallpaper-palettes.json ({ [wallpaperId]: ["#rrggbb", ...] }, most
 * common colour first). Wallpaper pages show it, so each page carries details
 * measured from its own wallpaper.
 *
 * Incremental: ids already in the file are skipped. Pass --all to redo them.
 * Reads the catalog with the public anon key, the same reads the site makes.
 *
 * Usage: npm run palettes:generate
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const outFile = join(root, "lib/seo/wallpaper-palettes.json")
const redoAll = process.argv.includes("--all")

function loadEnv() {
  const envFile = join(root, ".env")
  if (!existsSync(envFile)) return
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/)
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2]
  }
}
loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const cdn = (
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL?.trim() ||
  "https://cdn.macwall.app"
).replace(/\/$/, "")
if (!supabaseUrl || !anonKey) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required."
  )
  process.exit(1)
}

async function catalogRows() {
  const rows = []
  for (let offset = 0; ; offset += 1000) {
    const params = new URLSearchParams({
      select: "id,thumb_key",
      order: "id.asc",
      limit: "1000",
      offset: String(offset),
    })
    const res = await fetch(`${supabaseUrl}/rest/v1/wallpapers?${params}`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    })
    if (!res.ok) throw new Error(`catalog read failed: HTTP ${res.status}`)
    const page = await res.json()
    rows.push(...page)
    if (page.length < 1000) return rows
  }
}

const hex = ([r, g, b]) =>
  `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`

/** k-means on a 48x27 downsample, seeded from evenly spaced pixels so runs are repeatable. */
function palette(pixels, k = 5) {
  let centers = Array.from(
    { length: k },
    (_, i) => pixels[Math.floor(((i + 0.5) * pixels.length) / k)]
  )
  let counts = []
  for (let iter = 0; iter < 12; iter += 1) {
    const sums = centers.map(() => [0, 0, 0])
    counts = centers.map(() => 0)
    for (const p of pixels) {
      let best = 0
      let bestDist = Infinity
      centers.forEach((c, i) => {
        const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2
        if (d < bestDist) {
          bestDist = d
          best = i
        }
      })
      sums[best][0] += p[0]
      sums[best][1] += p[1]
      sums[best][2] += p[2]
      counts[best] += 1
    }
    centers = centers.map((c, i) =>
      counts[i] ? sums[i].map((s) => s / counts[i]) : c
    )
  }
  return centers
    .map((c, i) => ({ color: hex(c), count: counts[i] }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count)
    .map((entry) => entry.color)
    .filter((color, i, all) => all.indexOf(color) === i)
}

async function paletteFor(thumbKey) {
  const res = await fetch(`${cdn}/${thumbKey.replace(/^\//, "")}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const { data, info } = await sharp(Buffer.from(await res.arrayBuffer()))
    .resize(48, 27, { fit: "cover" })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const pixels = []
  for (let i = 0; i < data.length; i += info.channels)
    pixels.push([data[i], data[i + 1], data[i + 2]])
  return palette(pixels)
}

const existing =
  existsSync(outFile) && !redoAll
    ? JSON.parse(readFileSync(outFile, "utf8"))
    : {}
const rows = (await catalogRows()).filter((row) => row.thumb_key)
const todo = rows.filter((row) => !existing[row.id])
console.log(`${rows.length} wallpapers, ${todo.length} to process`)

const result = { ...existing }
let done = 0
let failed = 0
const queue = [...todo]
await Promise.all(
  Array.from({ length: 8 }, async () => {
    for (let row = queue.shift(); row; row = queue.shift()) {
      try {
        result[row.id] = await paletteFor(row.thumb_key)
      } catch (error) {
        failed += 1
        console.warn(`skip ${row.id}: ${error.message}`)
      }
      done += 1
      if (done % 100 === 0) console.log(`${done}/${todo.length}`)
    }
  })
)

// Drop wallpapers that left the catalog; keep keys sorted for small diffs.
const live = new Set(rows.map((row) => row.id))
const sorted = Object.fromEntries(
  Object.keys(result)
    .filter((id) => live.has(id))
    .sort()
    .map((id) => [id, result[id]])
)
writeFileSync(outFile, `${JSON.stringify(sorted, null, 0)}\n`)
console.log(
  `wrote ${Object.keys(sorted).length} palettes (${failed} failed) to ${outFile}`
)
