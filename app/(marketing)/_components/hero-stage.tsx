"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"

import { HERO_VIDEO_ASPECT_CLASS } from "@/lib/marketing/hero-walkthrough-video.shared"
import {
  MARKETING_HERO_VIDEO_MP4_720_PATH,
  MARKETING_HERO_VIDEO_MP4_MOBILE_PATH,
  MARKETING_HERO_VIDEO_MP4_PATH,
  MARKETING_HERO_VIDEO_POSTER_PATH,
  MARKETING_HERO_VIDEO_POSTER_SMALL_PATH,
} from "@/lib/marketing-assets-urls"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

/**
 * The app video in the hero frame. Swap these to change what plays. The
 * frame is up to 1024px wide, so wide screens get the 1080p encode (720p
 * looks soft there on Retina), tablets the 720p one and phones the mobile one.
 */
const HERO_VIDEO = {
  src: MARKETING_HERO_VIDEO_MP4_PATH,
  smallSrc: MARKETING_HERO_VIDEO_MP4_720_PATH,
  mobileSrc: MARKETING_HERO_VIDEO_MP4_MOBILE_PATH,
  poster: MARKETING_HERO_VIDEO_POSTER_PATH,
  smallPoster: MARKETING_HERO_VIDEO_POSTER_SMALL_PATH,
  aspectClass: HERO_VIDEO_ASPECT_CLASS,
} as const

/**
 * Ambient light behind the frame in the poster's own colours (the lime car,
 * the warm wall, the blue-grey road). Gradients are never LCP candidates and
 * need no filter, unlike the blurred poster copy this replaces.
 */
const GLOW_STYLE: CSSProperties = {
  background: [
    "radial-gradient(ellipse 34% 30% at 40% 46%, rgba(150, 190, 40, 0.34), transparent 72%)",
    "radial-gradient(ellipse 42% 26% at 70% 48%, rgba(120, 108, 76, 0.3), transparent 72%)",
    "radial-gradient(ellipse 62% 34% at 50% 78%, rgba(48, 64, 86, 0.5), transparent 74%)",
    "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255, 255, 255, 0.05), transparent 70%)",
  ].join(", "),
}

/** Plays a touch slower than recorded, so the demo reads calmly. */
const PLAYBACK_RATE = 0.6

type NetworkInformation = { saveData?: boolean; effectiveType?: string }

function prefersLightweightMedia(): boolean {
  const connection = (
    navigator as Navigator & { connection?: NetworkInformation }
  ).connection
  if (!connection) return false
  return (
    Boolean(connection.saveData) ||
    /(^|-)2g$|^3g$/.test(connection.effectiveType ?? "")
  )
}

/**
 * A Mac-style display frame playing the app video. The `<video>` and its
 * sources are in the server HTML with `preload="none"`, so crawlers see the
 * demo while no video bytes load until it plays: after the page has loaded,
 * while the frame is on screen, and never for reduced motion or Save-Data.
 */
export function HeroStage() {
  const stageRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  /** The video waits until the page itself has loaded. */
  const [allowVideo, setAllowVideo] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [inView, setInView] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduceMotion(mq.matches)
    update()
    mq.addEventListener("change", update)

    let idleId: number | null = null
    const onLoad = () => {
      const run = () => setAllowVideo(!prefersLightweightMedia())
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(run, { timeout: 1500 })
      } else {
        idleId = window.setTimeout(run, 200)
      }
    }
    if (document.readyState === "complete") onLoad()
    else window.addEventListener("load", onLoad, { once: true })

    return () => {
      mq.removeEventListener("change", update)
      window.removeEventListener("load", onLoad)
      if (idleId !== null) {
        if (typeof window.cancelIdleCallback === "function") {
          window.cancelIdleCallback(idleId)
        } else {
          window.clearTimeout(idleId)
        }
      }
    }
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.15 }
    )
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  const shouldPlay = allowVideo && !reduceMotion && inView

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (shouldPlay) {
      // The first play() picks the <source> for this screen and loads it.
      void video.play().catch(() => undefined)
    } else if (!video.paused) {
      video.pause()
    }
  }, [shouldPlay])

  return (
    <div ref={stageRef} className="relative mx-auto w-full max-w-5xl">
      {/* Ambient light: the video's own colors spill onto the page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[6%] top-[8%] -z-10 h-[84%] w-[88%] scale-110"
        style={GLOW_STYLE}
      />

      <div className="rounded-[20px] bg-linear-to-b from-white/[0.16] to-white/[0.04] p-1.5 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/10 sm:p-2">
        <div
          className={cn(
            "relative overflow-hidden rounded-[14px] bg-black",
            HERO_VIDEO.aspectClass
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- poster, already sized */}
          <img
            src={HERO_VIDEO.poster}
            srcSet={`${HERO_VIDEO.smallPoster} 640w, ${HERO_VIDEO.poster} 1108w`}
            sizes="(min-width: 1024px) 1024px, calc(100vw - 48px)"
            width={1108}
            height={720}
            alt={macwallMarketingCopy.interact.heroPosterAlt}
            fetchPriority="high"
            className="absolute inset-0 size-full object-cover"
          />
          {/* Sources are chosen once, when playback starts, so the clip never
              swaps mid-play. */}
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="none"
            onLoadedMetadata={(event) => {
              event.currentTarget.defaultPlaybackRate = PLAYBACK_RATE
              event.currentTarget.playbackRate = PLAYBACK_RATE
            }}
            onPlaying={() => setPlaying(true)}
            className={cn(
              "absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-700",
              playing && "opacity-100"
            )}
            aria-label={`${macwall.name} app preview`}
          >
            <source
              src={HERO_VIDEO.src}
              type="video/mp4"
              media="(min-width: 1024px)"
            />
            <source
              src={HERO_VIDEO.smallSrc}
              type="video/mp4"
              media="(min-width: 768px)"
            />
            <source src={HERO_VIDEO.mobileSrc} type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  )
}
