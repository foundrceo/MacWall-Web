import { ComparisonLandingPage } from "@/components/content/comparison-landing-page"
import { COMPARISON_SOURCES } from "@/lib/seo/comparison-facts"
import { plashAlternativePage } from "@/lib/seo/compare-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"

const page = plashAlternativePage

export const metadata = createSeoPageMetadata(page, {
  openGraphType: "article",
  publishedTime: page.publishedAt,
  modifiedTime: page.updatedAt,
})

export default function PlashAlternativePage() {
  return (
    <ComparisonLandingPage
      page={page}
      breadcrumbName="Plash vs MacWall"
      compared={[
        {
          name: "Plash",
          url: COMPARISON_SOURCES.plashSite,
          operatingSystem: "macOS 26.4 or later",
        },
      ]}
    />
  )
}
