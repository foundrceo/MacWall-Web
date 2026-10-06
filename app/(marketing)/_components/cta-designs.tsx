import type { CSSProperties } from "react"

import { MacWallAppIcon } from "@/components/macwall-app-icon"
import { DeferredVideo } from "@/components/macwall-marketing/deferred-video"
import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import {
  MARKETING_GALLERY_WALLPAPERS_FALLBACK,
  type MarketingGalleryWallpaper,
} from "@/lib/marketing-gallery-wallpapers"
import { macwall, macwallMinimumMacOSVersion } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

import { HeroActions } from "./hero-actions"
import { HeroBadge } from "./hero-badge"

/**
 * Candidates for the closing call to action, compared on /cta-lab. Every one
 * uses the hero's own actions (Download + License on a Mac, the send-to-Mac
 * flow on a phone, and the live regional price underneath).
 */
export type CtaVariant =
  | "wall"
  | "split"
  | "card"
  | "beams"
  | "icon"
  | "marquee"

const headline =
  "font-display font-normal tracking-tight text-balance text-foreground"

function wallpapers(count: number, offset = 0): MarketingGalleryWallpaper[] {
  const all = MARKETING_GALLERY_WALLPAPERS_FALLBACK
  return Array.from({ length: count }, (_, i) => all[(i + offset) % all.length]!)
}

/** A still poster tile; decorative wherever it is used. */
function Poster({
  wallpaper,
  className,
  eager,
}: Readonly<{
  wallpaper: MarketingGalleryWallpaper
  className?: string
  /** Tiles moved by a transform can be missed by lazy loading. */
  eager?: boolean
}>) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={wallpaper.posterUrl}
      alt=""
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={cn("block object-cover", className)}
    />
  )
}

/* ------------------------------------------------------------------ */
/* 1 · Wallpaper wall                                                  */
/* ------------------------------------------------------------------ */

/**
 * Three tilted rows of real wallpapers drift behind the ask, dimmed toward
 * the centre so the words stay crisp: the product is the backdrop.
 * (After 21st.dev "Promo Section", bundui.)
 */
