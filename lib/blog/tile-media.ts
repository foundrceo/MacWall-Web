import type { BlogCategory } from "@/lib/content/types"

/** Wallpaper pool used by `scripts/generate-blog-thumbs.mjs`. */
export const BLOG_ABSTRACT_WALLPAPER_THUMB_KEYS = [
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
] as const

export type BlogTileImageVariant = "hero" | "tile" | "list" | "og" | "curated"

/** Local Apple-style mockups — generated via `npm run blog-thumbs:generate`. */
function blogThumbPath(slug: string, variant: BlogTileImageVariant): string {
  if (variant === "og") return `/blog/thumbs/${slug}-og.jpg`
  if (variant === "list") return `/blog/thumbs/${slug}-list.jpg`
  return `/blog/thumbs/${slug}.jpg`
}

export function blogTilePoster(
  slug: string,
  _category: BlogCategory,
  variant: BlogTileImageVariant = "tile"
): string {
  return blogThumbPath(slug, variant)
}

export function isRemoteBlogTile(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://")
}

export const BLOG_TILE_FALLBACK_IMAGE = "/blog/thumbs/what-is-macwall-complete-guide.jpg"
