"use client"

import { useEffect, useRef, useState } from "react"
import { HeroVideoControls } from "@/components/macwall-marketing/hero-video-controls"
import {
  HERO_VIDEO_ASPECT_CLASS,
  HERO_WALKTHROUGH_VIDEO_ID,
} from "@/lib/marketing/hero-walkthrough-video.shared"
import {
  marketingWalkthroughPosterUrl,
  marketingWalkthroughVideoMobileSource,
  marketingWalkthroughVideoSources,
} from "@/lib/marketing-assets-urls"
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

/** Large desktops still get 720p by default — saves ~4 MB on first paint. */
const LARGE_DESKTOP_QUERY = "(min-width: 1536px)"

type NetworkInformation = {
  saveData?: boolean
  effectiveType?: string
}

/** Visitor opted out of heavy data, or the connection is too slow to autoplay. */
function prefersLightweightMedia(): boolean {
  const connection = (
    navigator as Navigator & { connection?: NetworkInformation }
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

/**
 * Run after the page's own resources (JS, fonts, images) have loaded and the
 * main thread is idle, so the multi-MB video never competes with them — or
 * with a buyer's checkout request — on a slow connection.
 */
function afterPageLoadIdle(callback: () => void): () => void {
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

export function HeroWalkthroughVideo({
  endCaption = `Live wallpapers on your Mac desktop with ${macwall.name}.`,
  ariaLabel = `${macwall.name} app preview`,
}: Readonly<{
  endCaption?: string
  ariaLabel?: string
}>) {
  const sources = marketingWalkthroughVideoSources()
  const mobileSource = marketingWalkthroughVideoMobileSource()
  const poster = marketingWalkthroughPosterUrl()

  const containerRef = useRef<HTMLDivElement>(null)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [activeSrc, setActiveSrc] = useState<string | null>(null)
  const [needsTapToLoad, setNeedsTapToLoad] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduceMotion(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resolveSrc = () => {
      const largeDesktop = window.matchMedia(LARGE_DESKTOP_QUERY).matches
      if (largeDesktop) {
        return sources[0]?.src ?? mobileSource.src
      }
      return mobileSource.src
    }

    let cancelIdle: (() => void) | null = null
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        // Checked here, not on mount, to avoid a setState during first render.
        if (prefersLightweightMedia()) {
          setNeedsTapToLoad(true)
          return
        }
        cancelIdle = afterPageLoadIdle(() => setActiveSrc(resolveSrc()))
      },
      { rootMargin: "300px 0px" }
    )
    observer.observe(container)
    return () => {
      observer.disconnect()
      cancelIdle?.()
    }
  }, [mobileSource.src, sources])

  const loadOnTap = () => {
    const largeDesktop = window.matchMedia(LARGE_DESKTOP_QUERY).matches
    setNeedsTapToLoad(false)
    setActiveSrc(
      largeDesktop
        ? (sources[0]?.src ?? mobileSource.src)
        : mobileSource.src
    )
  }

  return (
    <div>
      <div
        ref={containerRef}
        className={cn(
          "group relative w-full overflow-hidden bg-black",
          HERO_VIDEO_ASPECT_CLASS
        )}
      >
        <video
          id={HERO_WALKTHROUGH_VIDEO_ID}
          {...(activeSrc ? { src: activeSrc } : {})}
          poster={poster}
          autoPlay={Boolean(activeSrc) && !reduceMotion}
          muted
          playsInline
          preload="none"
          className="absolute inset-0 h-full w-full object-cover"
          aria-label={ariaLabel}
        />

        {needsTapToLoad ? (
          <button
            type="button"
            onClick={loadOnTap}
            aria-label="Play MacWall preview"
            className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-black/20 transition-colors hover:bg-black/30"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-black/65 px-4 py-2 text-[13px] font-medium text-white">
              Play preview
            </span>
          </button>
        ) : null}

        <HeroVideoControls
          fallbackSources={sources.slice(1).map((source) => source.src)}
          endCaption={endCaption}
          canPlay={Boolean(activeSrc)}
        />
      </div>
    </div>
  )
}
