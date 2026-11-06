import type { BlogCategory } from "@/lib/content/types"

/**
 * Wallpaper pool `scripts/generate-blog-thumbs.mjs` frames in its MacBook
 * mockups (CDN thumb keys). The reviewed generic community uploads from
 * scripts/generate-og-images.mjs (`GENERIC_WALLPAPER_IDS`) come first: no
 * people, brands, films or games. Keep the two lists in sync.
 */
export const BLOG_ABSTRACT_WALLPAPER_THUMB_KEYS = [
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
] as const

/**
 * - `tile` / `hero` / `curated`: the 1200×800 mockup (`{slug}.jpg`).
 * - `small`: its 640×427 copy for narrow tiles (`{slug}-640.jpg`).
 * - `list`: 480×480 square (`{slug}-list.jpg`).
 * - `og`: 1200×630 share card fallback (`{slug}-og.jpg`).
 * - `16x9` / `4x3` / `1x1`: crops for Article structured data (Google asks
 *   for all three, at least 1200 px wide).
 */
export type BlogTileImageVariant =
  "hero" | "tile" | "small" | "list" | "og" | "curated" | "16x9" | "4x3" | "1x1"

const VARIANT_SUFFIX: Partial<Record<BlogTileImageVariant, string>> = {
  small: "-640",
  list: "-list",
  og: "-og",
  "16x9": "-16x9",
  "4x3": "-4x3",
  "1x1": "-1x1",
}

/** Local Apple-style mockups: generated via `npm run blog-thumbs:generate`. */
function blogThumbPath(slug: string, variant: BlogTileImageVariant): string {
  return `/blog/thumbs/${slug}${VARIANT_SUFFIX[variant] ?? ""}.jpg`
}

export function blogTilePoster(
  slug: string,
  _category: BlogCategory,
  variant: BlogTileImageVariant = "tile"
): string {
  return blogThumbPath(slug, variant)
}

/** 16x9, 4x3 and 1x1 crops of a post's cover, for `BlogPosting.image`. */
export function blogArticleImageCrops(slug: string): string[] {
  return (["16x9", "4x3", "1x1"] as const).map((variant) =>
    blogThumbPath(slug, variant)
  )
}

/** `/blog/thumbs/{slug}.jpg`, `-640.jpg` or `-list.jpg`: the on-page tiles. */
const ON_PAGE_THUMB = /^\/blog\/thumbs\/([a-z0-9-]+?)(-640|-list)?\.jpg$/

function isStructuredDataCrop(slug: string): boolean {
  return /-(?:og|16x9|4x3|1x1)$/.test(slug)
}

/** AVIF sibling of a local tile/list mockup (written by the thumbs script). */
export function blogThumbAvifSrc(src: string): string | null {
  const match = src.match(ON_PAGE_THUMB)
  if (!match || isStructuredDataCrop(match[1])) return null
  return src.replace(/\.jpg$/, ".avif")
}

/**
 * `srcset` candidates for a 1200-wide mockup: its 640 copy and itself, as
 * JPEG and AVIF. Null for anything else (list squares, remote images).
 */
export function blogThumbSrcSets(
  src: string
): { jpeg: string; avif: string } | null {
  const match = src.match(ON_PAGE_THUMB)
  if (!match || match[2] || isStructuredDataCrop(match[1])) return null
  const base = `/blog/thumbs/${match[1]}`
  return {
    jpeg: `${base}-640.jpg 640w, ${base}.jpg 1200w`,
    avif: `${base}-640.avif 640w, ${base}.avif 1200w`,
  }
}

export function isRemoteBlogTile(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://")
}

export const BLOG_TILE_FALLBACK_IMAGE =
  "/blog/thumbs/what-is-macwall-complete-guide.jpg"
