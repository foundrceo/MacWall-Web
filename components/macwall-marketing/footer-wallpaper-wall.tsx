"use client"

import Link from "next/link"
import { useState, type CSSProperties } from "react"

import { cn } from "@/lib/utils"

export type WallTile = {
  id: string
  name: string
  href: string
  posterUrl: string
  videoUrl: string
}

/**
 * Two rows of real wallpapers drifting in opposite directions. Each tile
 * plays its clip under the pointer and opens the wallpaper. Rows pause on
 * hover; with reduced motion they stand still (styles: `.mw-marquee`).
 */
export function WallpaperWall({ rows }: Readonly<{ rows: WallTile[][] }>) {
  return (
    <div className="flex flex-col gap-3">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="mw-marquee"
          style={{ "--marquee-duration": `${70 + rowIndex * 12}s` } as CSSProperties}
        >
          <ul
            className="mw-marquee-track gap-3 pr-3"
            style={rowIndex % 2 ? { animationDirection: "reverse" } : undefined}
          >
            {[...row, ...row].map((tile, index) => (
              <li
                key={`${tile.id}-${index}`}
                // Only the first pass is real; the rest is the loop's repeat.
                aria-hidden={index >= row.length || undefined}
              >
                <Tile tile={tile} focusable={index < row.length} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function Tile({ tile, focusable }: Readonly<{ tile: WallTile; focusable: boolean }>) {
  const [playing, setPlaying] = useState(false)
  return (
    <Link
      href={tile.href}
      tabIndex={focusable ? undefined : -1}
      onPointerEnter={() => setPlaying(true)}
      onPointerLeave={() => setPlaying(false)}
      onFocus={() => setPlaying(true)}
      onBlur={() => setPlaying(false)}
      className="group relative block aspect-[16/10] w-56 overflow-hidden rounded-xl bg-white/[0.04] ring-1 ring-white/10 outline-none transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-white/50 sm:w-64"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tile.posterUrl}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-cover"
      />
      {playing ? (
        <video
          src={tile.videoUrl}
          muted
          loop
          autoPlay
          playsInline
          aria-hidden
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
      <span
        className={cn(
          "absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 to-transparent px-3 pt-6 pb-2.5 text-left text-[12px] font-medium text-white transition-opacity",
          "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
        )}
      >
        {tile.name}
      </span>
    </Link>
  )
}
