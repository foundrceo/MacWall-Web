"use client"

import { useReducedMotion } from "motion/react"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  MarketingContainer,
  MarketingSection,
  SectionEyebrow,
  SectionLead,
  SectionTitle,
} from "@/components/macwall-marketing/marketing-primitives"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"
import {
  markGalleryPosterCached,
  markGalleryVideoCached,
} from "@/lib/marketing-gallery-poster-cache"
import {
  releaseGalleryDecoder,
  requestGalleryDecoder,
} from "@/lib/marketing-gallery-playback"
import type { MarketingGalleryWallpaper } from "@/lib/marketing-gallery-wallpapers"
import { cn } from "@/lib/utils"

function playGalleryVideo(video: HTMLVideoElement) {
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
    playGalleryVideo(video)
  }

  video.addEventListener("timeupdate", handleTimeUpdate)
  video.addEventListener("ended", handleEnded)

  return () => {
    video.removeEventListener("timeupdate", handleTimeUpdate)
    video.removeEventListener("ended", handleEnded)
  }
}

function videoHasLoadedData(video: HTMLVideoElement) {
  return video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
}

function GalleryTileSkeleton({ visible }: Readonly<{ visible: boolean }>) {
  return (
    <div
      className={cn(
        "MacWallGallerySkeleton absolute inset-0 z-10 transition-opacity duration-300",
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      )}
      aria-hidden
    />
  )
}

function GalleryMediaTile({
  wallpaper,
  sectionActive,
  posterOnly = false,
}: Readonly<{
  wallpaper: MarketingGalleryWallpaper
  sectionActive: boolean
  posterOnly?: boolean
}>) {
  const tileRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoSrcAssignedRef = useRef(false)
  const videoLoadedRef = useRef(false)
  const sources = [wallpaper.thumbUrl, wallpaper.posterUrl] as const

  const [sourceIndex, setSourceIndex] = useState(0)
  const [posterLoaded, setPosterLoaded] = useState(false)
  const [posterFailed, setPosterFailed] = useState(false)
  const [visible, setVisible] = useState(false)
  const [hasDecoder, setHasDecoder] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const reduceMotion = useReducedMotion()

  const src = sources[Math.min(sourceIndex, sources.length - 1)]
  const shouldStream =
    !posterOnly && sectionActive && visible && hasDecoder && !reduceMotion

  const markPosterLoaded = useCallback(() => {
    markGalleryPosterCached(src)
    setPosterLoaded(true)
  }, [src])

  const handlePosterLoad = useCallback(() => {
    markPosterLoaded()
  }, [markPosterLoaded])

  const handlePosterError = useCallback(() => {
    if (sourceIndex < sources.length - 1) {
      setSourceIndex((index) => index + 1)
      setPosterLoaded(false)
      setPosterFailed(false)
      return
    }
    setPosterFailed(true)
  }, [sourceIndex, sources.length])

  // Browser HTTP cache: onLoad may not replay; check complete after mount/src change.
  useEffect(() => {
    const img = imgRef.current
    if (!img || posterLoaded || posterFailed) return
    if (img.complete && img.naturalWidth > 0) {
      markPosterLoaded()
    }
  }, [src, posterLoaded, posterFailed, markPosterLoaded])

  useEffect(() => {
    if (posterOnly) return

    const tile = tileRef.current
    if (!tile) return

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? false),
      { root: null, rootMargin: "0px", threshold: 0.45 }
    )
    observer.observe(tile)
    return () => observer.disconnect()
  }, [posterOnly])

  useEffect(() => {
    if (posterOnly || !sectionActive || !visible || reduceMotion) {
      releaseGalleryDecoder(wallpaper.id)
      setHasDecoder(false)
      return
    }

    if (!requestGalleryDecoder(wallpaper.id)) {
      setHasDecoder(false)
      return
    }

    setHasDecoder(true)
    return () => releaseGalleryDecoder(wallpaper.id)
  }, [posterOnly, sectionActive, visible, reduceMotion, wallpaper.id])

  useEffect(() => {
    if (posterOnly) return

    const video = videoRef.current
    if (!video) return

    return bindGaplessLoop(video)
  }, [posterOnly])

  useEffect(() => {
    if (posterOnly) return

    const video = videoRef.current
    if (!video) return

    if (!shouldStream) {
      video.pause()
      return
    }

    if (!videoSrcAssignedRef.current) {
      video.src = wallpaper.videoUrl
      videoSrcAssignedRef.current = true
      if (!videoHasLoadedData(video)) {
        video.load()
      }
    }

    if (videoLoadedRef.current || videoHasLoadedData(video)) {
      videoLoadedRef.current = true
      setVideoReady(true)
      playGalleryVideo(video)
      return
    }

    playGalleryVideo(video)
  }, [posterOnly, shouldStream, wallpaper.videoUrl])

  const handleVideoReady = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    videoLoadedRef.current = true
    markGalleryVideoCached(wallpaper.id)
    setVideoReady(true)

    if (shouldStream) {
      playGalleryVideo(video)
    }
  }, [shouldStream, wallpaper.id])

  const handleVideoError = useCallback(() => {
    setVideoFailed(true)
  }, [])

  const showVideo = shouldStream && videoReady && !videoFailed
  const showPoster = !posterFailed && posterLoaded
  const showSkeleton = posterFailed || !posterLoaded

  return (
    <div
      ref={tileRef}
      className="MacWallGalleryTile relative shrink-0 overflow-hidden rounded-[20px]"
    >
      {!posterFailed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          key={src}
          src={src}
          alt=""
          aria-hidden
          decoding="async"
          loading="lazy"
          className={cn(
            "MacWallGalleryPoster absolute inset-0 z-0 size-full object-cover",
            showPoster ? "opacity-100" : "opacity-0"
          )}
          onLoad={handlePosterLoad}
          onError={handlePosterError}
        />
      ) : null}

      {!posterOnly ? (
        <video
          ref={videoRef}
          className={cn(
            "MacWallGalleryVideo absolute inset-0 z-[1] size-full object-cover",
            showVideo ? "opacity-100" : "opacity-0"
          )}
          muted
          loop
          playsInline
          preload="none"
          aria-label={wallpaper.name}
          onLoadedData={handleVideoReady}
          onCanPlay={handleVideoReady}
          onError={handleVideoError}
        />
      ) : null}

      <GalleryTileSkeleton visible={showSkeleton} />
    </div>
  )
}

