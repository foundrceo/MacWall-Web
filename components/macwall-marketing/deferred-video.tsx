"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

/**
 * A muted looping clip that plays while it is near the viewport and pauses
 * when it leaves. Never plays for reduced motion.
 *
 * A labelled clip is page content: its `src` is in the server HTML (crawlers
 * see the video) with `preload="none"`, so no video bytes load until it
 * plays. A decorative clip (empty `label`, e.g. a catalog loop behind the
 * footer) is not something a page should be indexed for, so it gets its
 * `src` only once it nears the viewport.
 *
 * The poster is a lazy `<img>` under the video rather than the `poster`
 * attribute, which browsers fetch at once whatever `preload` says, and so
 * competes with the page's LCP image.
 */
export function DeferredVideo({
  src,
  poster,
  label,
  className,
}: Readonly<{
  src: string
  poster?: string
  label: string
  className?: string
}>) {
  const ref = useRef<HTMLVideoElement>(null)
  const decorative = !label

  useEffect(() => {
    const video = ref.current
    if (!video) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting) {
          if (reduce.matches) return
          if (!video.getAttribute("src")) video.src = src
          void video.play().catch(() => undefined)
        } else if (!video.paused) {
          video.pause()
        }
      },
      { rootMargin: "200px" }
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [src])

  return (
    <>
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element -- poster under the video, lazy
        <img
          src={poster}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className={cn(
            "absolute inset-0 h-full w-full object-cover",
            className
          )}
        />
      ) : null}
      {/* No poster attribute: until its first frame the video is transparent
          and the image beneath shows through. */}
      <video
        ref={ref}
        src={decorative ? undefined : src}
        muted
        loop
        playsInline
        preload="none"
        aria-label={decorative ? undefined : label}
        aria-hidden={decorative || undefined}
        className={cn("absolute inset-0 h-full w-full object-cover", className)}
      />
    </>
  )
}
