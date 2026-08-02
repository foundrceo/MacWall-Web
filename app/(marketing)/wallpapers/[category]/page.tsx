import {
  WallpaperGalleryPageShell,
  parseGallerySort,
} from "@/components/wallpaper-gallery/wallpaper-gallery-page"
import { JsonLd } from "@/components/seo/json-ld"
import { wallpaperCategoryGalleryJsonLd } from "@/lib/seo/wallpaper-json-ld"
import { wallpaperCategoryGalleryMetadata } from "@/lib/seo/wallpaper-metadata"
import { listPublicWallpapers } from "@/lib/public-catalog/fetch"
import {
  categoryNameFromSlug,
  wallpaperCategorySlugs,
} from "@/lib/seo/category-slugs"
import { wallpaperCategoryPage } from "@/lib/seo/landing-pages"
import { faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { macwall } from "@/lib/macwall-site"
import { canonicalSiteOrigin } from "@/lib/site-url"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

type PageProps = {
  params: Promise<{ category: string }>
  searchParams: Promise<{
    q?: string
    tag?: string
    sort?: string
  }>
}

export async function generateStaticParams() {
  return wallpaperCategorySlugs.map((category) => ({ category }))
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { category } = await params
  const name = categoryNameFromSlug(category)
  if (!name) return {}

  const filters = await searchParams
  return wallpaperCategoryGalleryMetadata(name, filters)
}

export default async function WallpaperCategoryGalleryPage({
  params,
  searchParams,
}: PageProps) {
  const { category } = await params
  const name = categoryNameFromSlug(category)
  if (!name) notFound()

  const query = await searchParams
  const page = wallpaperCategoryPage(name)
  const origin = canonicalSiteOrigin()

  let initial
  try {
    initial = await listPublicWallpapers({
      category: name,
      q: query.q,
      tag: query.tag,
      sort: parseGallerySort(query.sort),
      page: 1,
      limit: 24,
    })
  } catch {
    initial = {
      wallpapers: [],
      total: 0,
      page: 1,
      limit: 24,
      hasMore: false,
    }
  }

  return (
    <>
      <JsonLd
        payload={wallpaperCategoryGalleryJsonLd({
          origin,
          categoryName: name,
          pageTitle: `${name} Live Wallpapers for Mac`,
          headline: page.headline,
          description: page.description,
          wallpapers: initial.wallpapers,
          totalCount: initial.total,
        })}
      />
      {page.faq ? <JsonLd payload={faqPageJsonLd(page.faq)} /> : null}
      <WallpaperGalleryPageShell
        initial={initial}
        activeCategory={name}
        title={`${name} live wallpapers for Mac`}
        subtitle={`Cinematic ${name} loops for your Mac desktop — curated in ${macwall.name}.`}
      />
    </>
  )
}
