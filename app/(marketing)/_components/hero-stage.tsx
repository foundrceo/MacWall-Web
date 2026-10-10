"use client"

import { useEffect, useRef, useState } from "react"

import { HERO_VIDEO_ASPECT_CLASS } from "@/lib/marketing/hero-walkthrough-video.shared"
import {
  MARKETING_HERO_VIDEO_MP4_720_PATH,
  MARKETING_HERO_VIDEO_MP4_MOBILE_PATH,
  MARKETING_HERO_VIDEO_MP4_PATH,
  MARKETING_HERO_VIDEO_POSTER_PATH,
  MARKETING_HERO_VIDEO_POSTER_SMALL_PATH,
} from "@/lib/marketing-assets-urls"
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

/**
 * The app video in the hero frame. Swap these to change what plays. The
 * frame is up to 1024px wide, so wide screens get the 1080p encode (720p
 * looks soft there on Retina) and everything else the 720p one.
 */
const HERO_VIDEO = {
  src: MARKETING_HERO_VIDEO_MP4_PATH,
  smallSrc: MARKETING_HERO_VIDEO_MP4_720_PATH,
  mobileSrc: MARKETING_HERO_VIDEO_MP4_MOBILE_PATH,
  poster: MARKETING_HERO_VIDEO_POSTER_PATH,
  smallPoster: MARKETING_HERO_VIDEO_POSTER_SMALL_PATH,
  aspectClass: HERO_VIDEO_ASPECT_CLASS,
} as const

/** Plays a touch slower than recorded, so the demo reads calmly. */
const PLAYBACK_RATE = 0.6

/** Wide enough for the frame to outgrow 720p. */
const WIDE_SCREEN_QUERY = "(min-width: 1024px)"

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

/** A Mac-style display frame playing the app video. */
export function HeroStage() {
  const stageRef = useRef<HTMLDivElement>(null)
  /** The video waits until the page itself has loaded. */
  const [allowVideo, setAllowVideo] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [inView, setInView] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [videoSrc, setVideoSrc] = useState<string>(HERO_VIDEO.mobileSrc)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduceMotion(mq.matches)
    update()
    mq.addEventListener("change", update)

    let idleId: number | null = null
    const onLoad = () => {
      const run = () => {
        // Chosen once, before the video mounts, so it never swaps mid-play.
        if (window.matchMedia(WIDE_SCREEN_QUERY).matches) {
          setVideoSrc(HERO_VIDEO.src)
        } else if (window.matchMedia("(min-width: 768px)").matches) {
          setVideoSrc(HERO_VIDEO.smallSrc)
        }
        setAllowVideo(!prefersLightweightMedia())
      }
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

  const showVideo = allowVideo && !reduceMotion && inView

  return (
    <div ref={stageRef} className="relative mx-auto w-full max-w-5xl">
      {/* Ambient light: the video's own colors spill onto the page. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- blurred glow source */}
      <img
        src={HERO_VIDEO.poster}
        srcSet={`${HERO_VIDEO.smallPoster} 640w, ${HERO_VIDEO.poster} 1108w`}
        sizes="(min-width: 1024px) 1024px, calc(100vw - 48px)"
        alt=""
        fetchPriority="high"
        aria-hidden
        className="pointer-events-none absolute inset-x-[6%] top-[8%] -z-10 h-[84%] w-[88%] scale-110 object-cover opacity-45 blur-[72px] saturate-150"
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
            alt=""
            fetchPriority="high"
            className="absolute inset-0 size-full object-cover"
          />
          {showVideo ? (
            <video
              src={videoSrc}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
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
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
