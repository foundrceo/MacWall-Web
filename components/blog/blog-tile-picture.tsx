"use client"

import {
  isRemoteBlogTile,
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
        unoptimized={isRemoteBlogTile(src)}
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
          unoptimized={isRemoteBlogTile(src)}
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
        unoptimized={isRemoteBlogTile(src)}
        onError={() => setFailed(true)}
      />
    </picture>
  )
}
