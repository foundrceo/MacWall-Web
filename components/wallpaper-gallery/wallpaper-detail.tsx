import Link from "next/link"
import {
  Clock01Icon,
  ComputerIcon,
  File01Icon,
  Flag01Icon,
  Folder01Icon,
  HeartIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { ReactNode } from "react"
import { WallpaperCard } from "@/components/wallpaper-gallery/wallpaper-card"
import { WallpaperSetOnMacButton } from "@/components/wallpaper-gallery/wallpaper-set-on-mac-button"
import { WallpaperShareButton } from "@/components/wallpaper-gallery/wallpaper-share-button"
import { WallpaperVideoPlayer } from "@/components/wallpaper-gallery/wallpaper-video-player"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  GALLERY_MEDIA_RADIUS_CLASS,
  GALLERY_PANEL_RADIUS_CLASS,
  GALLERY_TEXT_PRIMARY_CLASS,
  GALLERY_TEXT_SECONDARY_CLASS,
  GALLERY_TEXT_TERTIARY_CLASS,
  GALLERY_TITLE_AFTER_BREADCRUMB_CLASS,
} from "@/lib/public-catalog/chrome"
import {
  aspectRatioLabel,
  formatFileSize,
  formatLikeCount,
  formatLoopDuration,
} from "@/lib/public-catalog/format"
import type { PublicWallpaper } from "@/lib/public-catalog/types"
import {
  wallpaperDetailPath,
  wallpaperShareUrl,
  wallpapersGalleryHref,
  wallpapersGalleryPath,
  wallpaperCategorySlugOrFallback,
} from "@/lib/public-catalog/urls"
import {
  WALLPAPER_DETAIL_HEADING_CLASS,
  WALLPAPER_SECTION_FONT_CLASS,
  WALLPAPER_SECTION_SERIF_HEADING_CLASS,
} from "@/lib/public-catalog/typography"
import {
  buildSupportChatHref,
  buildWallpaperReportMessage,
} from "@/lib/support/shared"
import { cn } from "@/lib/utils"

const META_ICON_SIZE = 17
const META_ICON_STROKE = 1.75

/** Borderless chips on detail — gallery pills use GALLERY_CHIP_CLASS. */
const DETAIL_CHIP_CLASS =
  "inline-flex h-9 shrink-0 items-center rounded-full border-0 bg-white/[0.06] px-3.5 text-[13px] font-normal text-white/65 shadow-none ring-0 transition duration-200 ease-out outline-none hover:border-0 hover:bg-white/[0.1] hover:text-white focus-visible:ring-2 focus-visible:ring-white/40"

/** Soft aside surface without outline — Apple-style fill only. */
const DETAIL_ASIDE_SURFACE_CLASS =
  "border-0 bg-white/[0.06] shadow-none ring-0"

function buildDetailCopy(wallpaper: PublicWallpaper): {
  lead: string
  detail: string
} {
  const lead = `${wallpaper.name} is a live wallpaper from the ${wallpaper.category} collection.`

  const facts: string[] = []
  const hasResolution =
    wallpaper.resolution.length > 0 && wallpaper.resolution !== "—"

  if (hasResolution) {
    const aspect = aspectRatioLabel(wallpaper.resolution)
    facts.push(
      aspect
        ? `${wallpaper.resolution} (${aspect})`
        : wallpaper.resolution
    )
  }

  if (wallpaper.durationSeconds > 0) {
    facts.push(`${formatLoopDuration(wallpaper.durationSeconds)} loop`)
  }

  const detail =
    facts.length > 0
      ? `${facts.join(" · ")}. Preview above, then set it on your Mac with MacWall.`
      : "Preview the motion above, then set it on your Mac with the MacWall app."

  return { lead, detail }
}

