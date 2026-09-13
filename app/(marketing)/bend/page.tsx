import { JsonLd } from "@/components/seo/json-ld"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { macwall } from "@/lib/macwall-site"
import {
  canonicalSiteOrigin,
  canonicalSitePath,
  openGraphImageAbsoluteUrl,
  openGraphImageSize,
} from "@/lib/site-url"
import type { Metadata } from "next"

import { Bend } from "../_components/bend"

const bend = macwallMarketingCopy.landing.bend
const PAGE_TITLE = "Bend"
const PAGE_DESCRIPTION = bend.lead

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: canonicalSitePath("/bend"),
  },
  openGraph: {
    title: `${macwall.name} – ${bend.title}`,
    description: PAGE_DESCRIPTION,
    url: canonicalSitePath("/bend"),
    siteName: macwall.name,
    type: "website",
    images: [
      {
        url: openGraphImageAbsoluteUrl(),
        width: openGraphImageSize.width,
        height: openGraphImageSize.height,
        alt: `${macwall.name} – ${bend.title}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${macwall.name} – ${bend.title}`,
    description: PAGE_DESCRIPTION,
    images: [openGraphImageAbsoluteUrl()],
  },
}

export default function BendPage() {
  const jsonLd = webPageWithBreadcrumbsJsonLd({
    origin: canonicalSiteOrigin(),
    pathname: "/bend",
    pageTitle: PAGE_TITLE,
    headline: bend.title,
    description: PAGE_DESCRIPTION,
  })

  return (
    <>
      <JsonLd payload={jsonLd} />
      <Bend />
    </>
  )
}
