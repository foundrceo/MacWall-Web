import { ComparisonLandingPage } from "@/components/content/comparison-landing-page"
import { COMPARISON_SOURCES } from "@/lib/seo/comparison-facts"
import { dynamicWallpaperClubPage } from "@/lib/seo/compare-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"

const page = dynamicWallpaperClubPage

export const metadata = createSeoPageMetadata(page, {
  openGraphType: "article",
  publishedTime: page.publishedAt,
  modifiedTime: page.updatedAt,
})

export default function DynamicWallpaperClubPage() {
  return (
    <ComparisonLandingPage
      page={page}
      breadcrumbName="Dynamic Wallpaper Club vs MacWall"
      compared={[
        {
          name: "Dynamic Wallpaper Club",
          url: COMPARISON_SOURCES.dynamicWallpaperClub,
        },
      ]}
    />
  )
}
