"use client"

import { useReducedMotion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  MARKETING_LOCK_SCREEN_VIDEO_MP4,
  MARKETING_LOCK_SCREEN_VIDEO_WEBM,
} from "@/lib/marketing-shell/assets"

function playMutedLoop(video: HTMLVideoElement) {
  video.muted = true
  video.defaultMuted = true
  video.loop = true
  void video.play().catch(() => undefined)
}

function bindGaplessLoop(video: HTMLVideoElement) {
  const LOOP_LEAD_SEC = 0.05

  const handleTimeUpdate = () => {
    const { duration, currentTime } = video
    if (!Number.isFinite(duration) || duration <= 0) return
    if (duration - currentTime <= LOOP_LEAD_SEC) {
      video.currentTime = 0
    }
  }

  const handleEnded = () => {
    video.currentTime = 0
    playMutedLoop(video)
  }

  video.addEventListener("timeupdate", handleTimeUpdate)
  video.addEventListener("ended", handleEnded)

  return () => {
    video.removeEventListener("timeupdate", handleTimeUpdate)
    video.removeEventListener("ended", handleEnded)
  }
}

export default function MacWallMarketingLockScreenVideo({
  ariaLabel,
}: Readonly<{ ariaLabel: string }>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const reduceMotion = useReducedMotion()
  const [inView, setInView] = useState(false)

  const syncPlayback = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (inView && !reduceMotion) {
      playMutedLoop(video)
      return
    }

    video.pause()
  }, [inView, reduceMotion])

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { rootMargin: "120px 0px", threshold: 0.12 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    syncPlayback()
  }, [syncPlayback])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const kickstart = () => syncPlayback()

    video.addEventListener("loadeddata", kickstart)
    video.addEventListener("canplay", kickstart)

    return () => {
      video.removeEventListener("loadeddata", kickstart)
      video.removeEventListener("canplay", kickstart)
    }
  }, [syncPlayback])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    return bindGaplessLoop(video)
  }, [])

  return (
    <div
      ref={containerRef}
      className="MacWallLockScreenVideo aspect-video w-full overflow-hidden rounded-[28px] bg-black"
    >
      <video
        ref={videoRef}
        className="MacWallLockScreenVideoEl h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-label={ariaLabel}
      >
        <source src={MARKETING_LOCK_SCREEN_VIDEO_WEBM} type="video/webm" />
        <source src={MARKETING_LOCK_SCREEN_VIDEO_MP4} type="video/mp4" />
      </video>
    </div>
  )
}
