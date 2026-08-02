"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react"
import {
  Maximize01Icon,
  Minimize01Icon,
  PauseIcon,
  PlayIcon,
  VolumeHighIcon,
  VolumeMute02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

const CONTROL_ICON_SIZE = 16
const CONTROL_ICON_STROKE = 1.75

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const total = Math.floor(seconds)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

function blockMediaContextMenu(event: SyntheticEvent) {
  event.preventDefault()
}

function VideoLoader({
  reduceMotion,
}: Readonly<{ reduceMotion: boolean | null }>) {
  return (
    <div
      role="status"
      aria-label="Loading video"
      aria-live="polite"
      className="flex size-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md"
    >
      <div
        className={cn(
          "size-[18px] rounded-full border-2 border-white/20 border-t-white/90",
          !reduceMotion && "animate-spin"
        )}
      />
    </div>
  )
}

export function WallpaperVideoPlayer({
  src,
  poster,
  title,
  className,
}: Readonly<{
  src: string
  poster: string
  title: string
  className?: string
}>) {
  return (
    <WallpaperVideoPlayerInner
      key={src}
      src={src}
      poster={poster}
      title={title}
      className={className}
    />
  )
}

function WallpaperVideoPlayerInner({
  src,
  poster,
  title,
  className,
}: Readonly<{
  src: string
  poster: string
  title: string
  className?: string
}>) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const hideTimerRef = useRef<number | null>(null)
  const controlsRevealedRef = useRef(false)
  const reduceMotion = useReducedMotion()

  const [failed, setFailed] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [controlsVisible, setControlsVisible] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [scrubbing, setScrubbing] = useState(false)
  const [buffering, setBuffering] = useState(true)
  const [ready, setReady] = useState(false)

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current != null) {
      window.clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  const scheduleHideControls = useCallback(() => {
    clearHideTimer()
    if (!playing) return
    hideTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false)
    }, 2200)
  }, [clearHideTimer, playing])

  const markReady = useCallback(() => {
    setBuffering(false)
    setReady(true)
  }, [])

  const revealControlsAfterFirstPlayback = useCallback(() => {
    if (controlsRevealedRef.current) return
    controlsRevealedRef.current = true
    setControlsVisible(true)
    scheduleHideControls()
  }, [scheduleHideControls])

  const markBuffering = useCallback(() => {
    setBuffering(true)
  }, [])

  const revealControls = useCallback(() => {
    setControlsVisible(true)
    scheduleHideControls()
  }, [scheduleHideControls])

  useEffect(() => clearHideTimer, [clearHideTimer])

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener("fullscreenchange", onFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange)
    }
  }, [])

  const togglePlay = useCallback(async () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      try {
        await video.play()
        setPlaying(true)
      } catch {
        setPlaying(false)
      }
    } else {
      video.pause()
      setPlaying(false)
    }
    revealControls()
  }, [revealControls])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
    revealControls()
  }, [revealControls])

  const toggleFullscreen = useCallback(async () => {
    const shell = shellRef.current
    if (!shell) return
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await shell.requestFullscreen()
      }
    } catch {
      // Ignore fullscreen failures (Safari permissions, etc.).
    }
    revealControls()
  }, [revealControls])

  const seekFromClientX = useCallback(
    (clientX: number, track: HTMLElement) => {
      const video = videoRef.current
      if (!video || !duration) return
      const rect = track.getBoundingClientRect()
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
      const nextTime = ratio * duration
      video.currentTime = nextTime
      setProgress(ratio)
      setCurrentTime(nextTime)
    },
    [duration]
  )

  const onProgressPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    const track = event.currentTarget
    track.setPointerCapture(event.pointerId)
    setScrubbing(true)
    seekFromClientX(event.clientX, track)
    revealControls()
  }

  const onProgressPointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!scrubbing) return
    seekFromClientX(event.clientX, event.currentTarget)
  }

  const onProgressPointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!scrubbing) return
    setScrubbing(false)
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // Already released.
    }
  }

  if (failed) {
    return (
      <div
        className={cn(
          "relative aspect-video overflow-hidden bg-black",
          className
        )}
        onContextMenu={blockMediaContextMenu}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={poster}
          alt={title}
          className="h-full w-full select-none object-cover [-webkit-user-drag:none]"
          draggable={false}
          onContextMenu={blockMediaContextMenu}
          onDragStart={blockMediaContextMenu}
        />
      </div>
    )
  }

  return (
    <div
      ref={shellRef}
      className={cn(
        "group relative aspect-video overflow-hidden bg-black select-none",
        className
      )}
      onMouseMove={revealControls}
      onMouseLeave={() => {
        if (playing) setControlsVisible(false)
      }}
      onFocusCapture={revealControls}
      onContextMenu={blockMediaContextMenu}
    >
      {/*
        Custom controls only — no native download UI. Signed preview URLs expire;
        determined users can still capture network traffic or re-record the stream.
      */}
      <video
        ref={videoRef}
        key={src}
        className={cn(
          "h-full w-full bg-black object-cover transition-opacity duration-300 [-webkit-user-drag:none]",
          buffering && !ready ? "opacity-0" : "opacity-100"
        )}
        src={src}
        poster={poster}
        playsInline
        loop
        muted={muted}
        autoPlay
        controls={false}
        controlsList="nodownload noremoteplayback noplaybackrate"
        disablePictureInPicture
        disableRemotePlayback
        draggable={false}
        preload="metadata"
        onClick={() => void togglePlay()}
        onContextMenu={blockMediaContextMenu}
        onDragStart={blockMediaContextMenu}
        onLoadStart={markBuffering}
        onWaiting={markBuffering}
        onStalled={markBuffering}
        onSeeking={markBuffering}
        onCanPlay={markReady}
        onCanPlayThrough={markReady}
        onPlaying={() => {
          setPlaying(true)
          markReady()
          revealControlsAfterFirstPlayback()
        }}
        onSeeked={() => {
          const video = videoRef.current
          if (
            video &&
            !video.paused &&
            video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA
          ) {
            setBuffering(false)
          }
        }}
        onPause={() => setPlaying(false)}
        onTimeUpdate={() => {
          const video = videoRef.current
          if (!video || !video.duration || scrubbing) return
          setCurrentTime(video.currentTime)
          setProgress(video.currentTime / video.duration)
        }}
        onLoadedMetadata={() => {
          const video = videoRef.current
          if (!video) return
          setDuration(video.duration || 0)
        }}
        onError={() => {
          setBuffering(false)
          setFailed(true)
        }}
        aria-label={title}
      />

      {buffering && !ready && poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover [-webkit-user-drag:none]"
          draggable={false}
        />
      ) : null}

      <AnimatePresence>
        {buffering ? (
          <motion.div
            key="loader"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
          >
            <VideoLoader reduceMotion={reduceMotion} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {ready && controlsVisible ? (
          <motion.div
            key="controls"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3 pt-12 pb-3 sm:px-4 sm:pb-3.5"
          >
            <div className="pointer-events-auto flex flex-col gap-2.5">
              <button
                type="button"
                aria-label="Seek"
                className="group/seek relative h-1.5 w-full cursor-pointer rounded-full bg-white/25"
                onPointerDown={onProgressPointerDown}
                onPointerMove={onProgressPointerMove}
                onPointerUp={onProgressPointerUp}
                onPointerCancel={onProgressPointerUp}
              >
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full bg-white"
                  style={{ width: `${progress * 100}%` }}
                  layout={false}
                />
                <span
                  className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow transition group-hover/seek:opacity-100"
                  style={{ left: `${progress * 100}%` }}
                />
              </button>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <ControlButton
                    label={playing ? "Pause" : "Play"}
                    onClick={() => void togglePlay()}
                  >
                    <HugeiconsIcon
                      icon={playing ? PauseIcon : PlayIcon}
                      size={CONTROL_ICON_SIZE}
                      strokeWidth={CONTROL_ICON_STROKE}
                      aria-hidden
                    />
                  </ControlButton>
                  <ControlButton
                    label={muted ? "Unmute" : "Mute"}
                    onClick={toggleMute}
                  >
                    <HugeiconsIcon
                      icon={muted ? VolumeMute02Icon : VolumeHighIcon}
                      size={CONTROL_ICON_SIZE}
                      strokeWidth={CONTROL_ICON_STROKE}
                      aria-hidden
                    />
                  </ControlButton>
                  <span className="ml-1 font-sans text-[12px] tabular-nums text-white/80">
                    {formatTime(currentTime)}
                    {duration > 0 ? ` / ${formatTime(duration)}` : ""}
                  </span>
                </div>
                <ControlButton
                  label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                  onClick={() => void toggleFullscreen()}
                >
                  <HugeiconsIcon
                    icon={isFullscreen ? Minimize01Icon : Maximize01Icon}
                    size={CONTROL_ICON_SIZE}
                    strokeWidth={CONTROL_ICON_STROKE}
                    aria-hidden
                  />
                </ControlButton>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function ControlButton({
  label,
  onClick,
  children,
}: Readonly<{
  label: string
  onClick: () => void
  children: ReactNode
}>) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      className="inline-flex size-9 items-center justify-center rounded-full text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
    >
      {children}
    </motion.button>
  )
}
