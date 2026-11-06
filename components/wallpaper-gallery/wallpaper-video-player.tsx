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
import {
  afterPageLoadIdle,
  prefersLightweightMedia,
  prefersReducedMotion,
} from "@/lib/deferred-media"
import { cn } from "@/lib/utils"

const CONTROL_ICON_SIZE = 16
const CONTROL_ICON_STROKE = 1.75
/** A stream that never becomes playable counts as failed after this long. */
const STUCK_BUFFERING_MS = 20_000

type PlaybackSource = "preview" | "master"

/**
 * - `idle`: poster only; the preview starts once the player is in view and
 *   the page has loaded and gone idle.
 * - `tap`: poster + "Play preview" (Save-Data, 2G/3G, reduced motion, or the
 *   browser blocked autoplay).
 * - `loading` / `ready`: a file is attached to the <video>.
 * - `retry`: the preview failed; poster + "Play preview".
 * - `failed`: nothing playable; poster + "Preview unavailable".
 */
type PlayerPhase = "idle" | "tap" | "loading" | "ready" | "retry" | "failed"

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

/**
 * The master file behind a Media Transformation preview URL
 * (`/cdn-cgi/media/<options>/videos/…` → `/videos/…`), or "" when the
 * preview isn't a transform. Only ever loaded after an explicit tap on
 * "Play preview" once the preview itself has failed: never autoplayed.
 */
function masterFallbackUrl(previewSrc: string): string {
  const master = previewSrc.replace(/\/cdn-cgi\/media\/[^/]+/, "")
  return master !== previewSrc ? master : ""
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
  posterAlt,
  className,
}: Readonly<{
  /** Downscaled web preview (never the full-resolution master). */
  src: string
  poster: string
  title: string
  /** Alt text for the poster, the page's main image of the wallpaper. */
  posterAlt?: string
  className?: string
}>) {
  const previewSrc = src.trim()
  return (
    <WallpaperVideoPlayerInner
      // Another wallpaper starts from a clean slate: poster, idle, no file.
      key={previewSrc}
      previewSrc={previewSrc}
      poster={poster}
      title={title}
      posterAlt={posterAlt?.trim() || `${title} live wallpaper for Mac`}
      className={className}
    />
  )
}

