"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import {
  DISPLAY_PAGES_PATH,
  displayPagePathFor,
  displayResolutionLabel,
  macDisplayPagePath,
  macDisplays,
  macDisplaysAtResolution,
  type MacDisplay,
} from "@/lib/seo/mac-displays"
import { cn } from "@/lib/utils"

type WallpaperLink = { href: string; label: string }

/**
 * Where to find wallpapers for the screen this page is on: the Mac whose
 * native resolution it renders at, else an ultrawide or 4K monitor by shape
 * and size, else the list of every display page.
 */
function wallpaperLinks(
  rendered: { width: number; height: number },
  native: readonly MacDisplay[]
): WallpaperLink[] {
  if (native.length > 0) {
    const byPage = new Map<string, MacDisplay>()
    for (const display of native) {
      if (!byPage.has(display.page)) byPage.set(display.page, display)
    }
    return [...byPage.values()].map((display) => ({
      href: macDisplayPagePath(display),
      label: `Wallpapers that fit your ${display.shortName}`,
    }))
  }
  const long = Math.max(rendered.width, rendered.height)
  const short = Math.min(rendered.width, rendered.height)
  if (long / short >= 2.3) {
    return [
      {
        href: displayPagePathFor("ultrawide"),
        label: "Wallpapers for ultrawide monitors",
      },
    ]
  }
  if (long >= 3840 && short >= 2160) {
    return [
      {
        href: displayPagePathFor("4k"),
        label: "4K wallpapers that fill this screen",
      },
    ]
  }
  return [{ href: DISPLAY_PAGES_PATH, label: "Find wallpapers for your Mac" }]
}

type Reading = {
  width: number
  height: number
  dpr: number
  colorDepth: number
  windowWidth: number
  windowHeight: number
}

function read(): Reading {
  return {
    width: window.screen.width,
    height: window.screen.height,
    dpr: window.devicePixelRatio || 1,
    colorDepth: window.screen.colorDepth,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
  }
}

/**
 * What the browser reports about the screen this page is on, compared with
 * Apple's native resolutions. Nothing is stored or sent.
 */
export function ScreenResolution() {
  const [reading, setReading] = useState<Reading | null>(null)

  useEffect(() => {
    const update = () => setReading(read())
    update()
    window.addEventListener("resize", update)
    // devicePixelRatio changes when the window moves to another display.
    const media = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`
    )
    media.addEventListener("change", update)
    return () => {
      window.removeEventListener("resize", update)
      media.removeEventListener("change", update)
    }
  }, [])

  const rendered = reading
    ? {
        width: Math.round(reading.width * reading.dpr),
        height: Math.round(reading.height * reading.dpr),
      }
    : null
  const native = rendered
    ? macDisplaysAtResolution(rendered.width, rendered.height)
    : []
  const links = rendered ? wallpaperLinks(rendered, native) : []

  const rows = reading
    ? [
        { label: "Looks like", value: `${reading.width} × ${reading.height}` },
        {
          label: "Pixel density",
          value: `${reading.dpr}×${reading.dpr >= 2 ? " (Retina)" : ""}`,
        },
        {
          label: "Rendered pixels",
          value: `${rendered!.width} × ${rendered!.height}`,
        },
        {
          label: "Browser window",
          value: `${reading.windowWidth} × ${reading.windowHeight}`,
        },
        { label: "Color depth", value: `${reading.colorDepth}-bit` },
      ]
    : []

  return (
    <section
      aria-label="Your screen"
      aria-live="polite"
      className="flex flex-col gap-5 rounded-[28px] bg-surface-1 p-4 squircle sm:p-6"
    >
      <div className="flex flex-col items-center gap-1 py-4 text-center">
        <p className="text-[13px] text-ink-3">This screen renders</p>
        <p className="font-display text-[44px] leading-[52px] tracking-tight text-white tabular-nums sm:text-[56px] sm:leading-[64px]">
          {rendered ? `${rendered.width} × ${rendered.height}` : "Reading…"}
        </p>
        <p className="max-w-[440px] text-[15px] leading-6 text-balance text-ink-2">
          {native.length > 0
            ? `That's the native resolution of the ${native.map((d) => d.name).join(" and the ")}, so this screen is at its default setting.`
            : "That doesn't match a Mac's native resolution, so this is a scaled setting or a non-Apple display."}
        </p>
        {links.length > 0 ? (
          <ul className="mt-3 flex flex-wrap justify-center gap-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex h-10 items-center rounded-full bg-white px-4 text-[14px] font-medium text-black transition-colors duration-150 hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <dl className="rounded-[20px] bg-surface-2 px-4 squircle sm:px-5">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={cn(
              "flex items-baseline justify-between gap-4 py-3",
              i > 0 && "border-t border-hairline"
            )}
          >
            <dt className="text-[14px] text-ink-3">{row.label}</dt>
            <dd className="text-[15px] text-white tabular-nums">{row.value}</dd>
          </div>
        ))}
      </dl>

      {rendered ? (
        <p className="text-[14px] leading-6 text-ink-2">
          To make a wallpaper for this exact setting, use {rendered.width} ×{" "}
          {rendered.height}. For any setting, use the native resolution in the
          table below, or{" "}
          <Link
            href="/tools/wallpaper-resizer"
            className="text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
          >
            crop an image to it
          </Link>
          .
        </p>
      ) : null}

      <p className="text-[13px] leading-5 text-ink-3">
        On several displays, drag this window to the one you want and the
        numbers update. Current Macs:{" "}
        {macDisplays
          .filter((d) => d.current)
          .slice(0, 4)
          .map((d) => `${d.shortName} ${displayResolutionLabel(d)}`)
          .join(", ")}
        .
      </p>
    </section>
  )
}
