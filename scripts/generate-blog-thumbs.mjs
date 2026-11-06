#!/usr/bin/env node
/**
 * Generates Apple-style MacBook mockup thumbnails for every blog post.
 * Output in public/blog/thumbs/, from the 1200×800 mockup {slug}.jpg:
 * - {slug}-640.jpg (640×427) for narrow tiles (`srcset`)
 * - {slug}-list.jpg (480×480) and {slug}-og.jpg (1200×630)
 * - {slug}-16x9.jpg (1422×800), -4x3.jpg (1200×900) and -1x1.jpg (1200×1200)
 *   for Article structured data: the mockup on a wider or taller canvas of
 *   the same background, so nothing is cropped or upscaled
 * - AVIF siblings of the on-page images ({slug}, -640, -list)
 *
 * Only the mockup needs the network (the wallpaper comes from the CDN); every
 * other file is derived from it, so missing ones are filled in offline.
 *
 * Usage: npm run blog-thumbs:generate [-- --force]
 */
import { readdirSync, readFileSync, mkdirSync, existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")
const outDir = join(root, "public/blog/thumbs")

const CDN = (
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL?.trim() ||
  "https://cdn.macwall.app"
).replace(/\/$/, "")

const W = 1200
const H = 800

/**
 * Same pool as `BLOG_ABSTRACT_WALLPAPER_THUMB_KEYS` in lib/blog/tile-media.ts:
 * keep in sync. The reviewed generic uploads (`GENERIC_WALLPAPER_IDS` in
 * scripts/generate-og-images.mjs) come first.
 */
const THUMB_KEYS = [
  "thumbs/b8b6c772-df82-4cca-bf5e-bbfd557b17d0.jpg", // Zen Bamboo Forest Path
  "thumbs/61b61ea1-f67d-4c17-9dc0-b80db1b65256.jpg", // Rainy Petal Road
  "thumbs/d6b3be93-9476-4077-be83-7bc97477e74f.jpg", // Dark Mountain Citadel
  "thumbs/914f49ea-7e0d-4f4c-8503-4b5b21aadae5.jpg", // Night City Highway
  "thumbs/7babae5a-ba0a-4af1-8dce-2426e122b214.jpg", // Cliffside Coastline
  "thumbs/891090f5-3f25-4be7-9b86-48438207dbdc.jpg", // Astronaut in Thunder Cloud
  "thumbs/c48f0449-8f63-40df-b44a-fe926d991dda.jpg", // Mountain Star
  "thumbs/9ceaaf80-257f-4130-a784-a9b50d939bd1.jpg", // Space Window Ambience
  "thumbs/9037f48f-0f1a-4eca-b62a-724ddeb4a190.jpg", // Blue Mountain Lake Stag
  "thumbs/emerald-nebula-swirl.jpg",
  "thumbs/ringed-black-hole.jpg",
  "thumbs/black-hole-eclipse.jpg",
  "thumbs/fiery-ocean-portal.jpg",
  "thumbs/purple-black-hole.jpg",
  "thumbs/milky-way-galaxy.jpg",
  "thumbs/earth-in-shadow.jpg",
  "thumbs/orbital-station-above-earth.jpg",
  "thumbs/crimson-moonlit-sky.jpg",
  "thumbs/purple-moonlit-clouds.jpg",
  "thumbs/wallpaper-black-liquid-texture.jpg",
]

/**
 * Slug → thumb key, so a post's cover never changes when posts are added or
 * removed (the fallback picks by position in the sorted slug list). New
 * posts take a reviewed generic upload.
 */
const SLUG_THUMB_OVERRIDES = {
  "macwall-vs-wallspace": "thumbs/ringed-black-hole.jpg",
  "macwall-vs-backdrop": "thumbs/black-hole-eclipse.jpg",
  "live-wallpaper-cpu-usage-mac": "thumbs/wallpaper-black-liquid-texture.jpg",
  "macos-27-lock-screen-live-wallpaper": "thumbs/purple-moonlit-clouds.jpg",
  "what-is-macwall-complete-guide": "thumbs/astronaut-at-black-hole.jpg",
  "how-to-change-lock-screen-on-mac":
    "thumbs/d6b3be93-9476-4077-be83-7bc97477e74f.jpg",
  "macos-wallpapers": "thumbs/c48f0449-8f63-40df-b44a-fe926d991dda.jpg",
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
    .composite([
      { input: roundedMask(screenW, screenH, screenR), blend: "dest-in" },
    ])
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

const BACKGROUND = { r: 5, g: 5, b: 5 }

/** Structured-data crops: the mockup centred on a canvas of this shape. */
const CANVAS_CROPS = [
  { suffix: "-16x9", width: 1422, height: 800 },
  { suffix: "-4x3", width: 1200, height: 900 },
  { suffix: "-1x1", width: 1200, height: 1200 },
]

/** Every file derived from the mockup, with how to write it. */
function derivedOutputs(slug) {
  const main = join(outDir, `${slug}.jpg`)
  const jpeg = (pipeline) => pipeline.jpeg({ quality: 88, mozjpeg: true })
  return [
    {
      file: `${slug}-og.jpg`,
      write: (out) =>
        jpeg(
          sharp(main).resize(1200, 630, { fit: "cover", position: "centre" })
        ).toFile(out),
    },
    {
      file: `${slug}-list.jpg`,
      write: (out) =>
        jpeg(
          sharp(main).resize(480, 480, { fit: "cover", position: "centre" })
        ).toFile(out),
    },
    {
      file: `${slug}-640.jpg`,
      write: (out) => jpeg(sharp(main).resize(640)).toFile(out),
    },
    ...CANVAS_CROPS.map(({ suffix, width, height }) => ({
      file: `${slug}${suffix}.jpg`,
      write: (out) => {
        const x = Math.floor((width - W) / 2)
        const y = Math.floor((height - H) / 2)
        return jpeg(
          sharp(main).extend({
            top: y,
            bottom: height - H - y,
            left: x,
            right: width - W - x,
            background: BACKGROUND,
          })
        ).toFile(out)
      },
    })),
    // AVIF siblings of the on-page tiles (~75% smaller than the JPEGs),
    // served via <picture><source type="image/avif"> with the JPEG fallback.
    // After the JPEGs above, which they are encoded from.
    ...["", "-640", "-list"].map((suffix) => ({
      file: `${slug}${suffix}.avif`,
      write: (out) =>
        sharp(join(outDir, `${slug}${suffix}.jpg`))
          .avif({ quality: 55, effort: 6 })
          .toFile(out),
    })),
  ]
}

/** Writes the derived files that are missing (or all of them with `force`). */
async function writeDerivedVariants(slug, { force = false } = {}) {
  let written = 0
  for (const output of derivedOutputs(slug)) {
    const out = join(outDir, output.file)
    if (!force && existsSync(out)) continue
    await output.write(out)
    written++
  }
  return written
}

function expectedFiles(slug) {
  return [`${slug}.jpg`, ...derivedOutputs(slug).map((output) => output.file)]
}

async function main() {
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  const force = process.argv.includes("--force")
  const slugs = collectSlugs()
  console.log(
    `Generating ${slugs.length} blog mockups and their variants → public/blog/thumbs/`
  )

  let generated = 0
  let derived = 0
  let failed = 0

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i]
    const out = join(outDir, `${slug}.jpg`)

    try {
      process.stdout.write(`  ${slug} … `)
      const regenerate = force || !existsSync(out)
      if (regenerate) {
        await generateThumb(thumbUrl(thumbKeyForSlug(slug, i)), out)
        generated++
      }
      const written = await writeDerivedVariants(slug, { force: regenerate })
      derived += written
      console.log(
        regenerate
          ? "ok"
          : written > 0
            ? `${written} variant(s) added`
            : "skip (exists)"
      )
    } catch (err) {
      console.log(`FAIL (${err.message})`)
      failed++
    }
  }

  const missing = slugs.filter((slug) =>
    expectedFiles(slug).some((file) => !existsSync(join(outDir, file)))
  )

  console.log(
    `\nDone: ${generated} mockup(s) generated, ${derived} variant file(s) written, ${failed} failed.`
  )

  if (missing.length > 0) {
    console.error(
      `Missing thumbs for ${missing.length} slug(s): ${missing.join(", ")}`
    )
    console.error(
      "Run `npm run blog-thumbs:generate` with network access, or restore public/blog/thumbs from git."
    )
    process.exit(1)
  }

  if (failed > 0) {
    console.warn("Some regenerations failed; kept existing committed thumbs.")
  }
}

main()
