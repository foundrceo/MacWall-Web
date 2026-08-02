import type { Metadata } from "next"

import MarketingSiteChrome from "@/components/macwall-marketing/MarketingSiteChrome"
import MacWallMarketingPageEnd from "@/components/macwall-marketing/marketing-page-end"
import { SubmitRequirements } from "@/components/macwall-marketing/submit-requirements"
import { SubmitWallpaperForm } from "@/components/macwall-marketing/submit-wallpaper-form"
import { JsonLd } from "@/components/seo/json-ld"
import { webPageWithBreadcrumbsJsonLd } from "@/lib/legal-page-json-ld"
import { macwall } from "@/lib/macwall-site"
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
    <div className="marketing-page">
      <JsonLd payload={jsonLd} />
      <MarketingSiteChrome />
      <main id="main-content" className="marketing-main">
        <div className="lg:grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:items-start lg:gap-x-14 xl:grid-cols-[minmax(0,400px)_minmax(0,640px)] xl:gap-x-20">
          <div className="mb-10 lg:mb-0">
            <header className="max-w-xl text-left">
              <h1 className="text-[2.5rem] font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
                {PAGE_TITLE}
              </h1>
              <p className="mt-2 text-base leading-6 tracking-[0.01em] text-marketing-muted">
                Share a live wallpaper you made or own with the {macwall.name}{" "}
                community. Add a title, pick a category, and upload your video —
                we review every submission before it goes live.
              </p>
            </header>

            <SubmitRequirements className="mt-10 hidden lg:block" />
          </div>

          <SubmitWallpaperForm />
        </div>
      </main>
      <MacWallMarketingPageEnd showBottomCta={false} />
    </div>
  )
}
