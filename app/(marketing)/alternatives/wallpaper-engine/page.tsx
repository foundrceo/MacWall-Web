import { ComparisonLandingPage } from "@/components/content/comparison-landing-page"
import { COMPARISON_SOURCES } from "@/lib/seo/comparison-facts"
import { wallpaperEngineAlternativePage } from "@/lib/seo/landing-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"

const page = wallpaperEngineAlternativePage

export const metadata = createSeoPageMetadata(page, {
  openGraphType: "article",
  publishedTime: page.publishedAt,
  modifiedTime: page.updatedAt,
})

export default function WallpaperEngineAlternativePage() {
  return (
    <ComparisonLandingPage
      page={page}
      breadcrumbName="Wallpaper Engine for Mac"
      compared={[
        {
          name: "Wallpaper Engine",
          url: COMPARISON_SOURCES.wallpaperEngineSteam,
          operatingSystem: "Windows 10, Windows 11",
        },
      ]}
      mentions={[
        {
          name: "WallpaperMachine",
          url: COMPARISON_SOURCES.wallpaperMachine,
          operatingSystem: "macOS 15 or later (Apple silicon only)",
        },
        {
          name: "iWallpaper",
          url: COMPARISON_SOURCES.iwallpaper,
          operatingSystem: "macOS 10.15 or later",
        },
        {
          name: "Live Wallpaper Engine HD",
          url: COMPARISON_SOURCES.liveWallpaperEngineHd,
          operatingSystem: "macOS 10.13 or later",
        },
      ]}
    />
  )
}
