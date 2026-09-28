"use client"

import {
  blogThumbAvifSrc,
  type BlogTileImageVariant,
} from "@/lib/blog/tile-media"
import Image from "next/image"
import { useState, type ReactNode } from "react"

const HERO_WIDTH = 1286
const HERO_HEIGHT = 724
const TILE_WIDTH = 940
const TILE_HEIGHT = 529

/** Browsers that decode AVIF take the ~75% smaller sibling; others keep the JPEG. */
function WithAvif({
  src,
  className,
  children,
}: Readonly<{ src: string; className?: string; children: ReactNode }>) {
  const avif = blogThumbAvifSrc(src)
  return (
    <picture className={className}>
      {avif ? <source srcSet={avif} type="image/avif" /> : null}
      {children}
    </picture>
  )
}

export function BlogTilePicture({
  src,
  alt,
  variant,
  priority,
}: Readonly<{
  src: string
  alt: string
  variant: BlogTileImageVariant
  priority?: boolean
}>) {
  const [failed, setFailed] = useState(false)

  if (failed || !src) {
    if (variant === "curated") {
      return <div className="absolute inset-0 bg-white/[0.06]" aria-hidden />
    }
    return null
  }

  if (variant === "list") {
    return (
      <WithAvif src={src}>
        <Image
          src={src}
          alt={alt}
          width={120}
          height={120}
          className="viewport-image tile__image tile__image--square"
          loading={priority ? "eager" : undefined}
          fetchPriority={priority ? "high" : undefined}
          unoptimized
          onError={() => setFailed(true)}
        />
      </WithAvif>
    )
  }

  if (variant === "curated") {
    return (
      <WithAvif src={src}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="size-full object-cover"
          loading={priority ? "eager" : undefined}
          fetchPriority={priority ? "high" : undefined}
          unoptimized
          onError={() => setFailed(true)}
        />
      </WithAvif>
    )
  }

  if (variant === "hero") {
    return (
      <WithAvif src={src} className="viewport-picture">
        <Image
          src={src}
          alt={alt}
          width={HERO_WIDTH}
          height={HERO_HEIGHT}
          className="viewport-image tile__image"
          loading={priority ? "eager" : undefined}
          fetchPriority={priority ? "high" : undefined}
          unoptimized
          onError={() => setFailed(true)}
        />
      </WithAvif>
    )
  }

  return (
    <WithAvif src={src} className="viewport-picture">
      <Image
        src={src}
        alt={alt}
        width={TILE_WIDTH}
        height={TILE_HEIGHT}
        className="viewport-image tile__image"
        loading={priority ? "eager" : undefined}
        fetchPriority={priority ? "high" : undefined}
        unoptimized
        onError={() => setFailed(true)}
      />
    </WithAvif>
  )
}