function WallCta() {
  const rows = [wallpapers(7, 0), wallpapers(7, 7), wallpapers(7, 13)]
  return (
    <MarketingSection className="relative isolate overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 flex w-[160%] -translate-x-1/2 -translate-y-1/2 -rotate-6 flex-col gap-3 opacity-80">
          {rows.map((row, index) => (
            <div
              key={index}
              className={cn("mw-drift gap-3", index % 2 && "mw-drift-reverse")}
              style={{ "--drift-duration": `${90 + index * 20}s` } as CSSProperties}
            >
              {[...row, ...row].map((w, i) => (
                <Poster
                  key={`${w.id}-${i}`}
                  wallpaper={w}
                  eager
                  className="aspect-[16/10] w-56 rounded-xl sm:w-72"
                />
              ))}
            </div>
          ))}
        </div>
        {/* Dim behind the words only; the wallpapers stay vivid at the edges. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_38%_42%_at_50%_50%,color-mix(in_oklab,var(--background)_92%,transparent)_35%,color-mix(in_oklab,var(--background)_55%,transparent)_70%,transparent)]" />
        <div className="absolute inset-0 bg-linear-to-b from-background/80 via-transparent to-background/80" />
      </div>
      <div className="flex flex-col items-center px-6 py-24 text-center md:py-32">
        <h2 className={cn(headline, "max-w-2xl text-4xl md:text-6xl")}>
          1,000+ wallpapers. One click to set.
        </h2>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground md:text-base">
          Anime, nature, cars, gaming, space. They move, and your Mac barely
          notices.
        </p>
        <div className="mt-8">
          <HeroActions location="bottom_cta" />
        </div>
      </div>
    </MarketingSection>
  )
}

/* ------------------------------------------------------------------ */
/* 2 · Split with gallery                                              */
/* ------------------------------------------------------------------ */

/**
 * The ask on the left; a staggered two-column gallery on the right, one tile
 * playing live. (After 21st.dev "CTA Section with Floating Gallery".)
 */
function SplitCta() {
  const [live, ...rest] = wallpapers(6, 7)
  const columns = [rest.slice(0, 2), rest.slice(2, 5)]
  return (
    <MarketingSection className="overflow-hidden">
      <div className="grid grid-cols-1 items-center gap-12 px-6 py-16 md:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16 lg:px-8 lg:py-0">
        <div className="lg:py-24">
          <p className="text-[13px] font-medium text-muted-foreground">
            1,000+ live wallpapers
          </p>
          <h2 className={cn(headline, "mt-3 text-4xl md:text-6xl")}>
            Make your Mac feel alive.
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground md:text-base">
            Pick a wallpaper, click Set, done. It pauses itself behind
            full-screen apps and on battery.
          </p>
          <div className="mt-8">
            <HeroActions location="bottom_cta" align="start" />
          </div>
        </div>
        <div
          aria-hidden
          className="relative h-[26rem] [mask-image:linear-gradient(to_bottom,transparent,#000_15%,#000_85%,transparent)] lg:h-[34rem]"
        >
          <div className="grid h-full grid-cols-2 gap-3">
            <div className="flex flex-col gap-3 pt-10">
              {live ? (
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-white/10">
                  <DeferredVideo
                    src={live.videoUrl}
                    poster={live.posterUrl}
                    label=""
                  />
                </div>
              ) : null}
              {columns[0]!.map((w) => (
                <Poster
                  key={w.id}
                  wallpaper={w}
                  className="aspect-[4/5] w-full rounded-2xl ring-1 ring-white/10"
                />
              ))}
            </div>
            <div className="flex -translate-y-16 flex-col gap-3">
              {columns[1]!.map((w) => (
                <Poster
                  key={w.id}
                  wallpaper={w}
                  className="aspect-[4/5] w-full rounded-2xl ring-1 ring-white/10"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </MarketingSection>
  )
}

/* ------------------------------------------------------------------ */
/* 3 · Serif card                                                      */
/* ------------------------------------------------------------------ */

/** Film grain, as an SVG noise texture. */
const grain =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")"

/**
 * One soft, grainy card: an eyebrow pill, a two-line serif headline with the
 * second line hushed, and the actions. (After 21st.dev "Dithered Shader CTA".)
 */
function CardCta() {
  return (
    <MarketingSection className="px-4 py-10 md:px-6 md:py-14">
      <div className="relative isolate overflow-hidden rounded-3xl bg-[#101010] px-6 py-20 text-center ring-1 ring-white/10 md:py-28">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(60%_80%_at_50%_0%,rgb(255_255_255/0.14),transparent_70%),radial-gradient(40%_60%_at_85%_100%,rgb(255_255_255/0.06),transparent_70%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-[0.18] mix-blend-overlay"
          style={{ backgroundImage: grain }}
        />
        <span className="inline-flex h-7 items-center rounded-full bg-white/10 px-3 text-[12px] font-medium text-white/80 ring-1 ring-white/10">
          Made for macOS
        </span>
        <h2 className={cn(headline, "mt-6 text-5xl leading-[1.02] md:text-7xl")}>
          <span className="block">Your desktop,</span>
          <span className="block text-white/40">finally alive.</span>
        </h2>
        <div className="mt-10 flex justify-center">
          <HeroActions location="bottom_cta" />
        </div>
      </div>
    </MarketingSection>
  )
}

/* ------------------------------------------------------------------ */
/* 4 · Light beams                                                     */
/* ------------------------------------------------------------------ */

const beamColumns = [
  { left: "12%", delay: "0s", duration: "7s" },
  { left: "28%", delay: "2.4s", duration: "6s" },
  { left: "44%", delay: "4.1s", duration: "8s" },
  { left: "60%", delay: "1.2s", duration: "6.5s" },
  { left: "76%", delay: "3.3s", duration: "7.5s" },
  { left: "90%", delay: "5.2s", duration: "6s" },
]

/**
 * A fine grid of columns fading out from the centre, with lights falling
 * down a few of them; the hero's "new" badge on top.
 * (After 21st.dev "Download Section with Column Lines", scrollxui.)
 */
function BeamsCta() {
  return (
    <MarketingSection className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_80%_at_50%_45%,#000_30%,transparent_75%)]"
      >
        <div className="absolute inset-0 bg-[repeating-linear-gradient(to_right,rgb(255_255_255/0.06)_0,rgb(255_255_255/0.06)_1px,transparent_1px,transparent_calc(100%/12))]" />
        {beamColumns.map((beam) => (
          <span
            key={beam.left}
            className="mw-beam-fall absolute top-0 h-24 w-px bg-linear-to-b from-transparent via-white/70 to-transparent"
            style={
              {
                left: beam.left,
                "--beam-delay": beam.delay,
                "--beam-duration": beam.duration,
              } as CSSProperties
            }
          />
        ))}
        <div className="absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(50%_60%_at_50%_0%,rgb(255_255_255/0.08),transparent)]" />
      </div>
      <div className="flex flex-col items-center px-6 py-24 text-center md:py-32">
        <HeroBadge />
        <h2 className={cn(headline, "mt-6 max-w-3xl text-4xl md:text-6xl")}>
          Download MacWall for Mac
        </h2>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground md:text-base">
          A native app, about a minute to set up. No account needed.
        </p>
        <div className="mt-8">
          <HeroActions location="bottom_cta" />
        </div>
      </div>
    </MarketingSection>
  )
}

/* ------------------------------------------------------------------ */
/* 5 · App icon                                                        */
/* ------------------------------------------------------------------ */

/**
 * Apple's product-page close: the app icon, glowing in its own colours, the
 * name, one line, the actions, and three plain facts underneath.
 */
function IconCta() {
  const facts = [
    "No account needed",
    "Pauses behind full-screen apps",
    `${macwallMinimumMacOSVersion} or later`,
  ]
  return (
    <MarketingSection>
      <div className="flex flex-col items-center px-6 py-20 text-center md:py-28">
        <div className="relative">
          <div aria-hidden className="absolute inset-0 scale-110 opacity-70 blur-2xl">
            <MacWallAppIcon size={112} aria-hidden />
          </div>
          <MacWallAppIcon size={112} aria-hidden className="relative" />
        </div>
        <h2 className={cn(headline, "mt-8 text-5xl md:text-6xl")}>{macwall.name}</h2>
        <p className="mt-3 text-[17px] text-muted-foreground">
          Live wallpapers for your Mac.
        </p>
        <div className="mt-8">
          <HeroActions location="bottom_cta" />
        </div>
        <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] text-white/45">
          {facts.map((fact) => (
            <li key={fact} className="flex items-center gap-2">
              <span aria-hidden className="size-1 rounded-full bg-white/30" />
              {fact}
            </li>
          ))}
        </ul>
      </div>
    </MarketingSection>
  )
}

/* ------------------------------------------------------------------ */
/* 6 · Marquee type                                                    */
/* ------------------------------------------------------------------ */

/**
 * A giant serif line drifts behind the close; Apple's "one more thing" as
 * the eyebrow. (After 21st.dev "Worth Keeping CTA", ziegfiroyt.)
 */
function MarqueeCta() {
  const words = ["Live wallpapers", "Your desktop, alive", "Lock Screen too", macwall.name]
  return (
    <MarketingSection className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 [mask-image:linear-gradient(to_right,transparent,#000_15%,#000_85%,transparent)]"
      >
        <div className="mw-drift" style={{ "--drift-duration": "90s" } as CSSProperties}>
          {[...words, ...words].map((word, index) => (
            <span
              key={index}
              className="flex items-center font-display text-[clamp(5rem,14vw,13rem)] leading-none whitespace-nowrap text-white/[0.05]"
            >
              {word}
              <span className="mx-[0.35em] text-[0.4em]">✦</span>
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-center px-6 py-24 text-center md:py-32">
        <p className="text-[12px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
          One more thing
        </p>
        <h2 className={cn(headline, "mt-5 max-w-2xl text-4xl md:text-6xl")}>
          Make your Mac feel alive.
        </h2>
        <div className="mt-8">
          <HeroActions location="bottom_cta" />
        </div>
      </div>
    </MarketingSection>
  )
}

export function CtaDesign({ variant }: Readonly<{ variant: CtaVariant }>) {
  const Design = {
    wall: WallCta,
    split: SplitCta,
    card: CardCta,
    beams: BeamsCta,
    icon: IconCta,
    marquee: MarqueeCta,
  }[variant]
  return <Design />
}
