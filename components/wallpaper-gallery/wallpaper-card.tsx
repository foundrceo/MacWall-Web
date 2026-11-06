"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type SyntheticEvent,
} from "react"
import Link from "next/link"
import { PlayIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion, useReducedMotion } from "motion/react"
import type { PublicWallpaper } from "@/lib/public-catalog/types"
import { markGalleryReturnFocus } from "@/lib/public-catalog/gallery-return-state"
import { wallpaperDetailPath } from "@/lib/public-catalog/urls"
import { wallpaperImageAlt } from "@/lib/public-catalog/wallpaper-alt"
import {
  GALLERY_MEDIA_RADIUS_CLASS,
  GALLERY_TEXT_PRIMARY_CLASS,
  GALLERY_TEXT_TERTIARY_CLASS,
} from "@/lib/public-catalog/chrome"
import { CatalogImage } from "@/components/wallpaper-gallery/catalog-image"
import { prefersLightweightMedia } from "@/lib/deferred-media"
import { cn } from "@/lib/utils"

/** Card labels that differ from the catalog name; the chips and crumbs say "More". */
const CARD_CATEGORY_LABELS: Readonly<Record<string, string>> = {
  Others: "More",
}

const PLAY_ICON_SIZE = 20
const PLAY_ICON_STROKE = 1.75

/**
 * Hover previews that failed on this page so far. When the preview CDN is
 * down for every wallpaper (e.g. a transformation quota), stop asking after
 * a couple instead of sending a dead request on every hover.
 */
const HOVER_PREVIEW_FAILURE_LIMIT = 2
const hoverPreviewHealth = { failures: 0 }

const subscribeToNothing = () => () => {}

function blockMediaContextMenu(event: SyntheticEvent) {
  event.preventDefault()
}

