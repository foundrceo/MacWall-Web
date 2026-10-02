import { MarketingRail } from "@/components/macwall-marketing/marketing-rail"
import { WallpaperDetail } from "@/components/wallpaper-gallery/wallpaper-detail"
import { JsonLd } from "@/components/seo/json-ld"
import { faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { buildWallpaperDetailContent } from "@/lib/seo/wallpaper-detail-content"
import { wallpaperDetailPageJsonLd } from "@/lib/seo/wallpaper-json-ld"
import { wallpaperDetailMetadata } from "@/lib/seo/wallpaper-metadata"
import { getWallpaperUploaderCredit } from "@/lib/public-catalog/credits"
import {
  getPublicWallpaperByDetailSlug,
  listSimilarPublicWallpapers,
} from "@/lib/public-catalog/fetch"
import { wallpaperDetailPath } from "@/lib/public-catalog/urls"
import { canonicalSiteOrigin } from "@/lib/site-url"
import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"

type PageProps = {
  params: Promise<{ category: string; slug: string }>
}

/** ISR — wallpaper detail pages are crawl-heavy; avoid per-request SSR. */
export const revalidate = 3600

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
  try {
    const wallpaper = await getPublicWallpaperByDetailSlug(slug)
    if (!wallpaper) return {}
    return wallpaperDetailMetadata(wallpaper)
  } catch {
    return {}
  }
}

export default async function WallpaperDetailPage({ params }: PageProps) {
  const { category, slug } = await params

  let wallpaper
  try {
    wallpaper = await getPublicWallpaperByDetailSlug(slug)
  } catch {
    notFound()
  }
  if (!wallpaper) notFound()

  const canonicalPath = wallpaperDetailPath(wallpaper)
  if (`/wallpaper/${category}/${slug}` !== canonicalPath) {
    permanentRedirect(canonicalPath)
  }

  // `wallpaper.videoUrl` is a downscaled web preview — never the master file.
  let similar: Awaited<ReturnType<typeof listSimilarPublicWallpapers>> = []
  try {
    similar = await listSimilarPublicWallpapers(wallpaper, 6)
  } catch {
    similar = []
  }

  const uploaderCredit = await getWallpaperUploaderCredit(wallpaper)
  const origin = canonicalSiteOrigin()
  const content = buildWallpaperDetailContent(wallpaper)

  return (
    <>
      <JsonLd
        payload={wallpaperDetailPageJsonLd({
          origin,
          wallpaper,
          description: content.metaDescription,
          durationSeconds: wallpaper.durationSeconds,
        })}
      />
      <JsonLd payload={faqPageJsonLd(content.faq)} />
      <MarketingRail innerClassName="min-h-[70vh]">
        <WallpaperDetail
          wallpaper={wallpaper}
          uploaderCredit={uploaderCredit}
          similar={similar}
          origin={origin}
          content={content}
        />
      </MarketingRail>
    </>
  )
}
