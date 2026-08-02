"use client"

import {
  type BlogTileImageVariant,
} from "@/lib/blog/tile-media"
import Image from "next/image"
import { useState } from "react"

const HERO_WIDTH = 1286
const HERO_HEIGHT = 724
const TILE_WIDTH = 940
const TILE_HEIGHT = 529

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
      <Image
        src={src}
        alt={alt}
        width={120}
        height={120}
        className="viewport-image tile__image tile__image--square"
        priority={priority}
        unoptimized
        onError={() => setFailed(true)}
      />
    )
  }

  if (variant === "curated") {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="size-full object-cover"
        priority={priority}
        unoptimized
        onError={() => setFailed(true)}
      />
    )
  }

  if (variant === "hero") {
    return (
      <picture className="viewport-picture">
        <Image
          src={src}
          alt={alt}
          width={HERO_WIDTH}
          height={HERO_HEIGHT}
          className="viewport-image tile__image"
          priority={priority}
          unoptimized
          onError={() => setFailed(true)}
        />
      </picture>
    )
  }

  return (
    <picture className="viewport-picture">
      <Image
        src={src}
        alt={alt}
        width={TILE_WIDTH}
        height={TILE_HEIGHT}
        className="viewport-image tile__image"
        priority={priority}
        unoptimized
        onError={() => setFailed(true)}
      />
    </picture>
  )
}
