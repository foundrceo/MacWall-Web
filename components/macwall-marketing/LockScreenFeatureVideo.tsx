"use client"

import { useEffect, useRef, useState } from "react"

const LOCK_SCREEN_VIDEO_SRC = "/Video.webm"

/**
 * Lock Screen feature demo — defers loading the clip until it is near the
 * viewport so it never competes with above-the-fold work, then plays it.
 */
export default function LockScreenFeatureVideo({
  ariaLabel,
}: Readonly<{ ariaLabel: string }>) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduceMotion(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const load = () => {
      if (video.getAttribute("src") === LOCK_SCREEN_VIDEO_SRC) return
      video.src = LOCK_SCREEN_VIDEO_SRC
      video.load()
      if (!reduceMotion) {
        void video.play().catch(() => undefined)
      }
    }

    if (typeof IntersectionObserver === "undefined") {
      load()
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            load()
            observer.disconnect()
            break
          }
        }
      },
      { rootMargin: "200px" }
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [reduceMotion])

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
      <video
        ref={videoRef}
        autoPlay={!reduceMotion}
        muted
        loop={!reduceMotion}
        playsInline
        preload="none"
        className="h-full w-full object-cover"
        aria-label={ariaLabel}
      />
    </div>
  )
}
