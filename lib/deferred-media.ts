/**
 * Client-only checks for when a page may load video on its own: after the
 * page's own resources, when the main thread is idle, and never for visitors
 * who asked for less data or less motion (they get tap-to-play instead).
 */

type NetworkInformationLike = {
  saveData?: boolean
  effectiveType?: string
}

/** Save-Data is on, or the connection is 2G/3G: don't start video unasked. */
export function prefersLightweightMedia(): boolean {
  if (typeof navigator === "undefined") return false
  const connection = (
    navigator as Navigator & { connection?: NetworkInformationLike }
  ).connection
  if (!connection) return false
  if (connection.saveData) return true
  const effectiveType = connection.effectiveType ?? ""
  return (
    effectiveType === "slow-2g" ||
    effectiveType === "2g" ||
    effectiveType === "3g"
  )
}

/** The visitor's OS asks for reduced motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * Run `callback` once the window `load` event has fired and the main thread
 * is idle, so a video never competes with the LCP image, fonts or JS.
 * Returns a cancel function.
 */
export function afterPageLoadIdle(callback: () => void): () => void {
  let cancelled = false
  let idleId: number | null = null
  let timeoutId: number | null = null

  const schedule = () => {
    if (cancelled) return
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(() => callback(), { timeout: 1500 })
    } else {
      timeoutId = window.setTimeout(callback, 200)
    }
  }

  if (document.readyState === "complete") {
    schedule()
  } else {
    window.addEventListener("load", schedule, { once: true })
  }

  return () => {
    cancelled = true
    window.removeEventListener("load", schedule)
    if (idleId !== null) window.cancelIdleCallback(idleId)
    if (timeoutId !== null) window.clearTimeout(timeoutId)
  }
}
