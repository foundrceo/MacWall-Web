import { ComparisonLandingPage } from "@/components/content/comparison-landing-page"
import { COMPARISON_SOURCES } from "@/lib/seo/comparison-facts"
import { macwallVsBackdropPage } from "@/lib/seo/landing-pages"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"

const page = macwallVsBackdropPage

export const metadata = createSeoPageMetadata(page, {
  openGraphType: "article",
  publishedTime: page.publishedAt,
  modifiedTime: page.updatedAt,
})

export default function MacwallVsBackdropPage() {
  return (
    <ComparisonLandingPage
      page={page}
      breadcrumbName="MacWall vs Backdrop"
      compared={[
        {
          name: "Backdrop",
          url: COMPARISON_SOURCES.backdrop,
          operatingSystem: "macOS 15 or later",
        },
      ]}
    />
  )
}
