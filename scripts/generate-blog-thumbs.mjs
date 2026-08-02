#!/usr/bin/env node
/**
 * Generates Apple-style MacBook mockup thumbnails for every blog post.
 * Output: public/blog/thumbs/{slug}.jpg (1200×800, 3:2)
 *
 * Usage: npm run blog-thumbs:generate
 */
import { readdirSync, readFileSync, mkdirSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const outDir = join(root, "public/blog/thumbs")

const CDN = (
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL?.trim() || "https://cdn.macwall.app"
).replace(/\/$/, "")

const W = 1200
const H = 800

/** Same pool as lib/blog/tile-media.ts — keep in sync. */
const THUMB_KEYS = [
  "thumbs/emerald-nebula-swirl.jpg",
  "thumbs/ringed-black-hole.jpg",
  "thumbs/solar-flare-singularity.jpg",
  "thumbs/black-hole-eclipse.jpg",
  "thumbs/accretion-disk-black-hole.jpg",
  "thumbs/fiery-ocean-portal.jpg",
  "thumbs/gargantua-accretion-disk.jpg",
  "thumbs/purple-black-hole.jpg",
  "thumbs/molten-black-hole.jpg",
  "thumbs/milky-way-galaxy.jpg",
  "thumbs/astronaut-at-black-hole.jpg",
  "thumbs/black-hole-gargantua-moewalls-com.jpg",
  "thumbs/earth-in-shadow.jpg",
  "thumbs/orbital-station-above-earth.jpg",
  "thumbs/astronaut-in-nebula-drift.jpg",
  "thumbs/black-hole-collision.jpg",
  "thumbs/supermassive-singularity.jpg",
  "thumbs/wallpaper-giant-black-hole-gargantua.jpg",
  "thumbs/crimson-moonlit-sky.jpg",
  "thumbs/purple-moonlit-clouds.jpg",
  "thumbs/astronaut-before-singularity.jpg",
  "thumbs/red-planet-wanderer.jpg",
  "thumbs/wallpaper-black-liquid-texture.jpg",
  "thumbs/dimensional-portal.jpg",
  "thumbs/sci-fi-black-hole-moewalls-com.jpg",
  "thumbs/chrome-android-in-space.jpg",
  "thumbs/wallpaper-velvet-afterglow3840x.jpg",
  "thumbs/anonymous-mask-silhouette.jpg",
  "thumbs/android-angel.jpg",
  "thumbs/stranded-moon-wreck.jpg",
  "thumbs/nanami-yellow-glow.jpg",
  "thumbs/orbital-station-above-earth2.jpg",
]

/** Slug → thumb key overrides for thematic fit. */
const SLUG_THUMB_OVERRIDES = {
  "anime-live-wallpaper-mac": "thumbs/nanami-yellow-glow.jpg",
  "nature-live-wallpaper-mac": "thumbs/emerald-nebula-swirl.jpg",
  "space-wallpaper-mac": "thumbs/milky-way-galaxy.jpg",
  "gaming-wallpaper-mac": "thumbs/chrome-android-in-space.jpg",
  "macwall-vs-wallper": "thumbs/purple-black-hole.jpg",
  "macwall-vs-wallspace": "thumbs/ringed-black-hole.jpg",
  "macwall-vs-backdrop": "thumbs/black-hole-eclipse.jpg",
  "macwall-vs-lively-wallpaper": "thumbs/solar-flare-singularity.jpg",
  "live-wallpaper-cpu-usage-mac": "thumbs/wallpaper-black-liquid-texture.jpg",
  "macwall-performance-zero-overhead-guide":
    "thumbs/wallpaper-black-liquid-texture.jpg",
  "apple-silicon-wallpaper-performance": "thumbs/supermassive-singularity.jpg",
  "4k-video-wallpaper-mac": "thumbs/gargantua-accretion-disk.jpg",
  "lock-screen-live-wallpaper-macos": "thumbs/crimson-moonlit-sky.jpg",
  "macos-27-lock-screen-live-wallpaper": "thumbs/purple-moonlit-clouds.jpg",
  "what-is-macwall-complete-guide": "thumbs/astronaut-at-black-hole.jpg",
  "best-live-wallpaper-app-mac-2026": "thumbs/fiery-ocean-portal.jpg",
}

const LAPTOP = {
  screenX: 198,
  screenY: 68,
  screenW: 804,
  screenH: 504,
  screenR: 16,
  bezel: 11,
  chinH: 26,
}

function encodePath(pathKey) {
  return pathKey
    .split("/")
    .filter(Boolean)
    .map((s) => encodeURIComponent(s))
    .join("/")
}

function thumbUrl(key) {
  return `${CDN}/${encodePath(key)}`
}

function collectSlugs() {
  const articlesDir = join(root, "lib/blog/articles")
  const slugs = []
  for (const file of readdirSync(articlesDir)) {
    if (!file.endsWith(".ts")) continue
    const text = readFileSync(join(articlesDir, file), "utf8")
    for (const match of text.matchAll(/slug:\s*"([^"]+)"/g)) {
      slugs.push(match[1])
    }
  }
  return [...new Set(slugs)].sort()
}

function thumbKeyForSlug(slug, index) {
  if (SLUG_THUMB_OVERRIDES[slug]) return SLUG_THUMB_OVERRIDES[slug]
  return THUMB_KEYS[index % THUMB_KEYS.length]
}

