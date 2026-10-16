import { ChangelogPage } from "@/components/changelog/changelog-page"
import { JsonLd } from "@/components/seo/json-ld"
import { getChangelogPageData } from "@/lib/changelog/get-changelog-releases"
import { CHANGELOG_SEO_DESCRIPTION } from "@/lib/changelog/page-copy"
import { CHANGELOG_PAGE_TITLE } from "@/lib/changelog/types"
import { macwall } from "@/lib/macwall-site"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { canonicalSiteOrigin } from "@/lib/site-url"
import type { Metadata } from "next"

const PAGE_PATH = "/changelog"

/**
 * ISR — hourly. A 5-minute TTL rebuilt this page ~288×/day (the site's top ISR
 * writer) for releases that ship a few times a month; a new R2
 * `releases/changelog.json` now shows up within the hour.
 */
export const revalidate = 3600

const seoPage = {
  slug: "changelog",
  pathname: PAGE_PATH,
  title: "Changelog: MacWall Updates & Release History",
  headline: CHANGELOG_PAGE_TITLE,
  description: CHANGELOG_SEO_DESCRIPTION,
  keywords: [
    "macwall changelog",
    "macwall updates",
    "macwall release notes",
    macwall.name,
  ],
  sections: [],
}

export const metadata: Metadata = createSeoPageMetadata(seoPage)

export default async function ChangelogRoutePage() {
  const data = await getChangelogPageData()

  const jsonLd = webPageWithBreadcrumbsJsonLd({
    origin: canonicalSiteOrigin(),
    pathname: PAGE_PATH,
    pageTitle: seoPage.title,
    headline: seoPage.headline,
    description: seoPage.description,
    dateModifiedIso: data.syncedAt,
  })

  return (
    <>
      <JsonLd payload={jsonLd} />
      <ChangelogPage releases={data.releases} copy={data.copy} />
    </>
  )
}
