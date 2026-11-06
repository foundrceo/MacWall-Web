import { MarketingRail } from "@/components/macwall-marketing/marketing-rail"
import { WallpaperDetail } from "@/components/wallpaper-gallery/wallpaper-detail"
import { JsonLd } from "@/components/seo/json-ld"
import { faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { buildWallpaperDetailContent } from "@/lib/seo/wallpaper-detail-content"
import { buildWallpaperDetailLinks } from "@/lib/seo/wallpaper-detail-links"
import { wallpaperDetailPageJsonLd } from "@/lib/seo/wallpaper-json-ld"
import { wallpaperDetailMetadata } from "@/lib/seo/wallpaper-metadata"
import {
  getPublicWallpaperByDetailSlug,
  listPublicWallpapersForCollections,
  listSimilarPublicWallpapers,
} from "@/lib/public-catalog/fetch"
import type { PublicWallpaper } from "@/lib/public-catalog/types"
import { canonicalSiteOrigin } from "@/lib/site-url"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

type PageProps = {
  params: Promise<{ category: string; slug: string }>
}

/** Crawl-heavy, so a long ISR window. Matches PUBLIC_WALLPAPER_DETAIL_REVALIDATE_SECONDS (1 week). */
export const revalidate = 604800

/**
 * Required for the `revalidate` above to take effect: without
 * `generateStaticParams` a dynamic segment renders on every request. Empty =
 * nothing at build time; each wallpaper is rendered on first visit, then
 * served from the ISR cache (also purged by the catalog tag on publish).
 */
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const wallpaper = await getPublicWallpaperByDetailSlug(slug)
  if (!wallpaper) return {}
  return wallpaperDetailMetadata(wallpaper)
}

export default async function WallpaperDetailPage({ params }: PageProps) {
  const { slug } = await params

  const wallpaper = await getPublicWallpaperByDetailSlug(slug)
  if (!wallpaper) notFound()

  // A wrong category, stale name, bare id or uppercase URL gets one 308 to
  // the canonical path in worker/index.ts before it reaches this page. One
  // that slips through (a wallpaper newer than the Worker's map, or
  // `next start`) renders here, with `rel=canonical` on the canonical path.

  // `wallpaper.videoUrl` is the downscaled web preview, never the master file.
  let similar: PublicWallpaper[] = []
  try {
    similar = await listSimilarPublicWallpapers(wallpaper)
  } catch {
    similar = []
  }
  // The same cached catalog index the wallpaper came from: counts collection
  // members (only indexable collections are linked) and fills "Also in".
  let catalog: PublicWallpaper[] | null
  try {
    catalog = await listPublicWallpapersForCollections()
  } catch {
    catalog = null
  }

  const origin = canonicalSiteOrigin()
  const content = buildWallpaperDetailContent(wallpaper)
  const links = buildWallpaperDetailLinks({
    wallpaper,
    content,
    catalog,
    similar,
  })

  return (
    <>
      <JsonLd
        payload={wallpaperDetailPageJsonLd({
          origin,
          wallpaper,
          description: content.summary,
          headline: content.heading,
          durationSeconds: wallpaper.durationSeconds,
        })}
      />
      <JsonLd payload={faqPageJsonLd(content.faq)} />
      <MarketingRail innerClassName="min-h-[70vh]">
        <WallpaperDetail
          wallpaper={wallpaper}
          similar={similar}
          origin={origin}
          content={content}
          links={links}
        />
      </MarketingRail>
    </>
  )
}
