import {
  GalleryPageRoute,
  galleryPageMetadata,
} from "@/lib/seo/gallery-page-route"
import type { Metadata } from "next"

type PageProps = { params: Promise<{ page: string }> }

/** Same window as the gallery's catalog cache. */
export const revalidate = 21600

export async function generateStaticParams() {
  return []
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