export function WallpaperDetail({
  wallpaper,
  similar,
  origin,
}: Readonly<{
  wallpaper: PublicWallpaper
  similar: PublicWallpaper[]
  origin: string
}>) {
  const categorySlug = wallpaperCategorySlugOrFallback(wallpaper.category)
  const categoryHref = wallpapersGalleryHref(categorySlug)
  const shareUrl = wallpaperShareUrl(wallpaper, origin)
  const reportChatHref = buildSupportChatHref({
    pathname: wallpaperDetailPath(wallpaper),
    message: buildWallpaperReportMessage(wallpaper, shareUrl),
  })
  const loopTime = formatLoopDuration(wallpaper.durationSeconds)
  const sizeLabel = formatFileSize(wallpaper.fileSizeBytes)
  const { lead: detailLead, detail: detailBody } = buildDetailCopy(wallpaper)

  return (
    <div className={WALLPAPER_SECTION_FONT_CLASS}>
      <Breadcrumb>
        <BreadcrumbList
          className={cn(
            "flex-wrap gap-y-1 text-[13px]",
            GALLERY_TEXT_TERTIARY_CLASS
          )}
        >
          <BreadcrumbItem>
            <BreadcrumbLink
              asChild
              className="transition hover:text-white"
            >
              <Link href={wallpapersGalleryPath()}>Wallpapers</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-white/35" />
          <BreadcrumbItem>
            <BreadcrumbLink
              asChild
              className="transition hover:text-white"
            >
              <Link href={categoryHref}>{wallpaper.category}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-white/35" />
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage
              className={cn(
                "block max-w-[16rem] truncate sm:max-w-xs",
                GALLERY_TEXT_PRIMARY_CLASS
              )}
            >
              {wallpaper.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header
        className={cn(
          GALLERY_TITLE_AFTER_BREADCRUMB_CLASS,
          "flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6 lg:gap-8"
        )}
      >
        <div className="min-w-0 flex-1">
          <h1
            className={cn(
              WALLPAPER_DETAIL_HEADING_CLASS,
              GALLERY_TEXT_PRIMARY_CLASS
            )}
          >
            {wallpaper.name}
          </h1>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2.5 md:pt-0.5">
          <WallpaperSetOnMacButton
            wallpaperId={wallpaper.id}
            wallpaperName={wallpaper.name}
          />
          <WallpaperShareButton url={shareUrl} title={wallpaper.name} />
        </div>
      </header>

      <div
        className={cn(
          "mt-6 overflow-hidden bg-black ring-1 ring-white/[0.1]",
          GALLERY_MEDIA_RADIUS_CLASS
        )}
      >
        <WallpaperVideoPlayer
          src={wallpaper.videoUrl}
          videoKey={wallpaper.videoKey}
          poster={wallpaper.thumbUrl}
          title={wallpaper.name}
        />
      </div>

      <section className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start lg:gap-x-10">
        <div className="flex min-w-0 flex-col gap-7">
          <div className="space-y-4 text-[16px] leading-[1.65]">
            <p className={GALLERY_TEXT_PRIMARY_CLASS}>{detailLead}</p>
            <p className={GALLERY_TEXT_SECONDARY_CLASS}>{detailBody}</p>
          </div>

          {wallpaper.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {wallpaper.tags.slice(0, 12).map((tag) => (
                <Badge
                  key={tag}
                  asChild
                  variant="ghost"
                  className={DETAIL_CHIP_CLASS}
                >
                  <Link
                    href={wallpapersGalleryHref(categorySlug, { tag })}
                  >
                    {tag}
                  </Link>
                </Badge>
              ))}
            </div>
          ) : (
            <Badge asChild variant="ghost" className={DETAIL_CHIP_CLASS}>
              <Link href={categoryHref}>{wallpaper.category}</Link>
            </Badge>
          )}
        </div>

        <aside
          className={cn(
            "p-4 lg:p-5",
            GALLERY_PANEL_RADIUS_CLASS,
            DETAIL_ASIDE_SURFACE_CLASS
          )}
        >
          <MetaBlock title="Details">
            <MetaRow icon={UserIcon}>MacWall catalog</MetaRow>
            <MetaRow icon={HeartIcon}>
              {formatLikeCount(wallpaper.likeCount)} likes
            </MetaRow>
            {wallpaper.resolution && wallpaper.resolution !== "—" ? (
              <MetaRow icon={ComputerIcon}>{wallpaper.resolution}</MetaRow>
            ) : null}
            {wallpaper.durationSeconds > 0 ? (
              <MetaRow icon={Clock01Icon}>{loopTime} loop</MetaRow>
            ) : null}
            {wallpaper.fileSizeBytes > 0 ? (
              <MetaRow icon={File01Icon}>{sizeLabel}</MetaRow>
            ) : null}
            <MetaLinkRow href={categoryHref} icon={Folder01Icon}>
              {wallpaper.category}
            </MetaLinkRow>
            <MetaLinkRow href={reportChatHref} icon={Flag01Icon}>
              Report wallpaper
            </MetaLinkRow>
          </MetaBlock>
        </aside>
      </section>

      {similar.length > 0 ? (
        <section className="mt-14 md:mt-16">
          <div className="mb-7 flex items-baseline justify-between gap-5 sm:gap-6">
            <h2 className={WALLPAPER_SECTION_SERIF_HEADING_CLASS}>
              More like this
            </h2>
            <Link
              href={categoryHref}
              className="shrink-0 font-sans text-[14px] leading-snug text-white/65 transition hover:text-white"
            >
              Browse {wallpaper.category}
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-9">
            {similar.map((item, index) => (
              <WallpaperCard
                key={item.id}
                wallpaper={item}
                index={index}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function MetaIcon({
  icon,
}: Readonly<{
  icon: typeof UserIcon
}>) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={META_ICON_SIZE}
      strokeWidth={META_ICON_STROKE}
      className="shrink-0 text-white/50"
      aria-hidden
    />
  )
}

function MetaBlock({
  title,
  children,
}: Readonly<{
  title: string
  children: ReactNode
}>) {
  return (
    <div>
      <p
        className={cn(
          "mb-3 text-[12px] font-medium tracking-[0.06em] uppercase",
          GALLERY_TEXT_TERTIARY_CLASS
        )}
      >
        {title}
      </p>
      <div className="space-y-2.5 text-[15px]">{children}</div>
    </div>
  )
}

function MetaRow({
  icon,
  children,
}: Readonly<{
  icon: typeof UserIcon
  children: ReactNode
}>) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 leading-snug",
        GALLERY_TEXT_PRIMARY_CLASS
      )}
    >
      <MetaIcon icon={icon} />
      {children}
    </div>
  )
}

function MetaLinkRow({
  href,
  icon,
  children,
}: Readonly<{
  href: string
  icon: typeof UserIcon
  children: ReactNode
}>) {
  const className = cn(
    "flex items-center gap-3 text-[15px] leading-snug transition hover:text-white",
    GALLERY_TEXT_PRIMARY_CLASS
  )

  if (href.startsWith("mailto:")) {
    return (
      <a href={href} className={className}>
        <MetaIcon icon={icon} />
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={className}>
      <MetaIcon icon={icon} />
      {children}
    </Link>
  )
}
