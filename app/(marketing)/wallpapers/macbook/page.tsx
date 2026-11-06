import { DisplayWallpapersView } from "@/components/wallpaper-gallery/display-wallpapers-view"
import { loadMacbookHub } from "@/lib/public-catalog/display-wallpapers"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { MACBOOK_HUB_PATH, macbookHubDef } from "@/lib/seo/display-pages"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

/** Matches the catalog cache (6h); counts move as wallpapers are added. */
export const revalidate = 21600

export async function generateMetadata(): Promise<Metadata> {
  const data = await loadMacbookHub().catch(() => null)
  if (!data) return {}
  return createSeoPageMetadata(data.page)
}

/**
 * /wallpapers/macbook: the hub for "macbook wallpaper". Every MacBook size
 * from Apple's specs, and every 4K loop (each fills every current MacBook)
 * in an order of its own over numbered pages.
 */
export default async function MacbookWallpapersPage() {
  const data = await loadMacbookHub()
  if (!data) notFound()

  return (
    <DisplayWallpapersView
      page={data.page}
      label={macbookHubDef.label}
      parents={[{ href: "/wallpapers", label: "Wallpapers" }]}
      basePath={MACBOOK_HUB_PATH}
      wallpapers={data.wallpapers}
      offset={data.offset}
      pageNumber={1}
      totalPages={data.totalPages}
      meta={`${data.fitCount} 4K loops, each fills every current MacBook · page 1 of ${data.totalPages}`}
    />
  )
}
