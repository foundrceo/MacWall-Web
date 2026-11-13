"use client"

import { Heart, ImageOff } from "lucide-react"
import { useState } from "react"

import { Badge, Skeleton } from "@/components/admin/ui"
import { formatDuration } from "@/lib/admin/format"
import { cn } from "@/lib/utils"

import type { Wallpaper } from "./catalog"

/** Two columns on phones, then as many 180px+ columns as fit the pane. */
const GRID =
  "grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] sm:gap-x-4 sm:gap-y-6"

export function WallpaperGrid({
  wallpapers,
  selectedId,
  onSelect,
  stale = false,
}: Readonly<{
  wallpapers: readonly Wallpaper[]
  selectedId: string | null
  onSelect: (wallpaper: Wallpaper) => void
  /** Dim the list while the one for the current filters loads. */
  stale?: boolean
}>) {
  return (
    <ul
      aria-label="Wallpapers"
      aria-busy={stale}
      className={cn(
        GRID,
        "transition-opacity duration-150 motion-reduce:transition-none",
        stale && "opacity-50"
      )}
    >
      {wallpapers.map((wallpaper) => (
        <li key={wallpaper.id} className="min-w-0">
          <WallpaperCard
            wallpaper={wallpaper}
            selected={wallpaper.id === selectedId}
            onSelect={onSelect}
          />
        </li>
      ))}
    </ul>
  )
}

function WallpaperCard({
  wallpaper,
  selected,
  onSelect,
}: Readonly<{
  wallpaper: Wallpaper
  selected: boolean
  onSelect: (wallpaper: Wallpaper) => void
}>) {
  const [thumbFailed, setThumbFailed] = useState(false)
  const facts = [
    wallpaper.category,
    wallpaper.resolution,
    formatDuration(wallpaper.durationSeconds),
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <button
      type="button"
      onClick={() => onSelect(wallpaper)}
      aria-current={selected ? "true" : undefined}
      className="group flex w-full min-w-0 flex-col rounded-lg text-left outline-none"
    >
      <span
        className={cn(
          "bg-fill relative block aspect-video w-full overflow-hidden rounded-lg transition-shadow duration-150 motion-reduce:transition-none",
          selected
            ? "ring-blue ring-2 ring-offset-2 ring-offset-background group-focus-visible:ring-[3px]"
            : "group-hover:ring-line-strong ring-1 ring-border group-focus-visible:ring-2 group-focus-visible:ring-ring"
        )}
      >
        {thumbFailed ? (
          <span className="text-faint absolute inset-0 grid place-items-center">
            <ImageOff aria-hidden className="size-5" />
          </span>
        ) : (
          // The CDN thumb is already sized; next/image would re-encode it.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={wallpaper.thumbUrl}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setThumbFailed(true)}
            className="absolute inset-0 size-full object-cover"
          />
        )}
      </span>

      <span className="mt-2.5 flex items-center justify-between gap-2">
        <span className="truncate text-[13px] font-medium text-foreground">
          {wallpaper.name}
        </span>
        <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground tabular-nums">
          <Heart aria-hidden className="text-faint size-3" />
          {wallpaper.likeCount.toLocaleString()}
          <span className="sr-only"> likes</span>
        </span>
      </span>
      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
        {facts}
      </span>
      <span className="mt-2 flex flex-wrap gap-1">
        <Badge tone={wallpaper.isPro ? "violet" : "neutral"}>
          {wallpaper.isPro ? "Pro" : "Free"}
        </Badge>
        {wallpaper.isFeatured ? <Badge tone="blue">Featured</Badge> : null}
        {wallpaper.isCuratedPick ? <Badge tone="green">Pick</Badge> : null}
      </span>
    </button>
  )
}

/** First-load placeholder with the same grid and card shape. */
export function WallpaperGridSkeleton({
  count = 15,
}: Readonly<{ count?: number }>) {
  return (
    <div role="status" aria-label="Loading wallpapers" className={GRID}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="min-w-0">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="mt-3 h-3.5 w-3/5" />
          <Skeleton className="mt-2 h-3 w-4/5" />
          <Skeleton className="mt-2.5 h-5 w-10" />
        </div>
      ))}
    </div>
  )
}
