import { ComparisonLandingPage } from "@/components/content/comparison-landing-page"
import { COMPARISON_SOURCES } from "@/lib/seo/comparison-facts"
import { twentyFourHourWallpaperPage } from "@/lib/seo/compare-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"

const page = twentyFourHourWallpaperPage

export const metadata = createSeoPageMetadata(page, {
  openGraphType: "article",
  publishedTime: page.publishedAt,
  modifiedTime: page.updatedAt,
})

export default function TwentyFourHourWallpaperPage() {
  return (
    <ComparisonLandingPage
      page={page}
      breadcrumbName="24 Hour Wallpaper vs MacWall"
      compared={[
        {
          name: "24 Hour Wallpaper",
          url: COMPARISON_SOURCES.twentyFourHour,
          operatingSystem: "macOS 15 or later",
        },
      ]}
    />
  )
}
