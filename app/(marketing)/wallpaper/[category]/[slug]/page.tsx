import MarketingSiteChrome, {
  MARKETING_MAIN_OFFSET_CLASS,
} from "@/components/macwall-marketing/MarketingSiteChrome"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import { WallpaperDetail } from "@/components/wallpaper-gallery/wallpaper-detail"
import { JsonLd } from "@/components/seo/json-ld"
import { wallpaperDetailPageJsonLd } from "@/lib/seo/wallpaper-json-ld"
import { wallpaperDetailMetadata } from "@/lib/seo/wallpaper-metadata"
import { MARKETING_PAGE_CLASS } from "@/lib/marketing-chrome"
import {
  getPublicWallpaperByDetailSlug,
  listSimilarPublicWallpapers,
} from "@/lib/public-catalog/fetch"
import { resolvePreviewVideoUrl } from "@/lib/public-catalog/preview-video-url"
import { wallpaperDetailPath } from "@/lib/public-catalog/urls"
import { macwall } from "@/lib/macwall-site"
import { canonicalSiteOrigin } from "@/lib/site-url"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { notFound, permanentRedirect } from "next/navigation"

type PageProps = {
  params: Promise<{ category: string; slug: string }>
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

  const [similarResult, previewVideoUrlResult] = await Promise.allSettled([
    listSimilarPublicWallpapers(wallpaper, 6),
    resolvePreviewVideoUrl(wallpaper.videoKey),
  ])

  const similar =
    similarResult.status === "fulfilled" ? similarResult.value : []
  const previewVideoUrl =
    previewVideoUrlResult.status === "fulfilled"
      ? previewVideoUrlResult.value
      : wallpaper.videoUrl

  const origin = canonicalSiteOrigin()
  const detailDescription = `${wallpaper.name} live wallpaper for Mac in ${wallpaper.category}. Preview the loop and set it with ${macwall.name}.`

  return (
    <div className={MARKETING_PAGE_CLASS}>
      <JsonLd
        payload={wallpaperDetailPageJsonLd({
          origin,
          wallpaper,
          description: detailDescription,
          durationSeconds: wallpaper.durationSeconds,
        })}
      />
      <MarketingSiteChrome />
      <main
        id="main-content"
        className={cn(MARKETING_MAIN_OFFSET_CLASS, "min-h-[70vh]")}
      >
        <WallpaperDetail
          wallpaper={wallpaper}
          similar={similar}
          origin={origin}
          previewVideoUrl={previewVideoUrl}
        />
      </main>
      <MacWallMarketingPageEnd />
    </div>
  )
}
