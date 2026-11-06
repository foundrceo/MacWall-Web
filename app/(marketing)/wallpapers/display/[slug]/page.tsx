import { DisplayWallpapersView } from "@/components/wallpaper-gallery/display-wallpapers-view"
import { loadDisplayPage } from "@/lib/public-catalog/display-wallpapers"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import {
  DISPLAY_GRID_LIMIT,
  DISPLAY_PAGES_PATH,
  displayPageDefs,
  displayPagePath,
  displayPageDef,
  displayPageTarget,
  type DisplayPageData,
} from "@/lib/seo/display-pages"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

type PageProps = { params: Promise<{ slug: string }> }

/** Matches the catalog cache (6h); counts move as wallpapers are added. */
export const revalidate = 21600

export function generateStaticParams() {
  return displayPageDefs.map((def) => ({ slug: def.slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const data = await loadDisplayPage(slug).catch(() => null)
  if (!data) return {}
  return createSeoPageMetadata(data.page)
}

/** "783 loops fit the MacBook Air 15″ · 24 picked for this page" */
function metaLine(data: DisplayPageData): string {
  const { def, fitCount, totalPages } = data
  if (def.paginate) {
    return `${fitCount} ${fitCount === 1 ? "loop" : "loops"} · page 1 of ${totalPages}`
  }
  const target = displayPageTarget(def)
  const screen = target ? `the ${target.shortName}` : "this screen"
  return `${fitCount} ${fitCount === 1 ? "loop fits" : "loops fit"} ${screen} · ${Math.min(
    DISPLAY_GRID_LIMIT,
    data.wallpapers.length
  )} picked for this page`
}

export default async function DisplayWallpapersPage({ params }: PageProps) {
  const { slug } = await params
  const data = await loadDisplayPage(slug)
  if (!data) notFound()
  const { def, page } = data
  const fourK = displayPageDef("4k")

  return (
    <DisplayWallpapersView
      page={page}
      label={def.label}
      parents={[
        { href: "/wallpapers", label: "Wallpapers" },
        { href: DISPLAY_PAGES_PATH, label: "Displays" },
      ]}
      basePath={displayPagePath(def.slug)}
      wallpapers={data.wallpapers}
      offset={data.offset}
      pageNumber={1}
      totalPages={data.totalPages}
      meta={metaLine(data)}
      // Model pages show one picked grid; the 4K page lists the rest.
      moreHref={
        def.paginate || !fourK ? undefined : displayPagePath(fourK.slug)
      }
      moreLabel={def.paginate ? undefined : "Browse every 4K live wallpaper"}
    />
  )
}
