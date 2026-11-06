"use client"

import {
  blogThumbAvifSrc,
  blogThumbSrcSets,
  type BlogTileImageVariant,
} from "@/lib/blog/tile-media"
import { useState } from "react"

const HERO_WIDTH = 1286
const HERO_HEIGHT = 724
const TILE_WIDTH = 940
const TILE_HEIGHT = 529
/** The mockups are 1200×800 (3:2); the 640 copy has the same shape. */
const MOCKUP_WIDTH = 1200
const MOCKUP_HEIGHT = 800

/** Grid tiles: a third of the row on desktop, half on tablets, full on phones. */
const DEFAULT_SIZES = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"

/**
 * A blog mockup as `<picture>`: AVIF first (~75% smaller), JPEG fallback,
 * each with the 640 and 1200 widths so narrow tiles download the small copy.
 * Plain `<img>`, not next/image: the files are pre-sized in /public, and
 * next/image can't take a hand-written `srcset`. Only the article cover is
 * `priority`; everything below the fold lazy-loads.
 */
export function BlogTilePicture({
  src,
  alt,
  variant,
  priority,
  sizes = DEFAULT_SIZES,
}: Readonly<{
  src: string
  alt: string
  variant: BlogTileImageVariant
  priority?: boolean
  /** `sizes` for the 640/1200 `srcset`; tiles default to the grid widths. */
  sizes?: string
}>) {
  const [failed, setFailed] = useState(false)

  if (failed || !src) {
    if (variant === "curated") {
      return <div className="absolute inset-0 bg-white/[0.06]" aria-hidden />
    }
    return null
  }

  const avif = blogThumbAvifSrc(src)
  const srcSets = variant === "list" ? null : blogThumbSrcSets(src)
  const loading = priority ? ("eager" as const) : ("lazy" as const)
  const fetchPriority = priority ? ("high" as const) : undefined

  const dimensions =
    variant === "list"
      ? { width: 120, height: 120 }
      : variant === "hero"
        ? { width: HERO_WIDTH, height: HERO_HEIGHT }
        : variant === "curated"
          ? { width: MOCKUP_WIDTH, height: MOCKUP_HEIGHT }
          : { width: TILE_WIDTH, height: TILE_HEIGHT }

  const className =
    variant === "list"
      ? "viewport-image tile__image tile__image--square"
      : variant === "curated"
        ? "absolute inset-0 size-full object-cover"
        : "viewport-image tile__image"

  return (
    <picture
      className={
        variant === "hero" || variant === "tile"
          ? "viewport-picture"
          : undefined
      }
    >
      {srcSets ? (
        <source srcSet={srcSets.avif} sizes={sizes} type="image/avif" />
      ) : avif ? (
        <source srcSet={avif} type="image/avif" />
      ) : null}
      <img
        src={src}
        srcSet={srcSets?.jpeg}
        sizes={srcSets ? sizes : undefined}
        alt={alt}
        {...dimensions}
        className={className}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding={priority ? "sync" : "async"}
        onError={() => setFailed(true)}
      />
    </picture>
  )
}
