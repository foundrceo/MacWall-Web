import type { Metadata } from "next"
import Link from "next/link"

import { MarketingRail } from "@/components/macwall-marketing/marketing-rail"
import {
  WallpaperNotFoundPicks,
  type NotFoundPick,
} from "@/components/wallpaper-gallery/wallpaper-not-found-picks"
import { macwall } from "@/lib/macwall-site"
import {
  GALLERY_CHIP_CLASS,
  GALLERY_TEXT_SECONDARY_CLASS,
  GALLERY_TEXT_TERTIARY_CLASS,
} from "@/lib/public-catalog/chrome"
import { listPublicWallpapersForCollections } from "@/lib/public-catalog/fetch"
import {
  WALLPAPER_DISPLAY_HEADING_CLASS,
  WALLPAPER_SECTION_FONT_CLASS,
} from "@/lib/public-catalog/typography"
import { wallpaperDetailPath } from "@/lib/public-catalog/urls"
import {
  categorySlugFromName,
  LEGACY_CATEGORY_SLUG_REDIRECTS,
} from "@/lib/seo/category-slugs"
import { WALLPAPER_COLLECTIONS_HUB_PATH } from "@/lib/seo/wallpaper-collections"
import { isThinWallpaper } from "@/lib/seo/wallpaper-detail-content"
import { cn } from "@/lib/utils"

// No `robots` here: the framework already marks not-found responses noindex.
export const metadata: Metadata = {
  title: "Wallpaper not found",
  description:
    "This wallpaper isn't in the MacWall catalog. Browse popular live wallpapers for Mac by category.",
}

const PICKS_PER_LIST = 12

const categories = macwall.categories.flatMap((name) => {
  const slug = categorySlugFromName(name)
  return slug ? [{ name, slug }] : []
})

/** Most-liked indexable wallpapers, overall and per category. */
async function loadPicks(): Promise<{
  picksByCategory: Record<string, NotFoundPick[]>
  popular: NotFoundPick[]
} | null> {
  try {
    const wallpapers = await listPublicWallpapersForCollections()
    const picksByCategory: Record<string, NotFoundPick[]> = {}
    const popular: NotFoundPick[] = []
    // The index is most-liked first.
    for (const wallpaper of wallpapers) {
      if (isThinWallpaper(wallpaper)) continue
      const pick = {
        href: wallpaperDetailPath(wallpaper),
        name: wallpaper.name,
        thumbUrl: wallpaper.thumbUrl,
      }
      if (popular.length < PICKS_PER_LIST) popular.push(pick)
      const slug = categorySlugFromName(wallpaper.category)
      if (!slug) continue
      const list = (picksByCategory[slug] ??= [])
      if (list.length < PICKS_PER_LIST) list.push(pick)
    }
    return { picksByCategory, popular }
  } catch {
    return null
  }
}

/** A detail URL whose wallpaper isn't in the catalog (unknown or removed id). */
export default async function WallpaperNotFound() {
  const picks = await loadPicks()

  const categorySlugs: Record<string, string> = {
    ...LEGACY_CATEGORY_SLUG_REDIRECTS,
  }
  const categoryNames: Record<string, string> = {}
  for (const { name, slug } of categories) {
    categorySlugs[slug] = slug
    categoryNames[slug] = name
  }

  return (
    <MarketingRail innerClassName="min-h-[70vh]">
      <div className={cn(WALLPAPER_SECTION_FONT_CLASS, "pt-4 pb-10 md:pt-8")}>
        <p
          className={cn(
            "text-[12px] font-medium tracking-[0.06em] uppercase",
            GALLERY_TEXT_TERTIARY_CLASS
          )}
        >
          Not found
        </p>
        <h1 className={cn(WALLPAPER_DISPLAY_HEADING_CLASS, "mt-3")}>
          This wallpaper isn&apos;t in the catalog
        </h1>
        <p
          className={cn(
            "mt-4 max-w-xl text-[16px] leading-relaxed text-pretty",
            GALLERY_TEXT_SECONDARY_CLASS
          )}
        >
          The link may be mistyped, or the wallpaper was taken out of the
          catalog. Pick another below, or browse by category.
        </p>
        <nav
          aria-label="Wallpaper categories"
          className="mt-7 flex flex-wrap gap-2"
        >
          {categories.map(({ name, slug }) => (
            <Link
              key={slug}
              href={`/wallpapers/${slug}`}
              className={GALLERY_CHIP_CLASS}
            >
              {name}
            </Link>
          ))}
          <Link
            href={WALLPAPER_COLLECTIONS_HUB_PATH}
            className={GALLERY_CHIP_CLASS}
          >
            Collections
          </Link>
        </nav>
        {picks ? (
          <WallpaperNotFoundPicks
            categorySlugs={categorySlugs}
            categoryNames={categoryNames}
            picksByCategory={picks.picksByCategory}
            popular={picks.popular}
          />
        ) : null}
      </div>
    </MarketingRail>
  )
}
