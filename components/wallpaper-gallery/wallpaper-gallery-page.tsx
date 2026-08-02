import { Suspense, type ReactNode } from "react"
import Link from "next/link"
import MarketingSiteChrome from "@/components/macwall-marketing/MarketingSiteChrome"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import { WallpaperGallery } from "@/components/wallpaper-gallery/wallpaper-gallery"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Skeleton } from "@/components/ui/skeleton"
import {
  GALLERY_CONTROLS_AFTER_TITLE_BLOCK_CLASS,
  GALLERY_MEDIA_RADIUS_CLASS,
  GALLERY_SUBTITLE_AFTER_TITLE_CLASS,
  GALLERY_TEXT_PRIMARY_CLASS,
  GALLERY_TEXT_SECONDARY_CLASS,
  GALLERY_TEXT_TERTIARY_CLASS,
  GALLERY_TITLE_AFTER_BREADCRUMB_CLASS,
  GALLERY_TITLE_BLOCK_BOTTOM_CLASS,
} from "@/lib/public-catalog/chrome"
import type {
  PublicCatalogSort,
  PublicWallpaperListResult,
} from "@/lib/public-catalog/types"
import {
  WALLPAPER_DISPLAY_HEADING_CLASS,
  WALLPAPER_SECTION_FONT_CLASS,
} from "@/lib/public-catalog/typography"
import { wallpapersGalleryPath } from "@/lib/public-catalog/urls"
import { cn } from "@/lib/utils"

export function WallpaperGalleryPageShell({
  initial,
  activeCategory = null,
  title,
  subtitle,
  loadError = false,
  afterGallery,
}: Readonly<{
  initial: PublicWallpaperListResult
  activeCategory?: string | null
  title?: string
  subtitle?: string
  loadError?: boolean
  /** Crawlable SEO copy below the grid (category landings). */
  afterGallery?: ReactNode
}>) {
  return (
    <div className="marketing-page">
      <MarketingSiteChrome />
      <main id="main-content" className="marketing-main min-h-[70vh]">
        <Suspense
          fallback={
            <GalleryFallback
              title={title}
              activeCategory={activeCategory}
            />
          }
        >
          <WallpaperGallery
            initial={initial}
            activeCategory={activeCategory}
            title={title}
            subtitle={subtitle}
            loadError={loadError}
          />
        </Suspense>
        {afterGallery}
      </main>
      <MacWallMarketingPageEnd />
    </div>
  )
}

function GalleryFallback({
  title = "Live wallpapers for Mac",
  activeCategory,
}: Readonly<{
  title?: string
  activeCategory?: string | null
}>) {
  return (
    <div className={WALLPAPER_SECTION_FONT_CLASS}>
      <Breadcrumb>
        <BreadcrumbList
          className={cn(
            "flex-wrap gap-y-1 text-[13px]",
            GALLERY_TEXT_TERTIARY_CLASS
          )}
        >
          {activeCategory ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
                  className="transition hover:text-white"
                >
                  <Link href={wallpapersGalleryPath()}>Wallpapers</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/35" />
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbPage className={GALLERY_TEXT_PRIMARY_CLASS}>
                  {activeCategory}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : (
            <BreadcrumbItem>
              <BreadcrumbPage className={GALLERY_TEXT_PRIMARY_CLASS}>
                Wallpapers
              </BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <header
        className={cn(
          GALLERY_TITLE_AFTER_BREADCRUMB_CLASS,
          GALLERY_TITLE_BLOCK_BOTTOM_CLASS
        )}
      >
        <h1 className={cn(WALLPAPER_DISPLAY_HEADING_CLASS, GALLERY_TEXT_PRIMARY_CLASS)}>
          {title}
        </h1>
        <p
          className={cn(
            GALLERY_SUBTITLE_AFTER_TITLE_CLASS,
            "text-[15px] leading-[1.5] sm:text-[16px] sm:leading-[1.55]",
            GALLERY_TEXT_SECONDARY_CLASS
          )}
        >
          {activeCategory
            ? `Cinematic ${activeCategory} loops, curated for desktop Macs.`
            : "Cinematic loops for every genre — preview here, set in MacWall."}
        </p>
        <Skeleton
          className={cn(
            GALLERY_CONTROLS_AFTER_TITLE_BLOCK_CLASS,
            "h-11 w-full max-w-lg rounded-full bg-white/[0.08]"
          )}
        />
      </header>

      <div className="mt-4 flex gap-1.5 overflow-hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-9 w-24 shrink-0 rounded-full bg-white/[0.08]"
          />
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Skeleton className="h-px min-w-0 flex-1 rounded-full bg-white/[0.08]" />
        <Skeleton className="h-9 w-28 shrink-0 rounded-full bg-white/[0.08]" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2.5">
            <Skeleton
              className={cn(
                "aspect-video bg-white/[0.08]",
                GALLERY_MEDIA_RADIUS_CLASS
              )}
            />
            <Skeleton className="h-3.5 w-3/5 rounded-full bg-white/[0.08]" />
            <Skeleton className="h-3 w-1/4 rounded-full bg-white/[0.06]" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function parseGallerySort(
  value: string | undefined
): PublicCatalogSort {
  switch (value) {
    case "popular":
    case "older":
    case "newest":
      return value
    default:
      return "newest"
  }
}
