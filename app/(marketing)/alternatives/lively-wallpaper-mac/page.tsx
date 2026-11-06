import { ComparisonLandingPage } from "@/components/content/comparison-landing-page"
import { COMPARISON_SOURCES } from "@/lib/seo/comparison-facts"
import { livelyWallpaperMacPage } from "@/lib/seo/landing-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"

const page = livelyWallpaperMacPage

export const metadata = createSeoPageMetadata(page, {
  openGraphType: "article",
  publishedTime: page.publishedAt,
  modifiedTime: page.updatedAt,
})

export default function LivelyWallpaperMacPage() {
  return (
    <ComparisonLandingPage
      page={page}
      breadcrumbName="Lively Wallpaper for Mac"
      compared={[
        {
          name: "Lively Wallpaper",
          url: COMPARISON_SOURCES.lively,
          operatingSystem: "Windows 10, Windows 11",
        },
      ]}
    />
  )
}
