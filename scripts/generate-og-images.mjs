#!/usr/bin/env node
/**
 * Renders one 1200×630 share image per public page and writes them to
 * public/og/{slug}.{hash}.jpg, plus lib/seo/og-manifest.json, which page
 * metadata reads. Nothing renders at request time, so sharing a link costs
 * nothing; the hashed names are served with a one-year immutable cache.
 *
 * Design: full-bleed catalog wallpaper, dark scrim, Averia Serif Libre title,
 * Geist labels (design "B", chosen 2026-10-27).
 *
 * Pages come from lib/ai/site-content.ts (every page with a Markdown twin).
 * Wallpaper detail pages are not here: they share their own poster.
 *
 * Images are rendered once: a page whose title, label and wallpaper haven't
 * changed keeps its file. Pass --force to re-render everything.
 *
 * Usage: npm run og:generate
 */
import { createHash } from "node:crypto"
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { createJiti } from "jiti"
import sharp from "sharp"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const require = createRequire(import.meta.url)
const React = require("react")
const { ImageResponse } = await import(
  join(root, "node_modules/next/dist/compiled/@vercel/og/index.node.js")
)

const OUT_DIR = join(root, "public/og")
const MANIFEST = join(root, "lib/seo/og-manifest.json")
const TEMPLATE_VERSION = "b4"
const W = 1200
const H = 630
const force = process.argv.includes("--force")

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

// Site modules, loaded as TypeScript with the project's `@/` alias.
const jiti = createJiti(join(root, "scripts/generate-og-images.mjs"), {
  alias: {
    "@": root,
    "server-only": join(root, "scripts/og/empty-module.mjs"),
  },
})
const { siteMarkdownDocuments } = await jiti.import(
  join(root, "lib/ai/site-content.ts")
)

async function catalog() {
  const rows = []
  for (let offset = 0; ; offset += 1000) {
    const params = new URLSearchParams({
      select: "id,name,thumb_key",
      order: "like_count.desc,created_at.desc",
      limit: "1000",
      offset: String(offset),
    })
    const res = await fetch(`${supabaseUrl}/rest/v1/wallpapers?${params}`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    })
    if (!res.ok) throw new Error(`catalog read failed: HTTP ${res.status}`)
    const page = await res.json()
    rows.push(...page)
    if (page.length < 1000) break
  }
  return rows.filter((row) => row.thumb_key)
}

const rows = await catalog()

/**
 * Generic share images use these community uploads (submitters confirm they
 * hold the rights). Hand-picked on 2026-10-27 from dark Nature, Space, Abstract
 * and Dark loops with no people, brands, films, games or Apple artwork, and no
 * busy detail behind the title, so the cards never feature someone else's
 * property. Review new picks by eye.
 */
const GENERIC_WALLPAPER_IDS = [
  "b8b6c772-df82-4cca-bf5e-bbfd557b17d0", // Zen Bamboo Forest Path
  "61b61ea1-f67d-4c17-9dc0-b80db1b65256", // Rainy Petal Road
  "81e1d17c-ca72-4a92-8bb0-6951fab0872c", // Shadow Hooded Wraith
  "d6b3be93-9476-4077-be83-7bc97477e74f", // Dark Mountain Citadel
  "914f49ea-7e0d-4f4c-8503-4b5b21aadae5", // Night City Highway
  "7babae5a-ba0a-4af1-8dce-2426e122b214", // Cliffside Coastline
  "891090f5-3f25-4be7-9b86-48438207dbdc", // Astronaut in Thunder Cloud
  "c48f0449-8f63-40df-b44a-fe926d991dda", // Mountain Star
  "9ceaaf80-257f-4130-a784-a9b50d939bd1", // Space Window Ambience
  "9037f48f-0f1a-4eca-b62a-724ddeb4a190", // Blue Mountain Lake Stag
]
const generalPool = GENERIC_WALLPAPER_IDS.map((id) =>
  rows.find((row) => row.id === id)
).filter(Boolean)

if (generalPool.length === 0)
  throw new Error("No community wallpapers available for share images.")

const hashOf = (text) => createHash("sha256").update(text).digest("hex")
const pick = (pool, key) =>
  pool[Number.parseInt(hashOf(key).slice(0, 8), 16) % pool.length]

/**
 * Every card draws from the reviewed pool, even topic pages: catalog loops
 * named for a topic can still show a real person or a brand.
 */
function wallpaperFor(doc) {
  return pick(generalPool, doc.path)
}

const LABELS = {
  product: "MacWall",
  docs: "Help",
  learn: "Learn",
  blog: "Guide",
  wallpapers: "Live wallpapers",
  comparisons: "Compare",
  legal: "Legal",
}

/** Card text where the Markdown title reads badly on an image. */
const TITLE_OVERRIDES = { "/": "Live wallpapers for Mac, in 4K" }

function cleanTitle(path, title) {
  return (TITLE_OVERRIDES[path] ?? title)
    .replace(/\s*\|\s*MacWall$/, "")
    .replace(/\s+[–—-]\s+/g, ": ")
}

