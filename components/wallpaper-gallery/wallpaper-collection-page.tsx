import Link from "next/link"
import { Fragment, type ReactNode } from "react"
import { ContentBody } from "@/components/content/content-body"
import { MarketingRail } from "@/components/macwall-marketing/marketing-rail"
import { GalleryDownloadCta } from "@/components/wallpaper-gallery/gallery-download-cta"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { WallpaperCard } from "@/components/wallpaper-gallery/wallpaper-card"
import type { ContentBlock, ContentFaq } from "@/lib/content/types"
import {
  proseBody,
  proseFaq,
  proseFaqAnswer,
  proseFaqItem,
  proseFaqList,
  proseFaqQuestion,
  proseFaqTitle,
} from "@/lib/marketing-prose-classes"
import {
  GALLERY_CHIP_CLASS,
  GALLERY_SUBTITLE_AFTER_TITLE_CLASS,
  GALLERY_TEXT_PRIMARY_CLASS,
  GALLERY_TEXT_SECONDARY_CLASS,
  GALLERY_TEXT_TERTIARY_CLASS,
  GALLERY_TITLE_AFTER_BREADCRUMB_CLASS,
  GALLERY_TITLE_BLOCK_BOTTOM_CLASS,
} from "@/lib/public-catalog/chrome"
import type { PublicWallpaper } from "@/lib/public-catalog/types"
import {
  WALLPAPER_DISPLAY_HEADING_CLASS,
  WALLPAPER_SECTION_FONT_CLASS,
  WALLPAPER_SECTION_SERIF_HEADING_CLASS,
} from "@/lib/public-catalog/typography"
import { wallpapersGalleryPath } from "@/lib/public-catalog/urls"
import { cn } from "@/lib/utils"

export type CollectionLink = { href: string; label: string }

/**
 * Server-rendered topic landing: every wallpaper link is in the initial HTML
 * so crawlers reach each detail page without running the client gallery.
 */
export function WallpaperCollectionPage({
  breadcrumbs,
  title,
  intro,
  meta,
  wallpapers,
  moreHref,
  moreLabel,
  sections,
  faq,
  related,
  relatedTitle = "Related collections",
  emptyState,
}: Readonly<{
  breadcrumbs: CollectionLink[]
  title: string
  intro: string
  meta?: string
  wallpapers: PublicWallpaper[]
  moreHref?: string
  moreLabel?: string
  sections?: ContentBlock[]
  faq?: ContentFaq[]
  related?: CollectionLink[]
  relatedTitle?: string
  emptyState?: ReactNode
}>) {
  return (
    <MarketingRail innerClassName="min-h-[70vh]">
      <div className={WALLPAPER_SECTION_FONT_CLASS}>
        <Breadcrumb>
          <BreadcrumbList
            className={cn(
              "flex-wrap gap-y-1 text-[13px]",
              GALLERY_TEXT_TERTIARY_CLASS
            )}
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1
              // The separator is its own <li>, so it sits beside the item, not
              // inside it (nested <li> broke hydration on these pages).
              return (
                <Fragment key={crumb.href}>
                  <BreadcrumbItem className="min-w-0">
                    {isLast ? (
                      <BreadcrumbPage className={GALLERY_TEXT_PRIMARY_CLASS}>
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        asChild
                        className="transition hover:text-white"
                      >
                        <Link href={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {isLast ? null : (
                    <BreadcrumbSeparator className="text-white/35" />
                  )}
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>

        <header
          className={cn(
            GALLERY_TITLE_AFTER_BREADCRUMB_CLASS,
            GALLERY_TITLE_BLOCK_BOTTOM_CLASS
          )}
        >
          <h1
            className={cn(
              WALLPAPER_DISPLAY_HEADING_CLASS,
              GALLERY_TEXT_PRIMARY_CLASS
            )}
          >
            {title}
          </h1>
          <p
            className={cn(
              GALLERY_SUBTITLE_AFTER_TITLE_CLASS,
              "max-w-3xl text-[15px] leading-[1.6] sm:text-[16px]",
              GALLERY_TEXT_SECONDARY_CLASS
            )}
          >
            {intro}
          </p>
          <GalleryDownloadCta location="collection" />
          {meta ? (
            <p className={cn("mt-2 text-[13px]", GALLERY_TEXT_TERTIARY_CLASS)}>
              {meta}
            </p>
          ) : null}
        </header>

        {wallpapers.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-8">
            {wallpapers.map((wallpaper, index) => (
              <WallpaperCard
                key={wallpaper.id}
                wallpaper={wallpaper}
                index={index}
                priority={index < 3}
                animateEntrance={index < 6}
              />
            ))}
          </div>
        ) : (
          emptyState
        )}

        {moreHref && moreLabel ? (
          <div className="mt-8 flex justify-center">
            <Link
              href={moreHref}
              className={cn(GALLERY_CHIP_CLASS, "h-10 px-5 text-[14px]")}
            >
              {moreLabel}
            </Link>
          </div>
        ) : null}
      </div>

      {sections?.length || faq?.length || related?.length ? (
        <div className="mt-12 border-t border-dashed border-border py-10 md:py-14">
          <div className="marketing-prose-rail">
            {sections?.length ? (
              <div className={proseBody}>
                <ContentBody sections={sections} />
              </div>
            ) : null}

            {faq?.length ? (
              <section className={proseFaq} aria-labelledby="collection-faq">
                <h2 id="collection-faq" className={proseFaqTitle}>
                  Frequently asked questions
                </h2>
                <dl className={proseFaqList}>
                  {faq.map((item) => (
                    <div key={item.question} className={proseFaqItem}>
                      <dt className={proseFaqQuestion}>{item.question}</dt>
                      <dd className={proseFaqAnswer}>{item.answer}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            {related?.length ? (
              <nav aria-labelledby="collection-related" className="mt-10">
                <h2
                  id="collection-related"
                  className={WALLPAPER_SECTION_SERIF_HEADING_CLASS}
                >
                  {relatedTitle}
                </h2>
                <ul className="mt-5 flex flex-wrap gap-2.5">
                  {related.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className={GALLERY_CHIP_CLASS}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link
                      href={wallpapersGalleryPath()}
                      className={GALLERY_CHIP_CLASS}
                    >
                      All live wallpapers
                    </Link>
                  </li>
                </ul>
              </nav>
            ) : null}
          </div>
        </div>
      ) : null}
    </MarketingRail>
  )
}
