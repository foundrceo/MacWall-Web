"use client"

import Link from "next/link"
import { useParams } from "next/navigation"

import { CatalogImage } from "@/components/wallpaper-gallery/catalog-image"
import {
  GALLERY_MEDIA_RADIUS_CLASS,
  GALLERY_TEXT_PRIMARY_CLASS,
} from "@/lib/public-catalog/chrome"
import { WALLPAPER_SECTION_SERIF_HEADING_CLASS } from "@/lib/public-catalog/typography"
import { cn } from "@/lib/utils"

export type NotFoundPick = {
  href: string
  name: string
  thumbUrl: string
}

/**
 * Popular wallpapers for a missing detail page, from the category in its URL.
 * Not-found boundaries get no params, so the server sends every category's
 * picks and this reads the category from the route (SSR included).
 */
export function WallpaperNotFoundPicks({
  categorySlugs,
  categoryNames,
  picksByCategory,
  popular,
}: Readonly<{
  /** Current and retired category slugs → current slug. */
  categorySlugs: Record<string, string>
  /** Current slug → display name. */
  categoryNames: Record<string, string>
  picksByCategory: Record<string, NotFoundPick[]>
  /** Most-liked across the catalog, for URLs with no known category. */
  popular: NotFoundPick[]
}>) {
  const params = useParams<{ category?: string }>()
  const requested =
    typeof params?.category === "string" ? params.category.toLowerCase() : ""
  const slug = categorySlugs[requested]
  const categoryPicks = slug ? picksByCategory[slug] : undefined
  const name = categoryPicks?.length ? categoryNames[slug] : undefined
  const picks = name && categoryPicks ? categoryPicks : popular
  if (picks.length === 0) return null

  return (
    <section aria-labelledby="not-found-picks" className="mt-14 md:mt-16">
      <div className="mb-7 flex items-baseline justify-between gap-5 sm:gap-6">
        <h2
          id="not-found-picks"
          className={WALLPAPER_SECTION_SERIF_HEADING_CLASS}
        >
          {name ? `Popular ${name} live wallpapers` : "Popular live wallpapers"}
        </h2>
        <Link
          href={name ? `/wallpapers/${slug}` : "/wallpapers"}
          className="shrink-0 font-sans text-[14px] leading-snug text-white/65 transition hover:text-white"
        >
          {name ? `Browse ${name}` : "Browse all"}
        </Link>
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
        {picks.map((pick) => (
          <li key={pick.href}>
            <Link href={pick.href} className="group block outline-none">
              <div
                className={cn(
                  "relative aspect-video overflow-hidden bg-[#141414]",
                  "group-focus-visible:ring-2 group-focus-visible:ring-white/40",
                  GALLERY_MEDIA_RADIUS_CLASS
                )}
              >
                <CatalogImage
                  src={pick.thumbUrl}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                  draggable={false}
                />
              </div>
              <p
                className={cn(
                  "mt-2.5 line-clamp-1 text-[14px] leading-snug opacity-85 transition group-hover:opacity-100",
                  GALLERY_TEXT_PRIMARY_CLASS
                )}
              >
                {pick.name}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
