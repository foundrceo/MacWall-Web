/**
 * After a Mac visitor starts the installer download, the site opens a short
 * "install in three steps" guide. Most downloaders never open the app, so the
 * moment between the click and the DMG landing is where they are lost.
 */
export const INSTALL_GUIDE_EVENT = "macwall:download-started"

/** True on a real Mac; iPads also report "Macintosh" but have touch. */
function isMacDesktop(): boolean {
  if (typeof navigator === "undefined") return false
  return /Macintosh|Mac OS X/.test(navigator.userAgent) && navigator.maxTouchPoints <= 1
}

/** Opens the install guide, on a Mac only (other devices can't open a DMG). */
export function announceDownloadStarted(): void {
  if (!isMacDesktop()) return
  window.dispatchEvent(new Event(INSTALL_GUIDE_EVENT))
}
