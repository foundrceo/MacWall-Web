"use client"

import {
  assignLatestWallpapersToRows,
  FEATURE_CAROUSEL_ROW_COUNT,
  type MarketingFeatureCarouselWallpaper,
} from "@/lib/marketing-feature-carousel-wallpapers"
import { cn } from "@/lib/utils"
import { useMemo, useState } from "react"

function CarouselThumb({
  posterUrl,
  thumbUrl,
}: Readonly<{
  posterUrl: string
  thumbUrl: string
}>) {
  const [src, setSrc] = useState(posterUrl)
  const [hidden, setHidden] = useState(false)

  if (hidden) return null

  return (
    <div className="relative aspect-video h-full w-auto shrink-0 overflow-hidden rounded-md bg-black/40 sm:rounded-lg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-full w-auto max-w-none object-cover"
        onError={() => {
          if (src !== thumbUrl) {
            setSrc(thumbUrl)
            return
          }
          setHidden(true)
        }}
      />
    </div>
  )
}

function MarqueeRow({
  rowItems,
  rowIndex,
  reverse,
}: Readonly<{
  rowItems: readonly MarketingFeatureCarouselWallpaper[]
  rowIndex: number
  reverse?: boolean
}>) {
  const trackItems = [...rowItems, ...rowItems]

  return (
    <div className="min-h-0 flex-1 overflow-hidden">
      <div
        className={cn(
          "flex h-full w-max items-center gap-2 pl-2 sm:gap-2.5 sm:pl-2.5",
          reverse
            ? "marketing-wallpaper-marquee-reverse"
            : "marketing-wallpaper-marquee"
        )}
        style={{ animationDuration: `${36 + rowIndex * 4}s` }}
      >
        {trackItems.map((wallpaper, index) => (
          <CarouselThumb
            key={`${wallpaper.id}-${rowIndex}-${index}`}
            posterUrl={wallpaper.posterUrl}
            thumbUrl={wallpaper.thumbUrl}
          />
        ))}
      </div>
    </div>
  )
}

export default function WallpaperBrowseCarousel({
  wallpapers,
}: Readonly<{
  wallpapers: readonly MarketingFeatureCarouselWallpaper[]
}>) {
  const rows = useMemo(
    () => assignLatestWallpapersToRows(wallpapers, FEATURE_CAROUSEL_ROW_COUNT),
    [wallpapers]
  )

  return (
    <div
      className="flex h-full w-full flex-col gap-1.5 bg-black/25 p-2 sm:gap-2 sm:p-3"
      aria-hidden
    >
      {rows.map((rowItems, rowIndex) => (
        <MarqueeRow
          key={rowIndex}
          rowItems={rowItems}
          rowIndex={rowIndex}
          reverse={rowIndex % 2 === 1}
        />
      ))}
    </div>
  )
}
