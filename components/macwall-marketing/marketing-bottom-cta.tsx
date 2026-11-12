"use client"

import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { useEffect, useState, useSyncExternalStore } from "react"

import { TrackedDownloadButton } from "@/components/analytics/tracked-marketing-buttons"
import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import { SendToMacButton } from "@/components/macwall-marketing/send-to-mac-dialog"
import {
  ProModal,
  preloadProModal,
} from "@/components/macwall-marketing/pro-modal-lazy"
import { trackSiteEventAfterPaint } from "@/lib/analytics/client"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import {
  macwallInstallerLatestPath,
  macwallMinimumMacOSVersionLabel,
} from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

function AppleIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={cn("size-3.5 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

/**
 * The three.js half of the ribbons (about 1 MB with react-three-fiber).
 * One chunk, imported directly: a gate component in front of it used to
 * add a second download that could only start after the first finished.
 */
const loadRibbonsScene = () => import("@/components/ui/aurora-ribbons-scene")
const AuroraRibbonsScene = dynamic(loadRibbonsScene, { ssr: false })

/**
 * A laptop or desktop sized window with a mouse or trackpad, and no Reduce
 * Motion. On phones and tablets the ribbons would compile close to 1 MB of
 * JS and start the GPU mid-scroll for a decoration.
 */
const AURORA_MEDIA =
  "(pointer: fine) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)"

/**
 * Templates where the CTA sits under long content people scroll through on
 * any device (1,000+ wallpaper pages, every post): no WebGL there.
 */
const AURORA_SKIPPED_PREFIXES = ["/wallpaper/", "/blog/"] as const

function subscribeAuroraMedia(onChange: () => void) {
  const query = window.matchMedia(AURORA_MEDIA)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

/** Big screen, fine pointer and at least 8 cores: the GPU work is cheap there. */
function auroraCapable(): boolean {
  return (
    window.matchMedia(AURORA_MEDIA).matches &&
    (navigator.hardwareConcurrency ?? 0) >= 8
  )
}

const auroraCapableOnServer = () => false

/** Run after the page has loaded and the main thread is idle. */
function afterLoadIdle(run: () => void): () => void {
  let idleId: number | null = null
  let timeoutId: number | null = null
  const schedule = () => {
    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(run, { timeout: 3000 })
    } else {
      timeoutId = globalThis.setTimeout(run, 1500) as unknown as number
    }
  }
  if (document.readyState === "complete") schedule()
  else window.addEventListener("load", schedule, { once: true })
  return () => {
    window.removeEventListener("load", schedule)
    if (idleId !== null) window.cancelIdleCallback(idleId)
    if (timeoutId !== null) globalThis.clearTimeout(timeoutId)
  }
}

/**
 * Aurora ribbons behind the CTA, on capable desktops off the wallpaper and
 * blog templates only. Loading used to start only as the card came near, then
 * ran gate chunk -> three.js chunk -> canvas -> shader compile one after
 * another, so people reached a bare card and the ribbons popped in late.
 * Now, once the page is idle after load, three.js loads and the canvas
 * mounts and draws its first frame off screen (it only animates while on
 * screen, see SceneContainer), and it fades in on that first frame. By the
 * time anyone scrolls down, the ribbons are already there. Everyone else
 * sees the plain card.
 */
function CtaRibbons() {
  const pathname = usePathname()
  const capable = useSyncExternalStore(
    subscribeAuroraMedia,
    auroraCapable,
    auroraCapableOnServer
  )
  const allowedHere = !AURORA_SKIPPED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )
  const enabled = capable && allowedHere
  const [loaded, setLoaded] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    const cancelIdle = afterLoadIdle(() => {
      loadRibbonsScene().then(
        () => {
          if (!cancelled) setLoaded(true)
        },
        // Chunk failed (offline, deploy swap): keep the plain card.
        () => {}
      )
    })
    return () => {
      cancelled = true
      cancelIdle()
    }
  }, [enabled])

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
    >
      {loaded && enabled ? (
        // Tilted across the card, and long enough that the faded ends sit
        // outside it, so the band runs edge to edge. The dimming and fade sit
        // on this inner layer: the page's scroll reveal sets the wrapper to
        // opacity 1.
        <AuroraRibbonsScene
          className={cn(
            "h-full w-full transition-opacity duration-1000 ease-out",
            ready ? "opacity-70" : "opacity-0"
          )}
          tilt={0.32}
          length={30}
          onReady={() => setReady(true)}
        />
      ) : null}
    </div>
  )
}

const heroOutlineCapsule =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border-0 bg-surface-2 px-5 text-sm font-medium text-ink no-underline shadow-none transition-colors hover:bg-surface-3"

const heroFilledCapsule =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-black no-underline shadow-none transition-opacity hover:opacity-90"

export default function MacWallMarketingBottomCta() {
  const [proOpen, setProOpen] = useState(false)
  const copy = macwallMarketingCopy.underFooter

  return (
    <MarketingSection className="pt-20 pb-20 lg:pt-[110px] lg:pb-[110px]">
      {/* One rounded card, as on PostMesh's closing band (458px tall from sm up). */}
      <div className="relative isolate mx-auto flex w-full max-w-[1200px] flex-col items-center justify-center overflow-hidden rounded-[32px] bg-surface-1 px-5 py-14 text-center squircle sm:min-h-[458px] sm:px-10 sm:py-16 lg:rounded-[40px] lg:px-16 lg:py-[72px]">
        <CtaRibbons />
        <h2 className="mx-auto max-w-2xl font-display text-[40px] leading-[48px] font-normal tracking-tight text-balance sm:text-[56px] sm:leading-[64px]">
          {copy.title}
        </h2>
        <p className="mt-4 text-[15px] leading-[22px] text-pretty text-ink-2">
          {copy.lead}
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          {/* Macs get the .dmg; phones, Windows and Linux get "Send to my
              Mac" (data-platform, set before paint). Only one shows. */}
          <span className="mw-when-mac">
            <TrackedDownloadButton
              href={macwallInstallerLatestPath}
              size="pill"
              location="bottom_cta"
              className={heroFilledCapsule}
            >
              <AppleIcon />
              Download for Mac
            </TrackedDownloadButton>
          </span>
          <span className="mw-when-not-mac">
            <SendToMacButton
              location="bottom_cta"
              className={heroFilledCapsule}
            />
          </span>
          <button
            type="button"
            onClick={() => {
              setProOpen(true)
              trackSiteEventAfterPaint("pricing_click", {
                location: "bottom_cta",
              })
            }}
            className={heroOutlineCapsule}
            aria-haspopup="dialog"
            onPointerEnter={preloadProModal}
            onFocus={preloadProModal}
          >
            Get License
          </button>
        </div>
        <p className="mt-4 text-[13px] leading-5 text-ink-3">
          {macwallMinimumMacOSVersionLabel}
        </p>
      </div>
      <ProModal open={proOpen} onOpenChange={setProOpen} />
    </MarketingSection>
  )
}
