"use client"

import { useReducedMotion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"

const POSTER_CACHE_KEY = "macwall-walkthrough-frame-v1"

function playMutedLoop(video: HTMLVideoElement) {
  video.muted = true
  video.defaultMuted = true
  video.loop = true
  void video.play().catch(() => undefined)
}

function pauseAtFirstFrame(video: HTMLVideoElement) {
  try {
    if (video.currentTime > 0.05) {
      video.currentTime = 0
    }
  } catch {
    // ignore seek errors before metadata is ready
  }
  video.pause()
}

function readCachedFrame(src: string): string | null {
  try {
    const raw = sessionStorage.getItem(POSTER_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { src?: string; dataUrl?: string }
    return parsed.src === src && parsed.dataUrl ? parsed.dataUrl : null
  } catch {
    return null
  }
}

function writeCachedFrame(src: string, dataUrl: string) {
  try {
    sessionStorage.setItem(
      POSTER_CACHE_KEY,
      JSON.stringify({ src, dataUrl })
    )
  } catch {
    // quota or private mode
  }
}

function captureFirstFrame(video: HTMLVideoElement): string | null {
  const { videoWidth, videoHeight } = video
  if (videoWidth <= 0 || videoHeight <= 0) return null

  const canvas = document.createElement("canvas")
  canvas.width = videoWidth
  canvas.height = videoHeight
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  ctx.drawImage(video, 0, 0, videoWidth, videoHeight)
  try {
    return canvas.toDataURL("image/jpeg", 0.82)
  } catch {
    return null
  }
}

export default function MacWallMarketingWalkthroughVideo({
  sources,
  ariaLabel,
}: Readonly<{
  sources: readonly string[]
  ariaLabel: string
}>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const assignedSrcRef = useRef<string | null>(null)
  const frameCapturedRef = useRef(false)
  const reduceMotion = useReducedMotion()

  const [sourceIndex, setSourceIndex] = useState(0)
  const [inView, setInView] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const [framePoster, setFramePoster] = useState<string | null>(null)

  const activeSrc = sources[Math.min(sourceIndex, sources.length - 1)] ?? ""
  const shouldAutoplay = inView && !reduceMotion && !videoFailed && Boolean(activeSrc)

  const cacheAndShowFirstFrame = useCallback(() => {
    const video = videoRef.current
    if (!video || frameCapturedRef.current) return

    pauseAtFirstFrame(video)

    const dataUrl = captureFirstFrame(video)
    if (!dataUrl) return

    frameCapturedRef.current = true
    setFramePoster(dataUrl)
    writeCachedFrame(activeSrc, dataUrl)
  }, [activeSrc])

  const tryNextSource = useCallback(() => {
    frameCapturedRef.current = false
    assignedSrcRef.current = null
    if (sourceIndex < sources.length - 1) {
      const nextIndex = sourceIndex + 1
      const nextSrc = sources[nextIndex] ?? ""
      setSourceIndex(nextIndex)
      setFramePoster(readCachedFrame(nextSrc))
      return
    }
    setVideoFailed(true)
  }, [sourceIndex, sources])

  useEffect(() => {
    if (!activeSrc) {
      setFramePoster(null)
      frameCapturedRef.current = false
      return
    }

    const cached = readCachedFrame(activeSrc)
    setFramePoster(cached)
    frameCapturedRef.current = Boolean(cached)
  }, [activeSrc])

  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { rootMargin: "320px 0px", threshold: 0.01 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !activeSrc || videoFailed) return

    if (assignedSrcRef.current !== activeSrc) {
      assignedSrcRef.current = activeSrc
      video.src = activeSrc
      video.preload = "auto"
      video.load()
    }
  }, [activeSrc, videoFailed])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !shouldAutoplay) return

    if (frameCapturedRef.current || video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      playMutedLoop(video)
      return
    }

    const onReady = () => {
      cacheAndShowFirstFrame()
      playMutedLoop(video)
    }

    video.addEventListener("loadeddata", onReady, { once: true })
    return () => video.removeEventListener("loadeddata", onReady)
  }, [shouldAutoplay, cacheAndShowFirstFrame])

  const handleLoadedMetadata = useCallback(() => {
    cacheAndShowFirstFrame()
  }, [cacheAndShowFirstFrame])

  const handleLoadedData = useCallback(() => {
    cacheAndShowFirstFrame()
    const video = videoRef.current
    if (!video || shouldAutoplay) return
    pauseAtFirstFrame(video)
  }, [cacheAndShowFirstFrame, shouldAutoplay])

  const handleVideoError = useCallback(() => {
    tryNextSource()
  }, [tryNextSource])

  return (
    <div
      ref={containerRef}
      className="MacWallWalkthroughMedia relative aspect-[3024/1964] w-full overflow-hidden bg-[#f5f5f7]"
    >
      {framePoster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={framePoster}
          alt=""
          aria-hidden
          className="MacWallWalkthroughFramePoster pointer-events-none absolute inset-0 size-full object-cover"
        />
      ) : null}

      {!videoFailed && activeSrc ? (
        <video
          ref={videoRef}
          src={activeSrc}
          className="MacWallWalkthroughVideo relative z-[1] size-full object-cover"
          muted
          loop
          playsInline
          preload="auto"
          aria-label={ariaLabel}
          onLoadedMetadata={handleLoadedMetadata}
          onLoadedData={handleLoadedData}
          onError={handleVideoError}
        />
      ) : null}
    </div>
  )
}