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
import { SupportCenter } from "@/components/macwall-marketing/support-center"
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

const PAGE_TITLE = "Live Support"
const PAGE_DESCRIPTION = `Get help with ${macwall.name}. Open support tickets, chat with our team, and track replies — the same live support system as the Mac app.`

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: canonicalSitePath("/support") },
  openGraph: {
    title: `${macwall.name} – ${PAGE_TITLE}`,
    description: PAGE_DESCRIPTION,
    url: canonicalSitePath("/support"),
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

export default function SupportPage() {
  const jsonLd = webPageWithBreadcrumbsJsonLd({
    origin: canonicalSiteOrigin(),
    pathname: "/support",
    pageTitle: PAGE_TITLE,
    headline: `${macwall.name} Support`,
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
                Professional live support for {macwall.name}. Submit a ticket, manage
                your conversations, and receive replies from our support team in real time.
              </SectionLead>
            </div>

            <div className="mx-auto mt-10 max-w-[960px] md:mt-12">
              <SupportCenter />
            </div>
          </MarketingContainer>
        </section>
        <MacWallMarketingPageEnd />
      </main>
    </div>
  )
}
