import {
  CollectionRoute,
  collectionPageMetadata,
  collectionStaticParams,
} from "@/lib/seo/collection-page-route"
import type { Metadata } from "next"

type PageProps = {
  params: Promise<{ slug: string }>
}

/** Collections re-sort as likes change; 6h ISR matches the catalog cache. */
export const revalidate = 21600

export function generateStaticParams() {
  return collectionStaticParams()
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  return collectionPageMetadata(slug)
}

export default async function WallpaperCollectionRoute({ params }: PageProps) {
  const { slug } = await params
  return <CollectionRoute slug={slug} />
}
