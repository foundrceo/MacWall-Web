/**
 * Shared ISR + Data Cache lifetime for marketing catalog reads. Every admin
 * catalog write purges the tags below on demand, so this window only bounds
 * drift in like/download counts — longer means fewer crawl-driven rebuilds.
 * Route segment `revalidate` exports must repeat it as a literal (21600).
 */
export const MARKETING_CATALOG_REVALIDATE_SECONDS = 6 * 60 * 60

/**
 * `/wallpaper/[category]/[slug]` reads (the wallpaper + "similar"). Thousands
 * of crawled detail pages at ~15 ISR write units each made 6h the project's
 * top ISR-write line; the page only drifts on like counts, and catalog writes
 * still purge `PUBLIC_CATALOG_CACHE_TAG` at once. Must stay the page's literal
 * `revalidate` (604800): `unstable_cache` lowers a page's ISR window to its own.
 */
export const PUBLIC_WALLPAPER_DETAIL_REVALIDATE_SECONDS = 7 * 24 * 60 * 60

/** CDN window for `/api/wallpapers` lists; tag purges don't reach the CDN. */
export const MARKETING_CATALOG_API_CDN_SECONDS = 3600

export const MARKETING_GALLERY_CACHE_TAG = "marketing-gallery-wallpapers"

export const MARKETING_HOME_PICK_CACHE_TAG = "marketing-home-pick-wallpapers"

/** Public `/wallpapers` gallery + detail catalog reads. */
export const PUBLIC_CATALOG_CACHE_TAG = "public-wallpaper-catalog"

/** Max simultaneous gallery video decoders in the browser. */
export const MARKETING_GALLERY_MAX_DECODERS = 6
