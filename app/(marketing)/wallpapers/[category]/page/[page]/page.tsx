import {
  categoryGalleryStaticParams,
  GalleryPageRoute,
  galleryPageMetadata,
} from "@/lib/seo/gallery-page-route"
import type { Metadata } from "next"

type PageProps = { params: Promise<{ category: string; page: string }> }

/** Same window as the gallery's catalog cache. */
export const revalidate = 21600

/**
 * Every page of every category, so each is prerendered and cached. A page a
 * category grows into after the build still renders on demand.
 */
export async function generateStaticParams() {
  return categoryGalleryStaticParams()
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category, page } = await params
  return galleryPageMetadata({ categorySlug: category }, page)
}

export default async function WallpaperCategoryGalleryPageN({
  params,
}: PageProps) {
  const { category, page } = await params
  return <GalleryPageRoute scope={{ categorySlug: category }} rawPage={page} />
}