function WallpaperVideoPlayerInner({
  previewSrc,
  poster,
  title,
  posterAlt,
  className,
}: Readonly<{
  previewSrc: string
  poster: string
  title: string
  posterAlt: string
  className?: string
}>) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)
  const hideTimerRef = useRef<number | null>(null)
  const controlsRevealedRef = useRef(false)
  /** Which file is attached to the <video> right now, if any. */
  const sourceRef = useRef<PlaybackSource | null>(null)
  const startedRef = useRef(false)
  const previewRetriedRef = useRef(false)
  /** Paused because it scrolled out of view (not by the visitor). */
  const autoPausedRef = useRef(false)
  const reduceMotion = useReducedMotion()
  const masterSrc = masterFallbackUrl(previewSrc)

  const [phase, setPhase] = useState<PlayerPhase>(
    previewSrc ? "idle" : "failed"
  )
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [controlsVisible, setControlsVisible] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [scrubbing, setScrubbing] = useState(false)
  const [buffering, setBuffering] = useState(false)

  const ready = phase === "ready"
  const showLoader = phase === "loading" || (ready && buffering)
  const showPlayButton = phase === "tap" || phase === "retry"

  /**
   * Attach a file and play it. The preview runs from the idle/in-view
   * effect or a tap; the master only from a tap on "Play preview" after the
   * preview failed, so it loads with preload="metadata" and never autoplays.
   */
  const start = useCallback(
    (source: PlaybackSource) => {
      const video = videoRef.current
      const url = source === "master" ? masterSrc : previewSrc
      if (!video || !url) return
      // Autoplay needs the element muted; the visitor can unmute later.
      if (!startedRef.current) video.muted = true
      startedRef.current = true
      sourceRef.current = source
      autoPausedRef.current = false
      video.preload = source === "master" ? "metadata" : "none"
      video.src = url
      setBuffering(true)
      setPhase("loading")
      void video.play().catch((error: unknown) => {
        // Autoplay blocked (e.g. Low Power Mode): wait for a tap. Load
        // failures arrive through the element's `error` event instead.
        if (
          error instanceof DOMException &&
          error.name === "NotAllowedError" &&
          sourceRef.current === source
        ) {
          setBuffering(false)
          setPhase("tap")
        }
      })
    },
    [masterSrc, previewSrc]
  )

  /** Drop a dead file, keep the poster, and offer the next step. */
  const fail = useCallback(() => {
    const source = sourceRef.current
    if (!source) return
    sourceRef.current = null
    const video = videoRef.current
    if (video) {
      // Detach the stream so a hanging download stops too.
      video.pause()
      video.removeAttribute("src")
      video.load()
    }
    setBuffering(false)
    setPlaying(false)
    setControlsVisible(false)
    setPhase(
      source === "preview" && (masterSrc || !previewRetriedRef.current)
        ? "retry"
        : "failed"
    )
  }, [masterSrc])

  const onPlayButton = () => {
    if (phase === "retry") {
      if (masterSrc) {
        start("master")
      } else {
        previewRetriedRef.current = true
        start("preview")
      }
      return
    }
    start(sourceRef.current ?? "preview")
  }

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current != null) {
      window.clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  const scheduleHideControls = useCallback(
    (isPlaying: boolean) => {
      clearHideTimer()
      if (!isPlaying) return
      hideTimerRef.current = window.setTimeout(() => {
        setControlsVisible(false)
      }, 2200)
    },
    [clearHideTimer]
  )

  /** Time and progress only re-render while the controls are on screen. */
  const syncTime = useCallback(() => {
    const video = videoRef.current
    if (!video || !video.duration) return
    setCurrentTime(video.currentTime)
    setProgress(video.currentTime / video.duration)
  }, [])

  const revealControls = useCallback(
    (isPlaying: boolean = playing) => {
      if (!controlsVisible) syncTime()
      setControlsVisible(true)
      scheduleHideControls(isPlaying)
    },
    [controlsVisible, playing, scheduleHideControls, syncTime]
  )

  const markReady = useCallback(() => {
    if (!sourceRef.current) return
    setBuffering(false)
    setPhase((current) => (current === "loading" ? "ready" : current))
  }, [])

  const markBuffering = useCallback(() => {
    if (sourceRef.current) setBuffering(true)
  }, [])

  const revealControlsAfterFirstPlayback = useCallback(() => {
    if (controlsRevealedRef.current) return
    controlsRevealedRef.current = true
    syncTime()
    setControlsVisible(true)
    scheduleHideControls(true)
  }, [scheduleHideControls, syncTime])

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

  // The preview loads only once the player is near the viewport and the
  // page has finished loading and gone idle: the poster is the LCP image and
  // the video must not compete with it. Save-Data, slow connections and
  // reduced motion get the poster with tap-to-play instead.
  useEffect(() => {
    const shell = shellRef.current
    if (!shell || !previewSrc) return
    let cancelIdle: (() => void) | null = null
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        if (startedRef.current) return
        if (prefersLightweightMedia() || prefersReducedMotion()) {
          setPhase((current) => (current === "idle" ? "tap" : current))
          return
        }
        cancelIdle = afterPageLoadIdle(() => {
          if (!startedRef.current) start("preview")
        })
      },
      { rootMargin: "200px 0px" }
    )
    observer.observe(shell)
    return () => {
      observer.disconnect()
      cancelIdle?.()
    }
  }, [previewSrc, start])

  // A stream that never becomes playable is treated as failed, so the
  // visitor gets the poster and a clear next step, not an endless spinner.
  useEffect(() => {
    if (phase !== "loading") return
    const timer = window.setTimeout(fail, STUCK_BUFFERING_MS)
    return () => window.clearTimeout(timer)
  }, [phase, fail])

  // Stop decoding while the player is scrolled away; resume on the way back
  // unless the visitor paused it.
  useEffect(() => {
    const shell = shellRef.current
    if (!shell || !ready) return
    const observer = new IntersectionObserver(([entry]) => {
      const video = videoRef.current
      if (!entry || !video) return
      if (!entry.isIntersecting) {
        if (!video.paused) {
          autoPausedRef.current = true
          video.pause()
        }
      } else if (autoPausedRef.current) {
        autoPausedRef.current = false
        void video.play().catch(() => undefined)
      }
    })
    observer.observe(shell)
    return () => observer.disconnect()
  }, [ready])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    autoPausedRef.current = false
    // UI first, media second: the button responds on the next frame.
    if (video.paused) {
      setPlaying(true)
      revealControls(true)
      void video.play().catch(() => setPlaying(false))
    } else {
      setPlaying(false)
      revealControls(false)
      video.pause()
    }
  }, [revealControls])

  const onVideoClick = () => {
    if (ready) togglePlay()
    else if (phase === "idle") start("preview")
  }

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    const nextMuted = !video.muted
    setMuted(nextMuted)
    revealControls()
    video.muted = nextMuted
  }, [revealControls])

  const toggleFullscreen = useCallback(async () => {
    const shell = shellRef.current
    if (!shell) return
    revealControls()
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await shell.requestFullscreen()
      }
    } catch {
      // Ignore fullscreen failures (Safari permissions, etc.).
    }
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

  const onProgressPointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>
  ) => {
    event.preventDefault()
    const track = event.currentTarget
    track.setPointerCapture(event.pointerId)
    setScrubbing(true)
    seekFromClientX(event.clientX, track)
    revealControls()
  }

  const onProgressPointerMove = (
    event: ReactPointerEvent<HTMLButtonElement>
  ) => {
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

  return (
    <div
      ref={shellRef}
      className={cn(
        "group relative aspect-video overflow-hidden bg-black select-none",
        className
      )}
      onMouseMove={ready ? () => revealControls() : undefined}
      onMouseLeave={() => {
        if (playing) setControlsVisible(false)
      }}
      onFocusCapture={ready ? () => revealControls() : undefined}
      onContextMenu={blockMediaContextMenu}
    >
      {/*
        The poster is the page's main image of the wallpaper (LCP, image
        search, the sitemap's image entry), so it stays in the DOM with real
        alt text in every state. The video sits over it in the same box.
      */}
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt={posterAlt}
          fetchPriority="high"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover select-none [-webkit-user-drag:none]"
          draggable={false}
          onContextMenu={blockMediaContextMenu}
          onDragStart={blockMediaContextMenu}
        />
      ) : null}

      {/*
        Custom controls only: no native download UI. The file is attached
        from script (see `start`), so the server HTML carries no `src` and
        `preload="none"`: nothing downloads until the page is idle.
      */}
      {previewSrc ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover [-webkit-user-drag:none]"
          poster={poster || undefined}
          playsInline
          loop
          muted={muted}
          controls={false}
          controlsList="nodownload noremoteplayback noplaybackrate"
          disablePictureInPicture
          disableRemotePlayback
          draggable={false}
          preload="none"
          onClick={onVideoClick}
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
              markReady()
            }
          }}
          onPause={() => setPlaying(false)}
          onTimeUpdate={() => {
            if (controlsVisible && !scrubbing) syncTime()
          }}
          onLoadedMetadata={() => {
            const video = videoRef.current
            if (!video) return
            setDuration(video.duration || 0)
          }}
          onError={fail}
          aria-label={title}
        />
      ) : null}

      {showPlayButton ? (
        <button
          type="button"
          onClick={onPlayButton}
          aria-label={`Play preview of ${title}`}
          className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-black/20 transition-colors hover:bg-black/30 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none focus-visible:ring-inset"
        >
          <span className="inline-flex h-10 items-center gap-2 rounded-full bg-black/70 px-4 font-sans text-[14px] font-medium text-white">
            <HugeiconsIcon
              icon={PlayIcon}
              size={CONTROL_ICON_SIZE}
              strokeWidth={CONTROL_ICON_STROKE}
              aria-hidden
            />
            Play preview
          </span>
        </button>
      ) : null}

      {phase === "failed" ? (
        <p className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-full bg-black/70 px-3 py-1 font-sans text-[12px] text-white/85">
          Preview unavailable
        </p>
      ) : null}

      <AnimatePresence>
        {showLoader ? (
          <motion.div
            key="loader"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-white"
                  style={{ width: `${progress * 100}%` }}
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
                    onClick={togglePlay}
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
                  <span className="ml-1 font-sans text-[12px] text-white/80 tabular-nums">
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

/** Plain button with a CSS press state: no JS gesture work on tap (INP). */
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
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex size-9 items-center justify-center rounded-full text-white transition hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none active:scale-[0.92]"
    >
      {children}
    </button>
  )
}
