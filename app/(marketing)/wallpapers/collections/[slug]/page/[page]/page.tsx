import {
  CollectionRoute,
  collectionPageNMetadata,
} from "@/lib/seo/collection-page-route"
import type { Metadata } from "next"

type PageProps = { params: Promise<{ slug: string; page: string }> }

/** Same window as the collection page and the catalog cache. */
export const revalidate = 21600

/** Rendered on first request, then cached; `/page/1` 308s to the collection. */
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, page } = await params
  return collectionPageNMetadata(slug, page)
}

export default async function WallpaperCollectionPageN({ params }: PageProps) {
  const { slug, page } = await params
  return <CollectionRoute slug={slug} rawPage={page} />
}
