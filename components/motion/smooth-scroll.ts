import Lenis from "lenis"

import "lenis/dist/lenis.css"

/**
 * Lenis smooth scrolling for wheel and trackpad, with its stylesheet, in one
 * lazy chunk. PageMotion imports this only for a fine pointer, so phones and
 * tablets keep native touch scrolling and never download either file.
 *
 * Lenis runs its own rAF loop, so it doesn't touch GSAP's ticker or lag
 * smoothing. Returns the teardown.
 */
export function startSmoothScroll(): () => void {
  const lenis = new Lenis({ anchors: true, autoRaf: true })
  return () => lenis.destroy()
}
