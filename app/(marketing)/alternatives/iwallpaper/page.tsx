import { ComparisonLandingPage } from "@/components/content/comparison-landing-page"
import { COMPARISON_SOURCES } from "@/lib/seo/comparison-facts"
import { iwallpaperAlternativePage } from "@/lib/seo/compare-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"

const page = iwallpaperAlternativePage

export const metadata = createSeoPageMetadata(page, {
  openGraphType: "article",
  publishedTime: page.publishedAt,
  modifiedTime: page.updatedAt,
})

export default function IwallpaperAlternativePage() {
  return (
    <ComparisonLandingPage
      page={page}
      breadcrumbName="iWallpaper vs MacWall"
      compared={[
        {
          name: "iWallpaper",
          url: COMPARISON_SOURCES.iwallpaper,
          operatingSystem: "macOS 10.15 or later",
        },
      ]}
    />
  )
}
