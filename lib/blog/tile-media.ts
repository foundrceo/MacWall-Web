import { getAllBlogSlugs } from "@/lib/blog/index"
import type { BlogCategory } from "@/lib/content/types"
import { catalogPublicThumbUrlFromKey } from "@/lib/macwall-catalog-urls"

/**
 * MacWall catalog thumbs — abstract / cosmic / space loops from the live catalog
 * (same visual family as homepage “best” picks: nebula, black hole, portal, texture).
 * One unique wallpaper per blog post — never reused across slugs when pool ≥ post count.
 */
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

function buildSlugToThumbKeyMap(): Readonly<Record<string, string>> {
  const slugs = [...getAllBlogSlugs()].sort()
  const map: Record<string, string> = {}

  slugs.forEach((slug, index) => {
    map[slug] =
      BLOG_ABSTRACT_WALLPAPER_THUMB_KEYS[
        index % BLOG_ABSTRACT_WALLPAPER_THUMB_KEYS.length
      ]!
  })

  return map
}

const SLUG_TO_THUMB_KEY = buildSlugToThumbKeyMap()

const CATEGORY_FALLBACK_KEY = BLOG_ABSTRACT_WALLPAPER_THUMB_KEYS[0]
const DEFAULT_FALLBACK_KEY = BLOG_ABSTRACT_WALLPAPER_THUMB_KEYS[1]

const CATEGORY_FALLBACK: Record<BlogCategory, string> = {
  guides: catalogPublicThumbUrlFromKey(CATEGORY_FALLBACK_KEY),
  comparisons: catalogPublicThumbUrlFromKey(
    BLOG_ABSTRACT_WALLPAPER_THUMB_KEYS[2]!
  ),
  features: catalogPublicThumbUrlFromKey(
    BLOG_ABSTRACT_WALLPAPER_THUMB_KEYS[3]!
  ),
  wallpapers: catalogPublicThumbUrlFromKey(
    BLOG_ABSTRACT_WALLPAPER_THUMB_KEYS[4]!
  ),
  macos: catalogPublicThumbUrlFromKey(BLOG_ABSTRACT_WALLPAPER_THUMB_KEYS[5]!),
}

export const BLOG_TILE_FALLBACK_IMAGE = catalogPublicThumbUrlFromKey(
  DEFAULT_FALLBACK_KEY
)

export type BlogTileImageVariant = "hero" | "tile" | "list" | "og" | "curated"

function isCatalogCdnUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname
    return host === "cdn.macwall.app" || host.endsWith(".supabase.co")
  } catch {
    return false
  }
}

function withCrop(url: string, variant: BlogTileImageVariant): string {
  if (!url.startsWith("http") || isCatalogCdnUrl(url)) return url

  const parsed = new URL(url)
  if (variant === "list") {
    parsed.searchParams.set("w", "240")
    parsed.searchParams.set("h", "240")
    parsed.searchParams.set("fit", "crop")
  } else if (variant === "og") {
    parsed.searchParams.set("w", "1200")
    parsed.searchParams.set("h", "630")
    parsed.searchParams.set("fit", "crop")
  } else if (variant === "hero") {
    parsed.searchParams.set("w", "1600")
    parsed.searchParams.set("h", "1000")
    parsed.searchParams.set("fit", "crop")
  } else {
    parsed.searchParams.set("w", "1200")
    parsed.searchParams.set("h", "800")
    parsed.searchParams.set("fit", "crop")
  }
  parsed.searchParams.set("auto", "format")
  parsed.searchParams.set("q", "80")
  return parsed.toString()
}

function thumbUrlForSlug(slug: string, category: BlogCategory): string {
  const thumbKey = SLUG_TO_THUMB_KEY[slug]
  if (thumbKey) return catalogPublicThumbUrlFromKey(thumbKey)

  const categoryUrl = CATEGORY_FALLBACK[category]
  if (categoryUrl) return categoryUrl

  return BLOG_TILE_FALLBACK_IMAGE
}

export function blogTilePoster(
  slug: string,
  category: BlogCategory,
  variant: BlogTileImageVariant = "tile"
): string {
  return withCrop(thumbUrlForSlug(slug, category), variant)
}

export function isRemoteBlogTile(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://")
}
