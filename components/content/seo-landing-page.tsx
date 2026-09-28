import { SeoPageShell } from "@/components/content/seo-page-shell"
import {
  ProseActionRow,
  ProseSecondaryLink,
} from "@/components/content/prose-action-row"
import { TrackedDownloadButton } from "@/components/analytics/tracked-marketing-buttons"
import { TextLink } from "@/components/macwall-marketing/marketing-primitives"
import { JsonLd } from "@/components/seo/json-ld"
import { faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { macwallInstallerLatestPath } from "@/lib/macwall-site"
import type { SeoContentPage } from "@/lib/content/types"

export function SeoLandingPage({
  page,
  breadcrumbs,
  showDownloadCta = true,
}: Readonly<{
  page: SeoContentPage
  breadcrumbs?: { label: string; href: string }[]
  showDownloadCta?: boolean
}>) {
  return (
    <>
      {page.faq && page.faq.length > 0 ? (
        <JsonLd payload={faqPageJsonLd(page.faq)} />
      ) : null}
      <SeoPageShell
        headline={page.headline}
        description={page.description}
        sections={page.sections}
        faq={page.faq}
        breadcrumbs={breadcrumbs}
      >
        {showDownloadCta ? (
          <ProseActionRow>
            <TrackedDownloadButton
              href={macwallInstallerLatestPath}
              size="lg"
              location="seo_landing"
            >
              Download for Mac
            </TrackedDownloadButton>
            <ProseSecondaryLink href="/pricing">
              View pricing
            </ProseSecondaryLink>
            <TextLink href="/blog">{`Read the blog`}</TextLink>
          </ProseActionRow>
        ) : null}
      </SeoPageShell>
    </>
  )
}
