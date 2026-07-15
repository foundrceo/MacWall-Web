import type { BlogCategory } from "@/lib/content/types"

const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&h=900&q=80`

/** Verified 200 OK Unsplash photos — Mac / desk / dev setups (not wallpaper catalog). */
const TILE_IMAGE_BY_SLUG: Record<string, string> = {
  "how-to-set-live-wallpaper-mac": UNSPLASH("photo-1517336714731-489689fd1ca8"),
  "how-to-use-video-as-wallpaper-mac": UNSPLASH(
    "photo-1498050108023-c5249f4df085"
  ),
  "mp4-wallpaper-mac-guide": UNSPLASH("photo-1555066931-4365d14bab8c"),
  "macbook-animated-wallpaper-guide": UNSPLASH(
    "photo-1496181133206-80ce9b88a853"
  ),
  "import-custom-wallpaper-mac": UNSPLASH("photo-1603302576837-37561b2e2302"),
  "animated-desktop-background-mac-free": UNSPLASH(
    "photo-1618005182384-a83a8bd57fbe"
  ),
  "best-live-wallpaper-app-mac-2026": UNSPLASH(
    "photo-1527864550417-7fd91fc51a46"
  ),
  "wallpaper-engine-alternative-mac":
    "/blog/vs/macwall-vs-wallpaper-engine.png",
  "macwall-vs-backdrop": "/blog/vs/macwall-vs-backdrop.png",
  "dynamic-wallpaper-vs-live-wallpaper-mac": UNSPLASH(
    "photo-1516321318423-f06f85e504b3"
  ),
  "why-macwall-best-native-wallpaper-app": UNSPLASH(
    "photo-1627398242454-45a1465c2479"
  ),
  "lock-screen-live-wallpaper-macos": UNSPLASH("photo-1556656793-08538906a9f8"),
  "live-wallpaper-battery-drain-mac": UNSPLASH("photo-1542838132-92c53300491e"),
  "4k-video-wallpaper-mac": UNSPLASH("photo-1531297484001-80022131f5a1"),
  "multi-monitor-wallpaper-mac": UNSPLASH("photo-1522202176988-66273c2fd55f"),
  "apple-silicon-wallpaper-performance": UNSPLASH(
    "photo-1573164713714-d95e436ab8d6"
  ),
  "menu-bar-wallpaper-controls-mac": UNSPLASH("photo-1551434678-e076c223a692"),
  "macos-sonoma-live-wallpaper": UNSPLASH("photo-1497215842964-222b430dc094"),
  "macos-sequoia-dynamic-wallpaper": UNSPLASH(
    "photo-1504639725590-34d0984388bd"
  ),
  "live-wallpaper-macbook-pro": UNSPLASH("photo-1611224923853-80b023f02d71"),
  "live-wallpaper-macbook-air": UNSPLASH("photo-1434030216411-0b793f4b4173"),
  "anime-live-wallpaper-mac": UNSPLASH("photo-1561070791-2526d30994b5"),
  "nature-live-wallpaper-mac": UNSPLASH("photo-1454165804606-c3d57bc86b40"),
  "space-wallpaper-mac": UNSPLASH("photo-1522071820081-009f0129c71c"),
  "gaming-wallpaper-mac": UNSPLASH("photo-1593305841991-05c297ba4575"),
  /* Generated comparison covers — see scripts/build-blog-vs-images.mjs */
  "macwall-vs-wallper": "/blog/vs/macwall-vs-wallper.png",
  "macwall-vs-wallspace": "/blog/vs/macwall-vs-wallspace.png",
  "macwall-vs-lively-wallpaper": "/blog/vs/macwall-vs-lively-wallpaper.png",
  "macos-27-beta-live-wallpaper-not-working": UNSPLASH(
    "photo-1517430816045-df4b7de11d1d"
  ),
  "macos-27-lock-screen-live-wallpaper": UNSPLASH(
    "photo-1488590528505-98d2b5aba04b"
  ),
  "live-wallpaper-cpu-usage-mac": UNSPLASH("photo-1518770660439-4636190af475"),
  "upload-wallpaper-macwall-community": UNSPLASH(
    "photo-1492724441997-5dc865305da7"
  ),
}

const CATEGORY_FALLBACK: Record<BlogCategory, string> = {
  guides: UNSPLASH("photo-1498050108023-c5249f4df085"),
  comparisons: UNSPLASH("photo-1527864550417-7fd91fc51a46"),
  features: UNSPLASH("photo-1517336714731-489689fd1ca8"),
  wallpapers: UNSPLASH("photo-1618005182384-a83a8bd57fbe"),
  macos: UNSPLASH("photo-1496181133206-80ce9b88a853"),
}

export const BLOG_TILE_FALLBACK_IMAGE = UNSPLASH(
  "photo-1517336714731-489689fd1ca8"
)

export type BlogTileImageVariant = "hero" | "tile" | "list" | "og"

function withCrop(url: string, variant: BlogTileImageVariant): string {
  if (!url.startsWith("http")) return url
  const parsed = new URL(url)
  if (variant === "list") {
    parsed.searchParams.set("w", "240")
    parsed.searchParams.set("h", "240")
    parsed.searchParams.set("fit", "crop")
  } else if (variant === "og") {
    // 1.91:1 per the Open Graph spec so cards never crop or letterbox.
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

export function blogTilePoster(
  slug: string,
  category: BlogCategory,
  variant: BlogTileImageVariant = "tile"
): string {
  const base =
    TILE_IMAGE_BY_SLUG[slug] ??
    CATEGORY_FALLBACK[category] ??
    BLOG_TILE_FALLBACK_IMAGE
  return withCrop(base, variant)
}

export function isRemoteBlogTile(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://")
}
