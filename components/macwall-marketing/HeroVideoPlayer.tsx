"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

/** Matches MacWall walkthrough footage — reserves height before metadata loads. */
const HERO_VIDEO_ASPECT_CLASS = "aspect-[3024/1964]"

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

export default function HeroVideoPlayer({
  sources,
  ariaLabel,
  endCaption,
}: Readonly<{
  sources: readonly string[]
  ariaLabel: string
  endCaption: string
}>) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [sourceIndex, setSourceIndex] = useState(0)
  const [muted, setMuted] = useState(true)
  const [showEndBar, setShowEndBar] = useState(false)

  const activeSrc = sources[Math.min(sourceIndex, sources.length - 1)] ?? ""

  const startPlayback = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = muted
    setShowEndBar(false)
    void video.play().catch(() => undefined)
  }, [muted])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !activeSrc) return

    if (video.getAttribute("src") !== activeSrc) {
      video.src = activeSrc
      video.load()
    }
    startPlayback()
  }, [activeSrc, startPlayback])

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    const nextMuted = !video.muted
    video.muted = nextMuted
    setMuted(nextMuted)
    if (video.paused) {
      void video.play().catch(() => undefined)
    }
  }

  const replay = () => {
    const video = videoRef.current
    if (!video) return
    setShowEndBar(false)
    video.currentTime = 0
    startPlayback()
  }

  const tryNextSource = () => {
    if (sourceIndex < sources.length - 1) {
      setSourceIndex((index) => index + 1)
    }
  }

  return (
    <div className="pb-10 pt-4">
      <div
        className={cn(
          "group relative w-full overflow-hidden rounded-2xl bg-background",
          HERO_VIDEO_ASPECT_CLASS
        )}
      >
        {activeSrc ? (
          <video
            ref={videoRef}
            src={activeSrc}
            autoPlay
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover"
            aria-label={ariaLabel}
            onEnded={() => setShowEndBar(true)}
            onError={tryNextSource}
          />
        ) : null}

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
            showEndBar &&
              "pointer-events-auto translate-y-0 opacity-100"
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
      </div>
    </div>
  )
}
