import { ComparisonLandingPage } from "@/components/content/comparison-landing-page"
import { COMPARISON_SOURCES } from "@/lib/seo/comparison-facts"
import { macwallVsWallspacePage } from "@/lib/seo/landing-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"

const page = macwallVsWallspacePage

export const metadata = createSeoPageMetadata(page, {
  openGraphType: "article",
  publishedTime: page.publishedAt,
  modifiedTime: page.updatedAt,
})

export default function MacwallVsWallspacePage() {
  return (
    <ComparisonLandingPage
      page={page}
      breadcrumbName="MacWall vs Wallspace"
      compared={[
        {
          name: "Wallspace",
          url: COMPARISON_SOURCES.wallspace,
          operatingSystem: "macOS 15 or later",
        },
      ]}
    />
  )
}
