import { SeoPageShell } from "@/components/content/seo-page-shell"
import { JsonLd } from "@/components/seo/json-ld"
import { getAboutPage } from "@/lib/company/about-press"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { webPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { canonicalSiteOrigin } from "@/lib/site-url"
import type { Metadata } from "next"

export function generateMetadata(): Metadata {
  return createSeoPageMetadata(getAboutPage())
}

/**
 * Who makes MacWall, how to reach the team and how the site's facts are
 * checked. The Organization itself is the `#organization` node the root
 * layout renders on every page; this AboutPage points at it.
 */
export default function AboutPage() {
  const page = getAboutPage()

  return (
    <>
      <JsonLd
        payload={webPageJsonLd({
          origin: canonicalSiteOrigin(),
          pathname: page.pathname,
          name: page.title,
          headline: page.headline,
          description: page.description,
          type: "AboutPage",
          about: "#organization",
          mainEntity: "#organization",
          breadcrumbs: [],
          breadcrumbName: "About",
          datePublished: page.publishedAt,
          dateModified: page.updatedAt,
        })}
      />
      <SeoPageShell
        headline={page.headline}
        description={page.description}
        sections={page.sections}
        breadcrumbs={[{ label: "Home", href: "/" }]}
      />
    </>
  )
}
