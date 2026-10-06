"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

/**
 * A muted looping clip that loads only when it nears the viewport and pauses
 * when it leaves. Never autoplays for reduced motion.
 */
export function DeferredVideo({
  src,
  poster,
  label,
  className,
}: Readonly<{ src: string; poster?: string; label: string; className?: string }>) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting) {
          if (!video.getAttribute("src")) video.src = src
          if (!reduce.matches) void video.play().catch(() => undefined)
        } else {
          video.pause()
        }
      },
      { rootMargin: "200px" }
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [src])

  return (
    <video
      ref={ref}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
    />
  )
}
