import { JsonLd } from "@/components/seo/json-ld"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { createSimplePageMetadata } from "@/lib/seo/create-page-metadata"
import { canonicalSiteOrigin } from "@/lib/site-url"
import type { Metadata } from "next"

import { Bend } from "../_components/bend"

const bend = macwallMarketingCopy.landing.bend
const PAGE_TITLE = "Bend"
const PAGE_HEADLINE = "Bend: a lid-angle desktop effect for MacBook"
const PAGE_DESCRIPTION = bend.lead

export const metadata: Metadata = createSimplePageMetadata({
  title: "Bend: Lid-Angle Desktop Effect for MacBook",
  description: PAGE_DESCRIPTION,
  path: "/bend",
})

export default function BendPage() {
  const jsonLd = webPageWithBreadcrumbsJsonLd({
    origin: canonicalSiteOrigin(),
    pathname: "/bend",
    pageTitle: PAGE_TITLE,
    headline: PAGE_HEADLINE,
    description: PAGE_DESCRIPTION,
    aboutId: "#softwareapplication",
  })

  return (
    <>
      <JsonLd payload={jsonLd} />
      <Bend
        headingLevel="h1"
        headline={PAGE_HEADLINE}
        pointsHeading="How Bend works"
      />
    </>
  )
}