function WallpaperCardMedia({
  wallpaper,
  previewVideoUrl,
  priority,
  reduceMotion,
}: Readonly<{
  wallpaper: PublicWallpaper
  previewVideoUrl?: string
  priority?: boolean
  reduceMotion: boolean | null
}>) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoSrc, setVideoSrc] = useState<string | null>(null)
  const previewFailedRef = useRef(false)
  const resolvedVideoUrl = previewVideoUrl ?? wallpaper.videoUrl

  const handlePointerEnter = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      // Mouse hover only: on a touch screen the tap navigates, so a preview
      // would be a wasted download.
      if (event.pointerType !== "mouse") return
      setIsHovered(true)
      if (
        reduceMotion ||
        !resolvedVideoUrl ||
        previewFailedRef.current ||
        hoverPreviewHealth.failures >= HOVER_PREVIEW_FAILURE_LIMIT ||
        prefersLightweightMedia()
      ) {
        return
      }
      setVideoSrc(resolvedVideoUrl)
    },
    [reduceMotion, resolvedVideoUrl]
  )

  const handlePreviewError = useCallback(() => {
    // Poster only from here on. Never swap in the full-resolution master:
    // it is the paid file and tens of MB.
    if (previewFailedRef.current) return
    previewFailedRef.current = true
    hoverPreviewHealth.failures += 1
    setIsPlaying(false)
    setVideoSrc(null)
  }, [])

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false)
    setIsPlaying(false)
    const video = videoRef.current
    if (video) {
      video.pause()
      video.currentTime = 0
    }
    setVideoSrc(null)
  }, [])

  useEffect(() => {
    if (!videoSrc || reduceMotion) return
    const video = videoRef.current
    if (!video) return

    void video.play().catch(() => {
      setIsPlaying(false)
    })
  }, [videoSrc, reduceMotion])

  const hasVideo = Boolean(resolvedVideoUrl)
  const showPlayOverlay = hasVideo && isHovered

  return (
    // Fixed 16:9 box: the tile keeps its size before and after the thumb loads.
    <div
      className="relative aspect-video w-full"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <div
        className={cn(
          "absolute inset-0 overflow-hidden bg-[#141414]",
          "shadow-[0_6px_22px_rgba(0,0,0,0.22)]",
          "group-focus-visible:ring-2 group-focus-visible:ring-white/40 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-black",
          GALLERY_MEDIA_RADIUS_CLASS
        )}
      >
        <CatalogImage
          src={wallpaper.thumbUrl}
          alt={wallpaperImageAlt(wallpaper)}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover [-webkit-user-drag:none]"
          priority={priority}
          draggable={false}
        />

        {videoSrc && !reduceMotion ? (
          <video
            ref={videoRef}
            src={videoSrc}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-300 [-webkit-user-drag:none]",
              isPlaying ? "opacity-100" : "opacity-0"
            )}
            muted
            loop
            playsInline
            controls={false}
            controlsList="nodownload noremoteplayback noplaybackrate"
            disablePictureInPicture
            disableRemotePlayback
            draggable={false}
            preload="metadata"
            onContextMenu={blockMediaContextMenu}
            onDragStart={blockMediaContextMenu}
            onPlaying={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={handlePreviewError}
          />
        ) : null}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 opacity-50"
        />

        {hasVideo ? (
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 flex items-center justify-center",
              "transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              showPlayOverlay ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="flex size-11 items-center justify-center rounded-full border-0 bg-black/40 shadow-none ring-0 backdrop-blur-md outline-none">
              <HugeiconsIcon
                icon={PlayIcon}
                size={PLAY_ICON_SIZE}
                strokeWidth={PLAY_ICON_STROKE}
                className="ml-0.5 text-white/95"
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function WallpaperCard({
  wallpaper,
  previewVideoUrl,
  priority = false,
  index = 0,
  entranceIndex,
  animateEntrance = false,
  className,
}: Readonly<{
  wallpaper: PublicWallpaper
  /** Resolved preview URL (e.g. presigned): falls back to `wallpaper.videoUrl`. */
  previewVideoUrl?: string
  priority?: boolean
  index?: number
  /** Stagger index for mount animation: use batch-relative values when paginating. */
  entranceIndex?: number
  /**
   * Fade/slide in on mount. Only for cards added on the client (Show more,
   * a filter refresh); server-rendered cards never animate in either way.
   */
  animateEntrance?: boolean
  className?: string
}>) {
  const reduceMotion = useReducedMotion()
  const staggerIndex = entranceIndex ?? index
  // Server HTML and hydration always get `false`, so a server-rendered card
  // paints at full opacity without waiting for JS (it can be the LCP image).
  // Cards mounted later on the client animate when asked to.
  const shouldAnimateEntrance = useSyncExternalStore(
    subscribeToNothing,
    () => animateEntrance && !reduceMotion,
    () => false
  )

  return (
    <motion.div
      id={`wallpaper-card-${wallpaper.id}`}
      data-wallpaper-id={wallpaper.id}
      initial={shouldAnimateEntrance ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: Math.min(staggerIndex, 5) * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        href={wallpaperDetailPath(wallpaper)}
        // A grid shows 24+ cards: viewport prefetch would fetch every detail
        // page's RSC payload. Navigate on click instead.
        prefetch={false}
        // pointerdown beats click: focus is saved before Next starts navigating.
        onPointerDown={() => markGalleryReturnFocus(wallpaper.id)}
        onClick={() => markGalleryReturnFocus(wallpaper.id)}
        className={cn(
          "group flex min-w-0 flex-col gap-2.5 outline-none",
          className
        )}
      >
        <WallpaperCardMedia
          wallpaper={wallpaper}
          previewVideoUrl={previewVideoUrl}
          priority={priority}
          reduceMotion={reduceMotion}
        />
        <div className="min-w-0 px-0.5 font-sans font-normal">
          <p
            className={cn(
              "truncate text-[15px] leading-snug tracking-[-0.015em] transition-colors duration-200",
              GALLERY_TEXT_PRIMARY_CLASS,
              "group-hover:text-white group-focus-visible:text-white"
            )}
          >
            {wallpaper.name}
          </p>
          <p
            className={cn(
              "mt-0.5 truncate text-[13px] leading-snug transition-colors duration-200",
              GALLERY_TEXT_TERTIARY_CLASS,
              "group-hover:text-white/70 group-focus-visible:text-white/70"
            )}
          >
            {CARD_CATEGORY_LABELS[wallpaper.category] ?? wallpaper.category}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
