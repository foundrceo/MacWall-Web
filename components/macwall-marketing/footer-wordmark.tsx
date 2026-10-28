"use client"

import { useSyncExternalStore } from "react"

import HalftoneWordmarkFooter from "@/components/macwall-marketing/halftone-wordmark-footer"
import { FOOTER_FRAME } from "@/components/macwall-marketing/marketing-section"
import { macwall } from "@/lib/macwall-site"

/**
 * Page background, ink and the colour the dots warm toward. The ink is the
 * page ink at about 20%, so the word is barely there until the pointer pushes
 * its dots, which warm to white (PostMesh warms to its lime).
 */
const PALETTE = { background: "#000000", ink: "#2f2f2f", warm: "#ffffff" }

/** Grows with the width, like the word itself (it is fitted to the width). */
const HEIGHT = "clamp(88px, 16vw, 268px)"

/** Phones get a finer dot grid, so the smaller word keeps crisp letters. */
const NARROW = "(max-width: 639px)"
function subscribeNarrow(onChange: () => void) {
  const query = window.matchMedia(NARROW)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

/**
 * The canvas needs a real family name, not a CSS variable: read the one
 * next/font gave Averia Serif Libre (MacWall's display face).
 */
function displayFamily(): string {
  const fromVar = getComputedStyle(document.body)
    .getPropertyValue("--font-averia-serif")
    .trim()
  return fromVar ? `${fromVar}, Georgia, serif` : "Georgia, serif"
}
const noop = () => () => {}

/**
 * The giant halftone "MacWall" across the bottom of the footer, cropped by the
 * page's bottom edge, the same component PostMesh uses. Only the word shows:
 * the footer above has the links (`.landing-wordmark` in globals.css).
 */
export function FooterWordmark() {
  const narrow = useSyncExternalStore(
    subscribeNarrow,
    () => window.matchMedia(NARROW).matches,
    () => false
  )
  const family = useSyncExternalStore(
    noop,
    displayFamily,
    () => "Georgia, serif"
  )

  return (
    <div className={FOOTER_FRAME}>
      <HalftoneWordmarkFooter
        wordmark={macwall.name}
        label=""
        meta=""
        columns={[]}
        backToTop={false}
        palette={PALETTE}
        fontFamily={family}
        fontWeight={400}
        dotGap={narrow ? 4 : 6}
        height={HEIGHT}
        className="landing-wordmark"
      />
    </div>
  )
}
