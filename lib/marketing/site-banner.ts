/**
 * State of the strip above the marketing navbar (sale or announcement
 * banner), kept as attributes on <html> so CSS (app/globals.css) can lay out
 * the banner and the navbar before React hydrates.
 *
 * - `data-site-banner="dismissed"`: closed this browser session
 *   (sessionStorage), so no strip and no space for it.
 * - `data-site-banner-away`: the page has scrolled, so below 1024px the strip
 *   slides away and the navbar moves up into its place.
 */
export const SITE_BANNER_ATTRIBUTE = "data-site-banner"
export const SITE_BANNER_DISMISSED = "dismissed"
export const SITE_BANNER_AWAY_ATTRIBUTE = "data-site-banner-away"
export const SITE_BANNER_STORAGE_KEY = "mw:site-banner-dismissed"

/**
 * Inline script for the top of <body>: restores a dismissal before first
 * paint, so a closed banner never flashes in and pushes the page down.
 */
export const SITE_BANNER_RESTORE_SCRIPT = `(function(){try{if(sessionStorage.getItem(${JSON.stringify(SITE_BANNER_STORAGE_KEY)}))document.documentElement.setAttribute(${JSON.stringify(SITE_BANNER_ATTRIBUTE)},${JSON.stringify(SITE_BANNER_DISMISSED)})}catch(e){}})()`

export function isSiteBannerDismissed(): boolean {
  try {
    return window.sessionStorage.getItem(SITE_BANNER_STORAGE_KEY) !== null
  } catch {
    return false
  }
}

/** Hides the banner now and for the rest of this browser session. */
export function dismissSiteBanner() {
  document.documentElement.setAttribute(
    SITE_BANNER_ATTRIBUTE,
    SITE_BANNER_DISMISSED
  )
  try {
    window.sessionStorage.setItem(SITE_BANNER_STORAGE_KEY, "1")
  } catch {
    // Private mode or storage blocked: it stays closed until the next load.
  }
}
