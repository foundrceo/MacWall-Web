"use client"

import dynamic from "next/dynamic"
import { useSyncExternalStore } from "react"

import type { AuroraRibbonsProps } from "@/components/ui/aurora-ribbons-scene"

export type { AuroraRibbonsProps }

/** three.js and react-three-fiber load only where the ribbons will draw. */
const AuroraRibbonsScene = dynamic(
  () => import("@/components/ui/aurora-ribbons-scene"),
  { ssr: false }
)

/**
 * A mouse or trackpad and no Reduce Motion. On phones and tablets the ribbons
 * would compile close to 1 MB of JS and start the GPU mid-scroll for a
 * decoration, so the card keeps its plain surface there.
 */
const RIBBONS_MEDIA =
  "(pointer: fine) and (prefers-reduced-motion: no-preference)"

function subscribe(onChange: () => void) {
  const query = window.matchMedia(RIBBONS_MEDIA)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

const ribbonsAllowed = () => window.matchMedia(RIBBONS_MEDIA).matches
const ribbonsAllowedOnServer = () => false

/**
 * Silky aurora ribbons drifting in slow sine waves (aurora-ribbons-scene.tsx).
 * Renders nothing on coarse pointers or with Reduce Motion on, and in that
 * case never downloads three.js.
 */
export function AuroraRibbons(props: AuroraRibbonsProps) {
  const allowed = useSyncExternalStore(
    subscribe,
    ribbonsAllowed,
    ribbonsAllowedOnServer
  )
  return allowed ? <AuroraRibbonsScene {...props} /> : null
}

export default AuroraRibbons