const fonts = [
  {
    name: "Averia",
    data: readFileSync(join(root, "scripts/og/AveriaSerifLibre-Regular.ttf")),
    weight: 400,
  },
  {
    name: "Geist",
    data: readFileSync(
      join(root, "node_modules/geist/dist/fonts/geist-sans/Geist-Regular.ttf")
    ),
    weight: 400,
  },
]
const icon = `data:image/png;base64,${(await sharp(join(root, "public/MacWall.png")).resize(96).png().toBuffer()).toString("base64")}`
const h = React.createElement

const imageCache = new Map()
async function wallpaperDataUri(thumbKey) {
  if (imageCache.has(thumbKey)) return imageCache.get(thumbKey)
  const res = await fetch(`${cdn}/${thumbKey.replace(/^\//, "")}`)
  if (!res.ok) throw new Error(`poster ${thumbKey}: HTTP ${res.status}`)
  const jpeg = await sharp(Buffer.from(await res.arrayBuffer()))
    .resize(W, H, { fit: "cover" })
    .jpeg({ quality: 84 })
    .toBuffer()
  const uri = `data:image/jpeg;base64,${jpeg.toString("base64")}`
  imageCache.set(thumbKey, uri)
  return uri
}

function card({ title, label, url, image }) {
  const size = title.length > 52 ? 54 : title.length > 36 ? 62 : 70
  return h(
    "div",
    {
      style: {
        width: W,
        height: H,
        display: "flex",
        position: "relative",
        background: "#000",
      },
    },
    h("img", {
      src: image,
      width: W,
      height: H,
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        width: W,
        height: H,
        objectFit: "cover",
      },
    }),
    h("div", {
      style: {
        position: "absolute",
        inset: 0,
        display: "flex",
        backgroundImage:
          "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.94) 100%)",
      },
    }),
    h(
      "div",
      {
        style: {
          position: "absolute",
          top: 48,
          left: 64,
          right: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        },
      },
      h(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 14 } },
        h("img", {
          src: icon,
          width: 44,
          height: 44,
          style: { borderRadius: 10 },
        }),
        h(
          "div",
          { style: { fontFamily: "Geist", fontSize: 28, color: "#fff" } },
          "MacWall"
        )
      ),
      h(
        "div",
        {
          style: {
            fontFamily: "Geist",
            fontSize: 20,
            color: "rgba(255,255,255,0.8)",
            textTransform: "uppercase",
            letterSpacing: 3,
          },
        },
        label
      )
    ),
    h(
      "div",
      {
        style: {
          position: "absolute",
          left: 64,
          right: 64,
          bottom: 54,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        },
      },
      h(
        "div",
        {
          style: {
            fontFamily: "Averia",
            fontSize: size,
            lineHeight: 1.06,
            color: "#fff",
            maxWidth: 1000,
            textShadow: "0 2px 18px rgba(0,0,0,0.55)",
          },
        },
        title
      ),
      h(
        "div",
        {
          style: {
            fontFamily: "Geist",
            fontSize: 24,
            color: "rgba(255,255,255,0.72)",
          },
        },
        url
      )
    )
  )
}

mkdirSync(OUT_DIR, { recursive: true })
const previous = existsSync(MANIFEST)
  ? JSON.parse(readFileSync(MANIFEST, "utf8"))
  : {}
const manifest = {}
let rendered = 0
let kept = 0

for (const doc of siteMarkdownDocuments()) {
  const title = cleanTitle(doc.path, doc.title)
  const label = LABELS[doc.group] ?? "MacWall"
  const url = `macwall.app${doc.path === "/" ? "" : doc.path}`
  const wallpaper = wallpaperFor(doc)
  const slug = doc.path === "/" ? "home" : doc.path.slice(1).replace(/\//g, "-")
  const hash = hashOf(
    [TEMPLATE_VERSION, title, label, url, wallpaper.thumb_key].join("\n")
  ).slice(0, 10)
  const file = `${slug}.${hash}.jpg`
  manifest[doc.path] = {
    file,
    width: W,
    height: H,
    alt: `${title}, with the ${wallpaper.name} live wallpaper`,
  }

  if (!force && existsSync(join(OUT_DIR, file))) {
    kept += 1
    continue
  }
  const response = new ImageResponse(
    card({
      title,
      label,
      url,
      image: await wallpaperDataUri(wallpaper.thumb_key),
    }),
    {
      width: W,
      height: H,
      fonts,
    }
  )
  const jpeg = await sharp(Buffer.from(await response.arrayBuffer()))
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer()
  writeFileSync(join(OUT_DIR, file), jpeg)
  rendered += 1
}

// Remove share images that no page uses any more (only files this script names).
const used = new Set(Object.values(manifest).map((entry) => entry.file))
let removed = 0
for (const name of readdirSync(OUT_DIR)) {
  if (/^[a-z0-9-]+\.[a-f0-9]{10}\.jpg$/.test(name) && !used.has(name)) {
    unlinkSync(join(OUT_DIR, name))
    removed += 1
  }
}

const sorted = Object.fromEntries(
  Object.keys(manifest)
    .sort()
    .map((key) => [key, manifest[key]])
)
writeFileSync(MANIFEST, `${JSON.stringify(sorted, null, 2)}\n`)
const changed = JSON.stringify(previous) !== JSON.stringify(sorted)
console.log(
  `${rendered} rendered, ${kept} unchanged, ${removed} removed; manifest ${changed ? "updated" : "unchanged"}`
)
