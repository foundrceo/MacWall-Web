import type { Metadata } from "next"
import type { ReactNode } from "react"

import { MARKETING_GALLERY_WALLPAPERS_FALLBACK } from "@/lib/marketing-gallery-wallpapers"
import { macwall, macwallAppIconPath } from "@/lib/macwall-site"

/**
 * Source for the site's share image (`/public/og-share.jpg`). It is drawn with
 * the site's own fonts and captured at 1200 × 630 by headless Chrome:
 *
 *   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
 *     --hide-scrollbars --window-size=1200,630 --force-device-scale-factor=2 \
 *     --virtual-time-budget=8000 --screenshot=og@2x.png \
 *     "http://localhost:3000/og-render"
 *
 * then scaled to 1200 × 630. The default is the live image; `?v=poster` and
 * `?v=wall` are the alternatives. Not for visitors.
 */
export const metadata: Metadata = {
  title: "Share image",
  robots: { index: false, follow: false },
}

const DESKTOP = "/og/bmw-desktop.jpg"
const HEADLINE_SERIF = "font-display tracking-tight text-white"

function Frame({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-screen items-start justify-start bg-black">
      {/* Keep the dev-mode Next.js badge out of the capture. */}
      <style>{"nextjs-portal{display:none!important}"}</style>
      <div className="relative isolate h-[630px] w-[1200px] shrink-0 overflow-hidden bg-[#0a0a0a]">
        {children}
      </div>
    </div>
  )
}

function Brand({ size = 44 }: Readonly<{ size?: number }>) {
  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element -- static capture */}
      <img
        src={macwallAppIconPath}
        alt=""
        width={size}
        height={size}
        className="rounded-[22.37%] shadow-[0_6px_20px_rgb(0_0_0/0.5)]"
        style={{ width: size, height: size }}
      />
      <span
        className="font-medium tracking-[-0.01em] text-white"
        style={{ fontSize: Math.round(size * 0.66) }}
      >
        {macwall.name}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Split: words left, the Mac screen running off the right edge        */
/* ------------------------------------------------------------------ */

function Split() {
  return (
    <Frame>
      {/* eslint-disable-next-line @next/next/no-img-element -- glow source */}
      <img
        src={DESKTOP}
        alt=""
        className="absolute top-[120px] left-[600px] -z-10 h-[460px] w-[700px] object-cover opacity-55 blur-[80px] saturate-150"
      />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_70%_at_0%_0%,rgb(255_255_255/0.07),transparent_70%)]" />

      <div className="absolute top-[64px] left-[72px] w-[480px]">
        <Brand />
        <p className={`${HEADLINE_SERIF} mt-9 text-[64px] leading-[1.02]`}>
          Cinematic 4K
          <br />
          live wallpapers,
          <br />
          <span className="text-white/45">built for Mac.</span>
        </p>
        <p className="mt-7 text-[21px] leading-snug text-white/60">
          1,000+ wallpapers for your desktop,
          <br />
          Lock Screen and screen saver.
        </p>
      </div>

      <div className="absolute top-[86px] left-[590px] w-[820px] rounded-[24px] bg-linear-to-b from-white/[0.2] to-white/[0.05] p-2.5 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/15">
        {/* eslint-disable-next-line @next/next/no-img-element -- static capture */}
        <img
          src={DESKTOP}
          alt=""
          className="block aspect-[2000/1298] w-full rounded-[16px] object-cover"
        />
      </div>
    </Frame>
  )
}

/* ------------------------------------------------------------------ */
/* Poster: the desktop fills the card; the words sit in the night sky  */
/* ------------------------------------------------------------------ */

function Poster() {
  return (
    <Frame>
      {/* The wallpaper alone: menu bar and Dock cropped away. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- static capture */}
      <img
        src={DESKTOP}
        alt=""
        className="absolute -z-10 max-w-none"
        style={{ width: 1420, top: -92, left: -150 }}
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-black/70 via-transparent via-45% to-black/60" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_50%_60%,transparent_55%,rgb(0_0_0/0.55))]" />

      <div className="flex flex-col items-center pt-[46px] text-center">
        <Brand size={40} />
        <p className={`${HEADLINE_SERIF} mt-5 text-[60px] leading-[1.04] [text-shadow:0_2px_30px_rgb(0_0_0/0.6)]`}>
          Cinematic 4K live wallpapers,
          <br />
          <span className="text-white/55">built for Mac.</span>
        </p>
      </div>

      <div className="absolute inset-x-[56px] bottom-[40px] flex items-end justify-between text-[20px] text-white/80 [text-shadow:0_1px_12px_rgb(0_0_0/0.7)]">
        <span>1,000+ live wallpapers · Desktop & Lock Screen</span>
        <span className="font-medium text-white">macwall.app</span>
      </div>
    </Frame>
  )
}

/* ------------------------------------------------------------------ */
/* Wall: a tilted mosaic of real wallpapers around the brand           */
/* ------------------------------------------------------------------ */

function Wall() {
  const all = MARKETING_GALLERY_WALLPAPERS_FALLBACK
  const rows = [0, 6, 12, 3].map((offset) =>
    Array.from({ length: 7 }, (_, i) => all[(offset + i) % all.length]!)
  )
  return (
    <Frame>
      <div className="absolute top-1/2 left-1/2 -z-10 flex w-[1700px] -translate-x-1/2 -translate-y-1/2 -rotate-[8deg] flex-col gap-4">
        {rows.map((row, index) => (
          <div
            key={index}
            className="flex gap-4"
            style={{ marginLeft: index % 2 ? -120 : 0 }}
          >
            {row.map((w, i) => (
              // eslint-disable-next-line @next/next/no-img-element -- static capture
              <img
                key={`${w.id}-${i}`}
                src={w.posterUrl}
                alt=""
                className="aspect-[16/10] w-[240px] shrink-0 rounded-[14px] object-cover ring-1 ring-white/10"
              />
            ))}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(48%_58%_at_50%_50%,rgb(10_10_10/0.94)_30%,rgb(10_10_10/0.55)_65%,rgb(10_10_10/0.15))]" />

      <div className="flex h-full flex-col items-center justify-center text-center">
        <Brand size={52} />
        <p className={`${HEADLINE_SERIF} mt-7 text-[62px] leading-[1.04]`}>
          Cinematic 4K live wallpapers,
          <br />
          <span className="text-white/50">built for Mac.</span>
        </p>
      </div>
    </Frame>
  )
}

export default async function OgRenderPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}>) {
  const { v } = await searchParams
  if (v === "poster") return <Poster />
  if (v === "wall") return <Wall />
  // The live share image.
  return <Split />
}
