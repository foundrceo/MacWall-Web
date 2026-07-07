"use client"

import Image from "next/image"
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  Plus,
  Settings,
} from "lucide-react"
import { useCallback, useMemo } from "react"
import {
  MARKETING_CATALOG_SLIDES,
  type MarketingCatalogSlide,
} from "@/lib/marketing-catalog-slides"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"
import {
  macwallAppIconPath,
  macwallAppIconRadiusClass,
  macwall,
} from "@/lib/macwall-site"

function formatApproxFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return ""
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`
  return `${bytes} B`
}

function formatDuration(seconds: number): string | null {
  if (!Number.isFinite(seconds) || seconds <= 0) return null
  const total = Math.round(seconds)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

function heroDetailParts(slide: MarketingCatalogSlide): string[] {
  const out: string[] = []
  if (slide.resolution && slide.resolution !== "—") out.push(slide.resolution)
  const fb = formatApproxFileSize(slide.file_size_bytes)
  if (fb) out.push(`~${fb}`)
  const du = formatDuration(slide.duration_seconds)
  if (du) out.push(du)
  return out
}

export type MacWallCatalogMarketingPreviewProps = {
  featuredIndex: number
  onFeaturedIndexChange: (index: number) => void
  onApplyWallpaper?: () => void
  onRequestClose?: () => void
}

export default function MacWallCatalogMarketingPreview({
  featuredIndex,
  onFeaturedIndexChange,
  onApplyWallpaper,
  onRequestClose,
}: MacWallCatalogMarketingPreviewProps) {
  const b = macwallExactCopy.demoBrowse
  const ix = macwallExactCopy.interact
  const t = macwallExactCopy.appUi.tabs

  const slides = useMemo(
    () => (MARKETING_CATALOG_SLIDES.length > 0 ? MARKETING_CATALOG_SLIDES : []),
    []
  )

  const n = slides.length
  const safeIndex = n > 0 ? Math.min(Math.max(featuredIndex, 0), n - 1) : 0
  const w = slides[safeIndex]

  const bump = useCallback(
    (delta: number) => {
      if (n <= 0) return
      onFeaturedIndexChange((safeIndex + delta + n) % n)
    },
    [n, onFeaturedIndexChange, safeIndex]
  )

  if (!w) return null

  return (
    <div className="MacWallDemoAppViewport">
      <div className="MacWallDemoApp flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[inherit] bg-[#070708] select-none">
        <header className="MacWallDemoAppHeader MacWallDemoAppHeaderGrid pointer-events-none shrink-0 items-center">
          <div className="MacWallDemoAppHeaderLeft flex shrink-0 items-center gap-2 justify-self-start">
            <button
              type="button"
              aria-label={ix.demoCloseWindowAria}
              className="MacWallDemoAppCloseButton pointer-events-auto relative z-[3] inline-flex size-3 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-[#ff5f57] p-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] hover:brightness-95 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
              onClick={(e) => {
                e.stopPropagation()
                onRequestClose?.()
              }}
            />
            <div className="MacWallDemoAppBrand flex shrink-0 items-center gap-2">
              <Image
                src={macwallAppIconPath}
                alt={macwallExactCopy.header.logoAlt}
                width={28}
                height={28}
                className={`shrink-0 object-cover ${macwallAppIconRadiusClass}`}
              />
              <span className="MacWallDemoAppBrandName font-semibold tracking-tight text-white">
                {macwall.name}
              </span>
            </div>
          </div>

          <div className="MacWallDemoAppNav flex min-w-0 items-center justify-center justify-self-center">
            <div className="Application_header__57Sg5 MacWallDemoAppNavPill">
              <div className="Application_header_content__plHsT">
                <span className="Application_active__mdLR4">{t.home}</span>
                <span>{t.explore}</span>
                <span>{t.library}</span>
              </div>
              <div className="Application_search__Q_j_2" aria-hidden>
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 512 512"
                  height="16"
                  width="16"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="MacWallDemoAppActions flex shrink-0 items-center gap-1.5 justify-self-end sm:gap-2">
            <div
              className="Application_search__Q_j_2 MacWallDemoAppPro"
              style={{ borderRadius: 9999 }}
            >
              <span className="font-semibold tracking-widest text-white">
                {b.proBadge}
              </span>
            </div>
            <div className="Application_search__Q_j_2" aria-hidden>
              <Plus className="size-4 text-white" strokeWidth={2} aria-hidden />
            </div>
            <div className="Application_search__Q_j_2" aria-hidden>
              <Settings
                className="size-4 text-white"
                strokeWidth={2}
                aria-hidden
              />
            </div>
          </div>
        </header>

        <div className="MacWallDemoAppBody pointer-events-auto flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="MacWallDemoAppFeatured relative min-h-0 flex-1 overflow-hidden bg-[rgb(255,255,255,0.045)] ring-[0.5px] ring-white/8">
            <video
              key={w.id}
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              playsInline
              loop
              muted
              preload="auto"
            >
              <source src={w.videoUrl} type="video/mp4" />
            </video>
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_115%_at_50%_88%,transparent_52%,rgba(0,0,0,0.62)_98%)]"
              aria-hidden
            />
            <div className="MacWallDemoAppFeaturedOverlay pointer-events-none absolute inset-x-0 bottom-0 flex flex-col text-left">
              <p className="MacWallDemoAppFeaturedLabel font-bold text-[rgb(255,255,255,0.65)] uppercase">
                {b.featuredLabel}
              </p>
              <h3 className="MacWallDemoAppFeaturedTitle line-clamp-1 max-w-full font-bold text-white">
                {w.name}
              </h3>
              <div className="MacWallDemoAppFeaturedMeta flex max-w-full flex-wrap font-medium text-[rgb(255,255,255,0.7)]">
                <span className="shrink-0">{w.category}</span>
                {heroDetailParts(w).map((piece, idx) => (
                  <span key={`${idx}-${piece}`} className="shrink-0">
                    {piece}
                  </span>
                ))}
              </div>
              <div className="pointer-events-auto flex items-center gap-2">
                <button
                  type="button"
                  className="MacWallDemoAppFeaturedCta inline-flex shrink-0 cursor-pointer items-center rounded-full border-0 bg-[rgb(255,255,255,0.18)] font-medium text-white ring-[0.5px] ring-[rgb(255,255,255,0.18)] outline-none hover:bg-[rgb(255,255,255,0.24)] focus-visible:ring-2 focus-visible:ring-white/40"
                  aria-label={`${b.heroViewCta} — apply this wallpaper to the demo desktop background`}
                  onClick={() => onApplyWallpaper?.()}
                >
                  {b.heroViewCta}
                  <ArrowUpRight strokeWidth={2.25} aria-hidden />
                </button>
                <span
                  className="MacWallDemoAppFeaturedHeart inline-flex shrink-0 items-center justify-center rounded-full bg-[rgb(255,255,255,0.10)] ring-[0.5px] ring-[rgb(255,255,255,0.18)]"
                  aria-hidden
                >
                  <Heart
                    className="text-[rgb(255,255,255,0.85)]"
                    strokeWidth={2}
                    aria-hidden
                  />
                </span>
              </div>
            </div>
          </div>

          <div className="MacWallDemoAppPicksHead flex shrink-0 items-start justify-between gap-2">
            <div className="min-w-0 flex-1 text-left leading-none">
              <h4 className="MacWallDemoAppPicksTitle font-bold tracking-tight text-white">
                {b.picksTitle}
              </h4>
              <p className="MacWallDemoAppPicksSub line-clamp-1 leading-snug text-[rgb(255,255,255,0.62)]">
                {b.picksSubtitle}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                className="rounded p-1 text-[rgb(255,255,255,0.40)] outline-none hover:text-white/60 focus-visible:ring-2 focus-visible:ring-white/30 disabled:opacity-30"
                aria-label="Previous featured wallpaper"
                disabled={n <= 1}
                onClick={() => bump(-1)}
              >
                <ChevronLeft className="size-3.5" strokeWidth={2} aria-hidden />
              </button>
              <button
                type="button"
                className="rounded p-1 text-[rgb(255,255,255,0.40)] outline-none hover:text-white/60 focus-visible:ring-2 focus-visible:ring-white/30 disabled:opacity-30"
                aria-label="Next featured wallpaper"
                disabled={n <= 1}
                onClick={() => bump(1)}
              >
                <ChevronRight
                  className="size-3.5"
                  strokeWidth={2}
                  aria-hidden
                />
              </button>
            </div>
          </div>

          <div className="MacWallDemoAppPicksRow flex shrink-0 overflow-x-auto pb-0.5">
            {slides.map((tw, i) => (
              <button
                key={`pick-${tw.id}`}
                type="button"
                className="MacWallDemoAppPick relative aspect-video h-full shrink-0 cursor-pointer overflow-hidden bg-[rgb(255,255,255,0.045)] ring-[0.5px] ring-white/8 outline-none focus-visible:ring-2 focus-visible:ring-white/35"
                onClick={() => onFeaturedIndexChange(i)}
                aria-label={`Show ${tw.name}`}
              >
                <Image
                  alt=""
                  width={264}
                  height={149}
                  decoding="async"
                  className="h-full w-full object-cover"
                  src={tw.thumbPath}
                  sizes="20vw"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
