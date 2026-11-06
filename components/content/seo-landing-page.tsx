import { SeoPageShell } from "@/components/content/seo-page-shell"
import {
  ProseActionRow,
  ProseSecondaryLink,
} from "@/components/content/prose-action-row"
import { TrackedDownloadButton } from "@/components/analytics/tracked-marketing-buttons"
import { TextLink } from "@/components/macwall-marketing/marketing-primitives"
import { SendToMacButton } from "@/components/macwall-marketing/send-to-mac-dialog"
import { JsonLd } from "@/components/seo/json-ld"
import { faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { macwall, macwallInstallerLatestPath } from "@/lib/macwall-site"
import { prosePrimaryBtn } from "@/lib/marketing-prose-classes"
import type { SeoContentPage } from "@/lib/content/types"
import { cn } from "@/lib/utils"

/** TrackedDownloadButton's `lg` size, for the Send to my Mac twin. */
const sendToMacLgClass = cn(
  prosePrimaryBtn,
  "prose-primary-btn",
  "min-h-[48px] gap-2 px-6 text-[17px] tracking-[-0.022em]"
)

function formatCheckedDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
}

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
        meta={
          page.updatedAt ? (
            <>
              Last checked{" "}
              <time dateTime={page.updatedAt}>
                {formatCheckedDate(page.updatedAt)}
              </time>{" "}
              by the {macwall.name} team
            </>
          ) : undefined
        }
      >
        {showDownloadCta ? (
          <ProseActionRow>
            {/* Macs get the .dmg; phones, Windows and Linux get "Send to my
                Mac" (data-platform, set before paint). Only one shows. */}
            <span className="mw-when-mac flex flex-col sm:block">
              <TrackedDownloadButton
                href={macwallInstallerLatestPath}
                size="lg"
                location="seo_landing"
              >
                Download for Mac
              </TrackedDownloadButton>
            </span>
            <span className="mw-when-not-mac flex flex-col sm:block">
              <SendToMacButton
                location="seo_landing"
                className={sendToMacLgClass}
              />
            </span>
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
