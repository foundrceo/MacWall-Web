import {
  GalleryPageRoute,
  galleryPageMetadata,
  galleryStaticPageNumbers,
} from "@/lib/seo/gallery-page-route"
import type { Metadata } from "next"

type PageProps = { params: Promise<{ page: string }> }

/** Same window as the gallery's catalog cache. */
export const revalidate = 21600

/**
 * Every page of the gallery, so each is prerendered and cached: rendered on
 * demand, a deep page answered its first crawler in several seconds. A page
 * the catalog grows into after the build still renders on demand.
 */
export async function generateStaticParams() {
  const pages = await galleryStaticPageNumbers({ categorySlug: null })
  return pages.map((page) => ({ page }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { page } = await params
  return galleryPageMetadata({ categorySlug: null }, page)
}

export default async function WallpapersGalleryPageN({ params }: PageProps) {
  const { page } = await params
  return <GalleryPageRoute scope={{ categorySlug: null }} rawPage={page} />
}
