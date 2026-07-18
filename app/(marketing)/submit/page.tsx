import type { Metadata } from "next"

import MarketingSiteChrome, {
  MARKETING_MAIN_OFFSET_CLASS,
} from "@/components/macwall-marketing/MarketingSiteChrome"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import {
  MarketingContainer,
  SectionLead,
  SectionTitle,
} from "@/components/macwall-marketing/marketing-primitives"
import { SubmitWallpaperForm } from "@/components/macwall-marketing/submit-wallpaper-form"
import { JsonLd } from "@/components/seo/json-ld"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwall } from "@/lib/macwall-site"
import { MARKETING_PAGE_CLASS } from "@/lib/marketing-chrome"
import {
  canonicalSiteOrigin,
  canonicalSitePath,
  openGraphImageAbsoluteUrl,
  openGraphImageSize,
} from "@/lib/site-url"

const PAGE_TITLE = "Submit a Wallpaper"
const PAGE_DESCRIPTION = `Share your own live wallpaper with the ${macwall.name} community. Upload an MP4, MOV, M4V, or WEBM video and our team will review it for the catalog.`

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: canonicalSitePath("/submit") },
  openGraph: {
    title: `${macwall.name} – ${PAGE_TITLE}`,
    description: PAGE_DESCRIPTION,
    url: canonicalSitePath("/submit"),
    siteName: `${macwall.name} App`,
    type: "website",
    images: [
      {
        url: openGraphImageAbsoluteUrl(),
        width: openGraphImageSize.width,
        height: openGraphImageSize.height,
        alt: `${macwall.name} – ${PAGE_TITLE}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${macwall.name} – ${PAGE_TITLE}`,
    description: PAGE_DESCRIPTION,
    images: [openGraphImageAbsoluteUrl()],
  },
}

export default function SubmitPage() {
  const jsonLd = webPageWithBreadcrumbsJsonLd({
    origin: canonicalSiteOrigin(),
    pathname: "/submit",
    pageTitle: PAGE_TITLE,
    headline: `Submit a wallpaper to ${macwall.name}`,
    description: PAGE_DESCRIPTION,
  })

  return (
    <div className={MARKETING_PAGE_CLASS}>
      <JsonLd payload={jsonLd} />
      <MarketingSiteChrome />
      <main id="main-content" className={MARKETING_MAIN_OFFSET_CLASS}>
        <section className="py-16 md:py-24">
          <MarketingContainer>
            <div className="mx-auto max-w-[640px] text-center">
              <SectionTitle as="h1">{PAGE_TITLE}</SectionTitle>
              <SectionLead className="mx-auto mt-4 max-w-[540px] md:mt-5">
                Share a live wallpaper you made or own with the {macwall.name}{" "}
                community. Add a title, pick a category, and upload your video —
                we review every submission before it goes live.
              </SectionLead>
            </div>

            <div className="mx-auto mt-10 max-w-[560px] md:mt-12">
              <SubmitWallpaperForm />
            </div>
          </MarketingContainer>
        </section>
      </main>
      <MacWallMarketingPageEnd showBottomCta={false} />
    </div>
  )
}
