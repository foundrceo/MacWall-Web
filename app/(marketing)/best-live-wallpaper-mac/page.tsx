import { ComparisonLandingPage } from "@/components/content/comparison-landing-page"
import { macWallpaperApps } from "@/lib/seo/compare-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { bestLiveWallpaperMacPage } from "@/lib/seo/landing-pages"

const page = bestLiveWallpaperMacPage

export const metadata = createSeoPageMetadata(page, {
  openGraphType: "article",
  publishedTime: page.publishedAt,
  modifiedTime: page.updatedAt,
})

export default function BestLiveWallpaperMacPage() {
  // The live video apps the page compares, as listed in the /compare table.
  const mentions = macWallpaperApps()
    .filter((app) => app.type === "Live video" && app.name !== "MacWall")
    .map((app) => ({ name: app.name, url: app.siteUrl }))

  return (
    <ComparisonLandingPage
      page={page}
      breadcrumbName="Best live wallpaper apps"
      mentions={mentions}
    />
  )
}
