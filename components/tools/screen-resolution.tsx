"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { displayResolutionLabel, macDisplays } from "@/lib/seo/mac-displays"
import { cn } from "@/lib/utils"

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
    ? macDisplays.filter(
        (d) => d.width === rendered.width && d.height === rendered.height
      )
    : []

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
        { label: "Colour depth", value: `${reading.colorDepth}-bit` },
      ]
    : []

  return (
    <section
      aria-label="Your screen"
      aria-live="polite"
      className="flex flex-col gap-5 rounded-[28px] bg-white/[0.035] p-4 ring-1 ring-white/[0.08] ring-inset sm:p-6"
    >
      <div className="flex flex-col items-center gap-1 py-4 text-center">
        <p className="text-[13px] text-white/45">This screen renders</p>
        <p className="font-display text-[44px] leading-[52px] tracking-tight text-white tabular-nums sm:text-[56px] sm:leading-[64px]">
          {rendered ? `${rendered.width} × ${rendered.height}` : "Reading…"}
        </p>
        <p className="max-w-[440px] text-[15px] leading-6 text-balance text-white/70">
          {native.length > 0
            ? `That's the native resolution of the ${native.map((d) => d.name).join(" and the ")}, so this screen is at its default setting.`
            : "That doesn't match a Mac's native resolution, so this is a scaled setting or a non-Apple display."}
        </p>
      </div>

      <dl className="rounded-[20px] bg-black/30 px-4 ring-1 ring-white/[0.06] ring-inset sm:px-5">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={cn(
              "flex items-baseline justify-between gap-4 py-3",
              i > 0 && "border-t border-white/[0.08]"
            )}
          >
            <dt className="text-[14px] text-white/45">{row.label}</dt>
            <dd className="text-[15px] text-white tabular-nums">{row.value}</dd>
          </div>
        ))}
      </dl>

      {rendered ? (
        <p className="text-[14px] leading-6 text-white/70">
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

      <p className="text-[13px] leading-5 text-white/45">
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
