import { MarketingRail } from "@/components/macwall-marketing/marketing-rail"
import { ContentBody } from "@/components/content/content-body"
import { type ReactNode } from "react"
import Link from "next/link"
import {
  WallpaperGallery,
  type GalleryCategoryChip,
} from "@/components/wallpaper-gallery/wallpaper-gallery"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { ContentBlock, ContentFaq } from "@/lib/content/types"
import { macwall } from "@/lib/macwall-site"
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
  GALLERY_SUBTITLE_AFTER_TITLE_CLASS,
  GALLERY_TEXT_PRIMARY_CLASS,
  GALLERY_TEXT_SECONDARY_CLASS,
  GALLERY_TEXT_TERTIARY_CLASS,
  GALLERY_TITLE_AFTER_BREADCRUMB_CLASS,
} from "@/lib/public-catalog/chrome"
import type { PublicWallpaperListResult } from "@/lib/public-catalog/types"
import {
  WALLPAPER_DISPLAY_HEADING_CLASS,
  WALLPAPER_SECTION_FONT_CLASS,
} from "@/lib/public-catalog/typography"
import { wallpapersGalleryPath } from "@/lib/public-catalog/urls"
import { categorySlugFromName } from "@/lib/seo/category-slugs"
import { categoryDisplayLabel } from "@/lib/seo/category-seo"
import { cn } from "@/lib/utils"

/**
 * `/wallpapers` and `/wallpapers/{category}`. The breadcrumb, the one H1 and
 * the intro are server markup; the client gallery (download CTA, search,
 * category chips, sort, the first page of cards, "Show more") renders inline
 * after them.
 *
 * No Suspense boundary wraps the gallery. React streams a finished boundary
 * bigger than ~12.8 KB out of line (its fallback first, the content in a
 * hidden `<div id="S:…">` after the footer), and a 24-card grid is bigger,
 * so a boundary here put a skeleton and a second H1 where crawlers read the
 * page. The only hook that suspends, `useSearchParams`, sits in its own small
 * boundary inside the gallery.
 */
export function WallpaperGalleryPageShell({
  initial,
  activeCategory = null,
  title,
  intro,
  loadError = false,
  afterGallery,
}: Readonly<{
  initial: PublicWallpaperListResult
  /** Catalog category name ("Others"), or null for the whole gallery. */
  activeCategory?: string | null
  /** The page's H1. */
  title: string
  /** Answer-first intro under the H1; inline Markdown (`**bold**`, `[label](/path)`). */
  intro?: string
  loadError?: boolean
  /** Crawlable links and copy below the grid. */
  afterGallery?: ReactNode
}>) {
  const categories: GalleryCategoryChip[] = [
    { name: null, label: "All", slug: null },
    ...macwall.categories.map((name) => ({
      name,
      label: categoryDisplayLabel(name),
      slug: categorySlugFromName(name) ?? null,
    })),
  ]

  return (
    <MarketingRail innerClassName="min-h-[70vh]">
      <div className={WALLPAPER_SECTION_FONT_CLASS}>
        <GalleryBreadcrumb activeCategory={activeCategory} />

        <header className={GALLERY_TITLE_AFTER_BREADCRUMB_CLASS}>
          <h1
            className={cn(
              WALLPAPER_DISPLAY_HEADING_CLASS,
              GALLERY_TEXT_PRIMARY_CLASS
            )}
          >
            {title}
          </h1>
          {intro ? (
            <p
              className={cn(
                GALLERY_SUBTITLE_AFTER_TITLE_CLASS,
                "max-w-3xl text-[15px] leading-[1.6] sm:text-[16px]",
                GALLERY_TEXT_SECONDARY_CLASS
              )}
            >
              {renderInlineMarkdown(intro)}
            </p>
          ) : null}
        </header>

        <WallpaperGallery
          initial={initial}
          activeCategory={activeCategory}
          categories={categories}
          loadError={loadError}
        />
      </div>
      {afterGallery}
    </MarketingRail>
  )
}

function GalleryBreadcrumb({
  activeCategory,
}: Readonly<{ activeCategory: string | null }>) {
  return (
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
              <BreadcrumbLink asChild className="transition hover:text-white">
                <Link href={wallpapersGalleryPath()}>Wallpapers</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/35" />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className={GALLERY_TEXT_PRIMARY_CLASS}>
                {categoryDisplayLabel(activeCategory)}
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
  )
}

const INLINE_TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g
const INLINE_LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/
const INLINE_LINK_CLASS =
  "text-white/90 underline decoration-white/30 underline-offset-[3px] transition hover:text-white hover:decoration-white/70"

/** `**bold**` and `[label](href)`; internal links use next/link, without prefetch. */
function renderInlineMarkdown(text: string, keyPrefix = ""): ReactNode[] {
  return text
    .split(INLINE_TOKEN)
    .filter(Boolean)
    .map((part, index) => {
      const key = `${keyPrefix}${index}`
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={key} className="font-medium text-white">
            {renderInlineMarkdown(part.slice(2, -2), `${key}-`)}
          </strong>
        )
      }
      const link = part.match(INLINE_LINK)
      if (link) {
        const [, label, href] = link
        return href.startsWith("/") ? (
          <Link
            key={key}
            href={href}
            prefetch={false}
            className={INLINE_LINK_CLASS}
          >
            {label}
          </Link>
        ) : (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={INLINE_LINK_CLASS}
          >
            {label}
          </a>
        )
      }
      return part
    })
}

/** Hub copy below the grid: body sections, then the FAQ the page's FAQPage JSON-LD describes. */
export function GalleryHubProse({
  sections,
  faq,
  faqHeadingId = "gallery-faq",
}: Readonly<{
  sections?: readonly ContentBlock[]
  faq?: readonly ContentFaq[]
  faqHeadingId?: string
}>) {
  if (!sections?.length && !faq?.length) return null

  return (
    <div className="px-4 py-10 md:px-6 md:py-14">
      <div className="marketing-prose-rail">
        {sections?.length ? (
          <div className={proseBody}>
            <ContentBody sections={[...sections]} />
          </div>
        ) : null}
        {faq?.length ? (
          <section
            className={cn(proseFaq, sections?.length && "mt-14")}
            aria-labelledby={faqHeadingId}
          >
            <h2 id={faqHeadingId} className={proseFaqTitle}>
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
      </div>
    </div>
  )
}
