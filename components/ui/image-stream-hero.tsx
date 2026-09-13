"use client"

import * as React from "react"

import {
  catalogPreviewVideoUrlFromKey,
  catalogPublicVideoUrlFromKey,
} from "@/lib/macwall-catalog-urls"
import { cn } from "@/lib/utils"

export type CorridorPath = {
  perspective?: number
  cardWidth?: number
  cardHeight?: number
  cardRadius?: number
  birthHeight?: number
  exitHeight?: number
  railBirth?: number
  railExit?: number
  fan?: number
  turnBirth?: number
  turnExit?: number
  stops?: number
}

const PATH: Required<CorridorPath> = {
  perspective: 30,
  cardWidth: 22,
  cardHeight: 12.4,
  cardRadius: 1.1,
  birthHeight: 2.2,
  exitHeight: 28,
  railBirth: -11,
  railExit: 44,
  fan: 3.3,
  turnBirth: 6,
  turnExit: 28,
  stops: 24,
}

function keyframes(dir: 1 | -1, name: string, p: Required<CorridorPath>) {
  const steps: string[] = []
  for (let s = 0; s <= p.stops; s++) {
    const u = s / p.stops
    const scale =
      (p.birthHeight / p.cardHeight) *
      Math.pow(p.exitHeight / p.birthHeight, u)
    const z = p.perspective * (1 - 1 / scale)
    const rail =
      p.railExit - (p.railExit - p.railBirth) * Math.pow(1 - u, p.fan)
    const turn = p.turnBirth + (p.turnExit - p.turnBirth) * u
    steps.push(
      `${(u * 100).toFixed(2)}%{transform:translate3d(${(dir * rail).toFixed(
        2
      )}cqw,0,${z.toFixed(2)}cqw) rotateY(${(-dir * turn).toFixed(2)}deg)}`
    )
  }
  return `@keyframes ${name}{${steps.join("")}}`
}

export type StreamItem = {
  poster: string
  video?: string
  videoKey?: string
}

export type StreamImage = StreamItem & {
  src?: string
}

type NetworkInformation = {
  saveData?: boolean
  effectiveType?: string
  downlink?: number
}

function connection() {
  return (navigator as Navigator & { connection?: NetworkInformation })
    .connection
}

function prefersPosterOnly() {
  const info = connection()
  if (!info) return false
  if (info.saveData) return true
  const type = info.effectiveType ?? ""
  return type === "slow-2g" || type === "2g"
}

function previewWidth(): 854 | 1280 {
  const info = connection()
  if (!info) return 854
  if ((info.downlink ?? 0) >= 5 || info.effectiveType === "4g") return 1280
  return 854
}

function resolveVideoSrc(item: StreamItem): string | null {
  if (item.videoKey) {
    return catalogPreviewVideoUrlFromKey(item.videoKey, previewWidth())
  }
  return item.video ?? null
}

function StreamCardMedia({
  item,
  active,
}: {
  item: StreamItem
  active: boolean
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [src, setSrc] = React.useState<string | null>(null)
  const [showVideo, setShowVideo] = React.useState(false)
  const triedOriginal = React.useRef(false)

  React.useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!active || reduce || prefersPosterOnly() || (!item.video && !item.videoKey)) {
      setSrc(null)
      setShowVideo(false)
      return
    }
    triedOriginal.current = false
    setSrc(resolveVideoSrc(item))
    setShowVideo(true)
  }, [active, item])

  React.useEffect(() => {
    const video = videoRef.current
    if (!video || !src || !showVideo) return
    video.muted = true
    void video.play().catch(() => {
      setShowVideo(false)
    })
  }, [src, showVideo])

  const poster = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.poster}
      alt=""
      loading="lazy"
      decoding="async"
      className="h-full w-full object-cover"
      draggable={false}
    />
  )

  if (!showVideo || !src) return poster

  return (
    <>
      {poster}
      <video
        ref={videoRef}
        src={src}
        poster={item.poster}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
        onError={() => {
          if (!triedOriginal.current && item.videoKey) {
            triedOriginal.current = true
            setSrc(catalogPublicVideoUrlFromKey(item.videoKey))
            return
          }
          if (!triedOriginal.current && item.video && src !== item.video) {
            triedOriginal.current = true
            setSrc(item.video)
            return
          }
          setShowVideo(false)
        }}
      />
    </>
  )
}

export type ImageStreamHeroProps = {
  images?: StreamItem[]
  leftImages?: StreamItem[]
  rightImages?: StreamItem[]
  cards?: number
  speed?: number
  axis?: number
  path?: CorridorPath
  children?: React.ReactNode
  className?: string
}

export function ImageStreamHero({
  images = [],
  leftImages,
  rightImages,
  speed = 18,
  axis = 55,
  path,
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & ImageStreamHeroProps) {
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "")
  const right = `ish-r-${id}`
  const left = `ish-l-${id}`
  const card = `ish-c-${id}`
  const p = React.useMemo(() => ({ ...PATH, ...path }), [path])
  const css = React.useMemo(
    () =>
      `${keyframes(1, right, p)}${keyframes(-1, left, p)}` +
      `@media(prefers-reduced-motion:reduce){.${card}{animation-play-state:paused}}`,
    [right, left, card, p]
  )
  const leftRail = leftImages ?? images
  const rightRail = rightImages ?? images
  const rails = [
    { name: right, items: rightRail },
    { name: left, items: leftRail },
  ] as const

  const rootRef = React.useRef<HTMLDivElement>(null)
  const [inView, setInView] = React.useState(false)

  React.useEffect(() => {
    const node = rootRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry?.isIntersecting ?? false),
      { rootMargin: "160px" }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={rootRef}
      className={cn("relative overflow-hidden", className)}
      {...props}
      style={{ containerType: "inline-size", ...props.style }}
    >
      <style>{css}</style>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          perspective: `${p.perspective}cqw`,
          perspectiveOrigin: `50% ${axis}%`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {rails.map(({ name, items }) =>
            items.map((item, i) => (
              <div
                key={`${name}-${item.poster}-${i}`}
                className={cn(
                  card,
                  "absolute overflow-hidden border border-white/15"
                )}
                style={{
                  left: "50%",
                  top: `${axis}%`,
                  width: `${p.cardWidth}cqw`,
                  height: `${p.cardHeight}cqw`,
                  marginLeft: `${-p.cardWidth / 2}cqw`,
                  marginTop: `${-p.cardHeight / 2}cqw`,
                  borderRadius: `${p.cardRadius}cqw`,
                  animation: `${name} ${speed}s linear infinite`,
                  animationDelay: `${-(i * speed) / Math.max(items.length, 1)}s`,
                  backfaceVisibility: "hidden",
                }}
              >
                <StreamCardMedia item={item} active={inView} />
              </div>
            ))
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

export default ImageStreamHero