function buildBackgroundSvg() {
  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="floor" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#050505"/>
  <ellipse cx="600" cy="718" rx="360" ry="34" fill="url(#floor)"/>
</svg>`)
}

function buildFrameSvg() {
  const { screenX, screenY, screenW, screenH, screenR, bezel, chinH } = LAPTOP
  const outerX = screenX - bezel
  const outerY = screenY - bezel
  const outerW = screenW + bezel * 2
  const outerH = screenH + bezel + chinH + 6
  const chinY = screenY + screenH + 4
  const baseY = chinY + chinH + 6
  const baseW = outerW + 72
  const baseX = outerX - 36

  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bezel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#48484a"/>
      <stop offset="45%" stop-color="#2c2c2e"/>
      <stop offset="100%" stop-color="#1d1d1f"/>
    </linearGradient>
    <linearGradient id="base" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3a3a3c"/>
      <stop offset="100%" stop-color="#141416"/>
    </linearGradient>
    <filter id="lift" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="28" stdDeviation="32" flood-color="#000000" flood-opacity="0.65"/>
    </filter>
  </defs>
  <g filter="url(#lift)">
    <rect x="${outerX}" y="${outerY}" width="${outerW}" height="${outerH}" rx="${screenR + 6}" fill="url(#bezel)"/>
    <rect x="${outerX + 18}" y="${chinY}" width="${outerW - 36}" height="${chinH}" rx="5" fill="#252527"/>
    <rect x="${baseX}" y="${baseY}" width="${baseW}" height="16" rx="8" fill="url(#base)"/>
    <rect x="${baseX + 24}" y="${baseY + 16}" width="${baseW - 48}" height="5" rx="2.5" fill="#0a0a0a" opacity="0.85"/>
  </g>
</svg>`)
}

function buildNotchSvg() {
  const { screenX, screenY, screenW } = LAPTOP
  const notchW = 118
  const notchH = 20
  const notchX = screenX + screenW / 2 - notchW / 2
  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect x="${notchX}" y="${screenY}" width="${notchW}" height="${notchH}" rx="9" fill="#050505"/>
</svg>`)
}

function roundedMask(w, h, r) {
  return Buffer.from(
    `<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="#fff"/></svg>`
  )
}

async function generateThumb(wallpaperUrl, outputPath) {
  const { screenX, screenY, screenW, screenH, screenR } = LAPTOP

  const res = await fetch(wallpaperUrl)
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status}: ${wallpaperUrl}`)
  }
  const wpBuffer = Buffer.from(await res.arrayBuffer())

  const screenWallpaper = await sharp(wpBuffer)
    .resize(screenW, screenH, { fit: "cover", position: "centre" })
    .modulate({ brightness: 1.02, saturation: 1.06 })
    .png()
    .toBuffer()

  const roundedScreen = await sharp(screenWallpaper)
    .composite([{ input: roundedMask(screenW, screenH, screenR), blend: "dest-in" }])
    .png()
    .toBuffer()

  const reflection = await sharp(screenWallpaper)
    .flip()
    .blur(2)
    .modulate({ brightness: 0.35 })
    .resize(screenW, Math.round(screenH * 0.22), { fit: "cover" })
    .composite([
      {
        input: Buffer.from(
          `<svg width="${screenW}" height="${Math.round(screenH * 0.22)}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="white" stop-opacity="0.35"/><stop offset="100%" stop-color="white" stop-opacity="0"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer()

  const reflectionTop = screenY + screenH + LAPTOP.chinH + 28

  await sharp({
    create: {
      width: W,
      height: H,
      channels: 3,
      background: { r: 5, g: 5, b: 5 },
    },
  })
    .composite([
      { input: buildBackgroundSvg(), left: 0, top: 0 },
      { input: buildFrameSvg(), left: 0, top: 0 },
      { input: roundedScreen, left: screenX, top: screenY },
      {
        input: reflection,
        left: screenX,
        top: reflectionTop,
        blend: "over",
      },
      { input: buildNotchSvg(), left: 0, top: 0 },
    ])
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(outputPath)
}

async function writeDerivedVariants(slug, mainPath) {
  const main = sharp(mainPath)
  await main
    .clone()
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(join(outDir, `${slug}-og.jpg`))

  await main
    .clone()
    .resize(480, 480, { fit: "cover", position: "centre" })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(join(outDir, `${slug}-list.jpg`))
}

async function main() {
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const force = process.argv.includes("--force")
  const slugs = collectSlugs()
  console.log(
    `Generating ${slugs.length} blog mockups (+ OG + list) → public/blog/thumbs/`
  )

  let ok = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i]
    const key = thumbKeyForSlug(slug, i)
    const url = thumbUrl(key)
    const out = join(outDir, `${slug}.jpg`)
    const og = join(outDir, `${slug}-og.jpg`)
    const list = join(outDir, `${slug}-list.jpg`)

    if (!force && existsSync(out) && existsSync(og) && existsSync(list)) {
      process.stdout.write(`  ${slug} … skip (exists)\n`)
      skipped++
      ok++
      continue
    }

    try {
      process.stdout.write(`  ${slug} … `)
      await generateThumb(url, out)
      await writeDerivedVariants(slug, out)
      console.log("ok")
      ok++
    } catch (err) {
      console.log(`FAIL (${err.message})`)
      failed++
    }
  }

  const missing = slugs.filter(
    (slug) =>
      !existsSync(join(outDir, `${slug}.jpg`)) ||
      !existsSync(join(outDir, `${slug}-og.jpg`)) ||
      !existsSync(join(outDir, `${slug}-list.jpg`))
  )

  console.log(
    `\nDone: ${ok} posts (${ok * 3} files), ${skipped} skipped, ${failed} failed.`
  )

  if (missing.length > 0) {
    console.error(`Missing thumbs for ${missing.length} slug(s): ${missing.join(", ")}`)
    console.error("Run `npm run blog-thumbs:generate` with network access, or restore public/blog/thumbs from git.")
    process.exit(1)
  }

  if (failed > 0) {
    console.warn("Some regenerations failed; kept existing committed thumbs.")
  }
}

main()
