"use client"

import { useCallback, useLayoutEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import {
  captureVideoPoster,
  HERO_WALKTHROUGH_VIDEO_ID,
  readHeroVideoPoster,
  writeHeroVideoPoster,
} from "@/lib/marketing/hero-walkthrough-video.shared"

function MutedIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 5L6 9H3v6h3l5 4V5z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 9l5 5M21 9l-5 5" />
    </svg>
  )
}

function UnmutedIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 5L6 9H3v6h3l5 4V5z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.54 8.46a5 5 0 010 7.07M18.07 5.93a9 9 0 010 12.73"
      />
    </svg>
  )
}

export function HeroVideoControls({
  fallbackSources,
  endCaption,
}: Readonly<{
  fallbackSources: readonly string[]
  endCaption: string
}>) {
  const fallbackIndexRef = useRef(0)
  const [muted, setMuted] = useState(true)
  const [showEndBar, setShowEndBar] = useState(false)

  const getVideo = useCallback(
    () =>
      document.getElementById(
        HERO_WALKTHROUGH_VIDEO_ID
      ) as HTMLVideoElement | null,
    []
  )

  const startPlayback = useCallback(() => {
    const video = getVideo()
    if (!video) return
    video.muted = muted
    setShowEndBar(false)
    void video.play().catch(() => undefined)
  }, [getVideo, muted])

  useLayoutEffect(() => {
    const video = getVideo()
    if (!video) return

    const cachedPoster = readHeroVideoPoster()
    if (cachedPoster && !video.getAttribute("poster")) {
      video.poster = cachedPoster
    }

    video.muted = true

    const tryPlay = () => {
      video.muted = muted
      void video.play().catch(() => undefined)
    }

    tryPlay()

    const handleLoadedData = () => {
      if (!readHeroVideoPoster()) {
        const captured = captureVideoPoster(video)
        if (captured) {
          writeHeroVideoPoster(captured)
          video.poster = captured
        }
      }
      tryPlay()
    }

    const handleError = () => {
      const nextSource = fallbackSources[fallbackIndexRef.current]
      if (!nextSource) return
      fallbackIndexRef.current += 1
      video.src = nextSource
      video.load()
      tryPlay()
    }

    video.addEventListener("loadeddata", handleLoadedData)
    video.addEventListener("error", handleError)

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      handleLoadedData()
    }

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData)
      video.removeEventListener("error", handleError)
    }
  }, [fallbackSources, getVideo, muted])

  useLayoutEffect(() => {
    const video = getVideo()
    if (!video) return

    const handleEnded = () => setShowEndBar(true)
    video.addEventListener("ended", handleEnded)
    return () => video.removeEventListener("ended", handleEnded)
  }, [getVideo])

  const toggleMute = () => {
    const video = getVideo()
    if (!video) return
    const nextMuted = !video.muted
    video.muted = nextMuted
    setMuted(nextMuted)
    if (video.paused) {
      void video.play().catch(() => undefined)
    }
  }

  const replay = () => {
    const video = getVideo()
    if (!video) return
    setShowEndBar(false)
    video.currentTime = 0
    startPlayback()
  }

  return (
    <>
      <div className="absolute top-3 right-3 z-10 sm:top-4 sm:right-4">
        <button
          type="button"
          aria-label={muted ? "Unmute video" : "Mute video"}
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md bg-black/50 text-white/85 backdrop-blur-sm transition-[background-color,color] duration-200 hover:bg-black/65 hover:text-white focus:outline-none"
          onClick={toggleMute}
        >
          {muted ? (
            <MutedIcon className="size-4" />
          ) : (
            <UnmutedIcon className="size-4" />
          )}
        </button>
      </div>

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-10 transition-[opacity,transform] duration-200 ease-out",
          "pointer-events-none translate-y-1 opacity-0",
          "group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100",
          showEndBar && "pointer-events-auto translate-y-0 opacity-100"
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent"
        />
        <div className="relative flex flex-col gap-2.5 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-3.5">
          <p className="min-w-0 text-[12px] leading-snug text-white/85 sm:max-w-[55%] sm:text-[13px]">
            {endCaption}
          </p>
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            <button
              type="button"
              aria-label="Replay video"
              className="cursor-pointer rounded-md bg-black/50 px-2.5 py-1.5 text-[12px] text-white/85 backdrop-blur-sm transition-[background-color,color] duration-200 hover:bg-black/65 hover:text-white focus:outline-none sm:text-[13px]"
              onClick={replay}
            >
              Replay ↻
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
