import { DisplayWallpapersView } from "@/components/wallpaper-gallery/display-wallpapers-view"
import { loadMacbookHub } from "@/lib/public-catalog/display-wallpapers"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { MACBOOK_HUB_PATH, macbookHubDef } from "@/lib/seo/display-pages"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

type PageProps = { params: Promise<{ page: string }> }

/** Same window as the catalog cache. */
export const revalidate = 21600

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { page } = await params
  const data = await loadMacbookHub(page).catch(() => null)
  if (!data) return {}
  // Numbered pages have no Markdown twin.
  return createSeoPageMetadata(data.page, { markdownAlternate: false })
}

export default async function MacbookWallpapersPageN({ params }: PageProps) {
  const { page } = await params
  const data = await loadMacbookHub(page)
  if (!data) notFound()
  const start = data.offset + 1
  const end = data.offset + data.wallpapers.length

  return (
    <DisplayWallpapersView
      page={data.page}
      label={macbookHubDef.label}
      parents={[{ href: "/wallpapers", label: "Wallpapers" }]}
      basePath={MACBOOK_HUB_PATH}
      wallpapers={data.wallpapers}
      offset={data.offset}
      pageNumber={data.pageNumber}
      totalPages={data.totalPages}
      meta={`${start} to ${end} of ${data.fitCount} · page ${data.pageNumber} of ${data.totalPages}`}
    />
  )
}