function GalleryMarqueeRow({
  wallpapers,
  reverse,
  sectionActive,
}: Readonly<{
  wallpapers: MarketingGalleryWallpaper[]
  reverse?: boolean
  sectionActive: boolean
}>) {
  const reduceMotion = useReducedMotion()

  if (wallpapers.length === 0) return null

  return (
    <div
      className={cn(
        "MacWallGalleryMarqueeRow",
        reverse && "MacWallGalleryMarqueeRowReverse",
        reduceMotion && "MacWallGalleryMarqueeRowStatic"
      )}
    >
      <div className="MacWallGalleryMarqueeTrack">
        {wallpapers.map((wallpaper) => (
          <GalleryMediaTile
            key={wallpaper.id}
            wallpaper={wallpaper}
            sectionActive={sectionActive}
          />
        ))}
        {wallpapers.map((wallpaper) => (
          <GalleryMediaTile
            key={`${wallpaper.id}-dup`}
            wallpaper={wallpaper}
            sectionActive={sectionActive}
            posterOnly
          />
        ))}
      </div>
    </div>
  )
}

export default function MacWallMarketingGallery({
  wallpapers,
}: Readonly<{
  wallpapers: MarketingGalleryWallpaper[]
}>) {
  const gallery = macwallExactCopy.gallery
  const sectionRef = useRef<HTMLElement>(null)
  const [sectionActive, setSectionActive] = useState(false)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => setSectionActive(entry?.isIntersecting ?? false),
      { rootMargin: "160px 0px", threshold: 0.05 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const midpoint = Math.ceil(wallpapers.length / 2)
  const rowA = wallpapers.slice(0, midpoint)
  const rowB = wallpapers.slice(midpoint)

  return (
    <MarketingSection
      ref={sectionRef}
      id="overview"
      className="MacWallGallerySection !py-20 md:!py-28"
    >
      <MarketingContainer wide>
        <div className="mb-10 md:mb-14">
          <SectionEyebrow className="MacWallGalleryKicker mb-2">
            {gallery.kicker}
          </SectionEyebrow>
          <SectionTitle className="mt-3 text-left md:text-[48px]">
            {gallery.title}
          </SectionTitle>
          <SectionLead className="mt-4 max-w-[640px] text-left">
            {gallery.lead}
          </SectionLead>
        </div>
      </MarketingContainer>

      <div className="MacWallGalleryMarqueeStack">
        <GalleryMarqueeRow wallpapers={rowA} sectionActive={sectionActive} />
        <GalleryMarqueeRow
          wallpapers={rowB}
          reverse
          sectionActive={sectionActive}
        />
      </div>
    </MarketingSection>
  )
}
