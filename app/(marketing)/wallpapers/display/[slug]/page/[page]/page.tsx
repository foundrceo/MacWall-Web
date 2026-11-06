import { DisplayWallpapersView } from "@/components/wallpaper-gallery/display-wallpapers-view"
import { loadDisplayPageNumber } from "@/lib/public-catalog/display-wallpapers"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { DISPLAY_PAGES_PATH, displayPagePath } from "@/lib/seo/display-pages"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

type PageProps = { params: Promise<{ slug: string; page: string }> }

/** Same window as the catalog cache. */
export const revalidate = 21600

/** Rendered on first request; only the 4K and ultrawide pages have numbered pages. */
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, page } = await params
  const data = await loadDisplayPageNumber(slug, page).catch(() => null)
  if (!data) return {}
  // Numbered pages have no Markdown twin.
  return createSeoPageMetadata(data.page, { markdownAlternate: false })
}

export default async function DisplayWallpapersPageN({ params }: PageProps) {
  const { slug, page } = await params
  const data = await loadDisplayPageNumber(slug, page)
  if (!data) notFound()
  const start = data.offset + 1
  const end = data.offset + data.wallpapers.length

  return (
    <DisplayWallpapersView
      page={data.page}
      label={data.def.label}
      parents={[
        { href: "/wallpapers", label: "Wallpapers" },
        { href: DISPLAY_PAGES_PATH, label: "Displays" },
      ]}
      basePath={displayPagePath(data.def.slug)}
      wallpapers={data.wallpapers}
      offset={data.offset}
      pageNumber={data.pageNumber}
      totalPages={data.totalPages}
      meta={`${start} to ${end} of ${data.fitCount} · page ${data.pageNumber} of ${data.totalPages}`}
    />
  )
}
