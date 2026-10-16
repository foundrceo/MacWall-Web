/**
 * Shared ISR + Data Cache lifetime for marketing catalog reads. Every admin
 * catalog write purges the tags below on demand, so this window only bounds
 * drift in like/download counts — longer means fewer crawl-driven rebuilds.
 * Route segment `revalidate` exports must repeat it as a literal (21600).
 */
export const MARKETING_CATALOG_REVALIDATE_SECONDS = 6 * 60 * 60

/** CDN window for `/api/wallpapers` lists; tag purges don't reach the CDN. */
export const MARKETING_CATALOG_API_CDN_SECONDS = 3600

export const MARKETING_GALLERY_CACHE_TAG = "marketing-gallery-wallpapers"

export const MARKETING_HOME_PICK_CACHE_TAG = "marketing-home-pick-wallpapers"

/** Public `/wallpapers` gallery + detail catalog reads. */
export const PUBLIC_CATALOG_CACHE_TAG = "public-wallpaper-catalog"

/** Max simultaneous gallery video decoders in the browser. */
export const MARKETING_GALLERY_MAX_DECODERS = 6
