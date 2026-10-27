import {
  GalleryPageRoute,
  galleryPageMetadata,
} from "@/lib/seo/gallery-page-route"
import type { Metadata } from "next"

type PageProps = { params: Promise<{ category: string; page: string }> }

/** Same window as the gallery's catalog cache. */
export const revalidate = 21600

export async function generateStaticParams() {
  return []
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
