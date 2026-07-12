"use client"

import Image from "next/image"
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  Play,
  Plus,
  Settings,
} from "lucide-react"
import { useCallback, useMemo, useRef, useState, type ReactNode } from "react"
import type { MarketingCatalogSlide } from "@/lib/marketing-catalog-slides"
import { buildMarketingHomeDemoData } from "@/lib/marketing-home-demo-data"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"
import {
  macwallAppIconPath,
  macwallAppIconRadiusClass,
  macwall,
} from "@/lib/macwall-site"

const CAROUSEL_VISIBLE = 4

function formatApproxFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return ""
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`
  return `${bytes} B`
}

function heroMetadataLine(slide: MarketingCatalogSlide): string {
  const size = formatApproxFileSize(slide.file_size_bytes)
  return size ? `${slide.category} — ${size}` : slide.category
}

function truncatedHeroTitle(name: string, maxWords = 5): string {
  const trimmed = name.trim()
  const words = trimmed.split(/\s+/)
  if (words.length <= maxWords) return trimmed
  return `${words.slice(0, maxWords).join(" ")}…`
}

function maxCarouselIndex(count: number) {
  return Math.max(0, count - CAROUSEL_VISIBLE)
}

export type MacWallCatalogMarketingPreviewProps = {
  homePickSlides: MarketingCatalogSlide[]
  featuredIndex: number
  onFeaturedIndexChange: (index: number) => void
  /** When a pick (or hero) card is selected — may be outside the featured rotation pool. */
  onSelectWallpaper?: (slide: MarketingCatalogSlide) => void
  onApplyWallpaper?: () => void
  onRequestClose?: () => void
}

function DemoSectionArrows({
  showsArrows,
  isBackEnabled,
  isForwardEnabled,
  onBack,
  onForward,
}: Readonly<{
  showsArrows: boolean
  isBackEnabled: boolean
  isForwardEnabled: boolean
  onBack: () => void
  onForward: () => void
}>) {
  if (!showsArrows) return null

  return (
    <div className="MacWallDemoAppSectionArrows flex shrink-0 items-center">
      <button
        type="button"
        className="MacWallDemoAppSectionArrow"
        aria-label="Back"
        disabled={!isBackEnabled}
        onClick={onBack}
      >
        <ChevronLeft className="size-3.5" strokeWidth={2.25} aria-hidden />
      </button>
      <button
        type="button"
        className="MacWallDemoAppSectionArrow"
        aria-label="Forward"
        disabled={!isForwardEnabled}
        onClick={onForward}
      >
        <ChevronRight className="size-3.5" strokeWidth={2.25} aria-hidden />
      </button>
    </div>
  )
}

function DemoSectionHeader({
  title,
  subtitle,
  showsArrows,
  isBackEnabled,
  isForwardEnabled,
  onBack,
  onForward,
}: Readonly<{
  title: string
  subtitle: string
  showsArrows: boolean
  isBackEnabled: boolean
  isForwardEnabled: boolean
  onBack: () => void
  onForward: () => void
}>) {
  return (
    <div className="MacWallDemoAppSectionHead flex items-center justify-between">
      <div className="min-w-0 flex-1 text-left leading-none">
        <h4 className="MacWallDemoAppSectionTitle font-bold tracking-tight text-white">
          {title}
        </h4>
        <p className="MacWallDemoAppSectionSub line-clamp-2 leading-snug text-[rgb(255,255,255,0.62)]">
          {subtitle}
        </p>
      </div>
      <DemoSectionArrows
        showsArrows={showsArrows}
        isBackEnabled={isBackEnabled}
        isForwardEnabled={isForwardEnabled}
        onBack={onBack}
        onForward={onForward}
      />
    </div>
  )
}

function DemoWallpaperCard({
  slide,
  showsNewBadge,
  onSelect,
}: Readonly<{
  slide: MarketingCatalogSlide
  showsNewBadge?: boolean
  onSelect: () => void
}>) {
  const b = macwallExactCopy.demoBrowse
  const sources = useMemo(() => {
    const list = [slide.thumbPath]
    if (slide.thumbFallbackPath && slide.thumbFallbackPath !== slide.thumbPath) {
      list.push(slide.thumbFallbackPath)
    }
    return list
  }, [slide.thumbFallbackPath, slide.thumbPath])

  const [sourceIndex, setSourceIndex] = useState(0)
  const src = sources[Math.min(sourceIndex, sources.length - 1)] ?? slide.thumbPath

  const handlePosterError = useCallback(() => {
    setSourceIndex((index) =>
      index < sources.length - 1 ? index + 1 : index
    )
  }, [sources.length])

  return (
    <button
      type="button"
      className="MacWallDemoAppWallCard group relative shrink-0 overflow-hidden text-left outline-none focus-visible:ring-2 focus-visible:ring-white/35"
      onClick={onSelect}
      aria-label={`Show ${slide.name}`}
    >
      {/* Native img — Next/Image does not fill aspect-ratio tiles reliably */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={src}
        alt=""
        src={src}
        decoding="async"
        loading="lazy"
        className="absolute inset-0 z-0 size-full object-cover"
        onError={handlePosterError}
      />
      {showsNewBadge ? (
        <span className="MacWallDemoAppBadge MacWallDemoAppBadgeNew">
          {b.newBadge}
        </span>
      ) : null}
    </button>
  )
}

export default function MacWallCatalogMarketingPreview({
  homePickSlides,
  featuredIndex,
  onFeaturedIndexChange,
  onSelectWallpaper,
  onApplyWallpaper,
  onRequestClose,
}: MacWallCatalogMarketingPreviewProps) {
  const b = macwallExactCopy.demoBrowse
  const ix = macwallExactCopy.interact
  const t = macwallExactCopy.appUi.tabs

  const home = useMemo(
    () => buildMarketingHomeDemoData(homePickSlides),
    [homePickSlides]
  )
  const { featured, picks } = home

  const [pickIx, setPickIx] = useState(0)

  const selectCatalogSlide = useCallback(
    (slide: MarketingCatalogSlide) => {
      const fi = featured.findIndex((s) => s.id === slide.id)
      if (fi >= 0) onFeaturedIndexChange(fi)
      onSelectWallpaper?.(slide)
    },
    [featured, onFeaturedIndexChange, onSelectWallpaper]
  )

  const n = featured.length
  const safeFeatured = n > 0 ? Math.min(Math.max(featuredIndex, 0), n - 1) : 0
  const current = featured[safeFeatured]
  const currentId = current?.id

  const stepFeatured = useCallback(
    (delta: number) => {
      if (n <= 1) return
      onFeaturedIndexChange((safeFeatured + delta + n) % n)
    },
    [n, onFeaturedIndexChange, safeFeatured]
  )

  if (!current) return null

  return (
    <div className="MacWallDemoAppViewport">
      <div className="MacWallDemoApp relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[inherit] bg-transparent select-none">
        <div className="MacWallDemoAppHomeLayout pointer-events-auto relative min-h-0 flex-1 overflow-hidden">
          <header className="MacWallDemoAppHeader MacWallDemoAppHeaderGrid pointer-events-none items-center">
            <div className="MacWallDemoAppHeaderLeft flex shrink-0 items-center justify-self-start">
              <button
                type="button"
                aria-label={ix.demoCloseWindowAria}
                className="MacWallDemoAppCloseButton pointer-events-auto relative z-[3] inline-flex size-3 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-[#ff5f57] p-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] hover:brightness-95 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
                onClick={(e) => {
                  e.stopPropagation()
                  onRequestClose?.()
                }}
              />
              <div className="MacWallDemoAppBrand flex shrink-0 items-center">
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
              <div className="MacWallDemoAppNavCluster" aria-hidden>
                <div className="MacWallDemoAppTabPills" role="presentation">
                  <span className="MacWallDemoAppTab MacWallDemoAppTab--active">
                    {t.home}
                  </span>
                  <span className="MacWallDemoAppTabSep" />
                  <span className="MacWallDemoAppTab">{t.explore}</span>
                  <span className="MacWallDemoAppTabSep" />
                  <span className="MacWallDemoAppTab">{t.library}</span>
                </div>
                <span className="MacWallDemoAppNavBtn MacWallDemoAppNavBtnIcon">
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
                </span>
              </div>
            </div>

            <div className="MacWallDemoAppActions flex shrink-0 items-center justify-self-end">
              <span className="MacWallDemoAppNavBtn MacWallDemoAppNavBtnPro font-semibold tracking-widest">
                {b.proBadge}
              </span>
              <span className="MacWallDemoAppNavBtn MacWallDemoAppNavBtnIcon">
                <Plus className="size-4" strokeWidth={2} aria-hidden />
              </span>
              <span className="MacWallDemoAppNavBtn MacWallDemoAppNavBtnIcon">
                <Settings className="size-4" strokeWidth={2} aria-hidden />
              </span>
            </div>
          </header>
          <div className="MacWallDemoAppFeaturedHero relative shrink-0 overflow-hidden">
            <div className="MacWallDemoAppFeaturedStack absolute inset-0">
              {featured.map((item) => (
                <div
                  key={item.id}
                  className="MacWallDemoAppFeaturedSlide absolute inset-0 transition-opacity duration-[950ms] ease-in-out"
                  style={{ opacity: item.id === currentId ? 1 : 0 }}
                  aria-hidden={item.id !== currentId}
                >
                  <video
                    className="h-full w-full object-cover"
                    autoPlay={item.id === currentId}
                    playsInline
                    loop
                    muted
                    preload={item.id === currentId ? "auto" : "none"}
                  >
                    <source src={item.videoUrl} type="video/mp4" />
                  </video>
                </div>
              ))}
            </div>

            <div
              className="MacWallDemoAppBrowseBackdrop pointer-events-none absolute inset-0"
              aria-hidden
            />

            {n > 1 ? (
              <div className="MacWallDemoAppHeroNav pointer-events-auto absolute inset-0 z-[4] flex items-center justify-between">
                <button
                  type="button"
                  className="MacWallDemoAppHeroChevron"
                  aria-label="Previous featured wallpaper"
                  onClick={() => stepFeatured(-1)}
                >
                  <ChevronLeft
                    className="MacWallDemoAppHeroChevronIcon"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                </button>
                <button
                  type="button"
                  className="MacWallDemoAppHeroChevron"
                  aria-label="Next featured wallpaper"
                  onClick={() => stepFeatured(1)}
                >
                  <ChevronRight
                    className="MacWallDemoAppHeroChevronIcon"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                </button>
              </div>
            ) : null}

            <div className="MacWallDemoAppFeaturedOverlay pointer-events-none absolute inset-x-0 bottom-0 z-[3] flex flex-col text-left">
              <p className="MacWallDemoAppFeaturedLabel font-bold text-[rgb(255,255,255,0.65)] uppercase">
                {b.featuredLabel}
              </p>
              <h3 className="MacWallDemoAppFeaturedTitle line-clamp-1 max-w-full font-bold text-white">
                {truncatedHeroTitle(current.name)}
              </h3>
              <p className="MacWallDemoAppFeaturedMetaLine text-[rgb(255,255,255,0.7)]">
                {heroMetadataLine(current)}
              </p>
              <div className="MacWallDemoAppFeaturedActions pointer-events-auto flex items-center">
                <button
                  type="button"
                  className="MacWallDemoAppFeaturedCta inline-flex shrink-0 cursor-pointer items-center rounded-full border-0 bg-[rgb(255,255,255,0.18)] font-semibold text-white ring-[0.5px] ring-[rgb(255,255,255,0.18)] outline-none hover:bg-[rgb(255,255,255,0.24)] focus-visible:ring-2 focus-visible:ring-white/40"
                  aria-label={`${b.heroViewCta} — apply this wallpaper to the demo desktop background`}
                  onClick={() => onApplyWallpaper?.()}
                >
                  <Play
                    className="MacWallDemoAppFeaturedCtaPlay"
                    fill="currentColor"
                    aria-hidden
                  />
                  {b.heroViewCta}
                  <ArrowUpRight
                    className="MacWallDemoAppFeaturedCtaArrow"
                    strokeWidth={2.25}
                    aria-hidden
                  />
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

          <div className="MacWallDemoAppPicksPane">
            <HomeCarouselSection
              title={b.picksTitle}
              subtitle={b.picksSubtitle}
              items={picks}
              scrollIndex={pickIx}
              onScrollIndexChange={setPickIx}
              onSelectSlide={selectCatalogSlide}
              renderCard={(slide, onSelect) => (
                <DemoWallpaperCard slide={slide} onSelect={onSelect} />
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function HomeCarouselSection({
  title,
  subtitle,
  items,
  scrollIndex,
  onScrollIndexChange,
  onSelectSlide,
  renderCard,
}: Readonly<{
  title: string
  subtitle: string
  items: MarketingCatalogSlide[]
  scrollIndex: number
  onScrollIndexChange: (index: number) => void
  onSelectSlide: (slide: MarketingCatalogSlide) => void
  renderCard: (
    slide: MarketingCatalogSlide,
    onSelect: () => void,
    index: number
  ) => ReactNode
}>) {
  const trackRef = useRef<HTMLDivElement>(null)

  const scrollToIndex = useCallback(
    (index: number) => {
      const track = trackRef.current
      if (!track || items.length === 0) return
      const child = track.children[index] as HTMLElement | undefined
      child?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      })
    },
    [items.length]
  )

  const move = useCallback(
    (direction: number) => {
      const next = Math.min(
        Math.max(scrollIndex + direction, 0),
        maxCarouselIndex(items.length)
      )
      onScrollIndexChange(next)
      scrollToIndex(next)
    },
    [items.length, onScrollIndexChange, scrollIndex, scrollToIndex]
  )

  return (
    <section className="MacWallDemoAppSection MacWallDemoAppSectionPicks">
      <DemoSectionHeader
        title={title}
        subtitle={subtitle}
        showsArrows={items.length > CAROUSEL_VISIBLE}
        isBackEnabled={scrollIndex > 0}
        isForwardEnabled={scrollIndex < maxCarouselIndex(items.length)}
        onBack={() => move(-1)}
        onForward={() => move(1)}
      />
      <div ref={trackRef} className="MacWallDemoAppCarouselTrack">
        {items.map((slide, index) => (
          <div key={slide.id} className="MacWallDemoAppCarouselItem">
            {renderCard(slide, () => onSelectSlide(slide), index)}
          </div>
        ))}
      </div>
    </section>
  )
}