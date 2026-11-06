import { SeoLandingPage } from "@/components/content/seo-landing-page"
import { JsonLd } from "@/components/seo/json-ld"
import { COMPARE_HUB, pageCitations } from "@/lib/seo/comparison-facts"
import { articleJsonLd, type JsonLdNode } from "@/lib/seo/json-ld-helpers"
import { ogImageForPath } from "@/lib/seo/og-images"
import { canonicalSiteOrigin } from "@/lib/site-url"
import type { SeoContentPage } from "@/lib/content/types"

/** A product the page compares MacWall with. */
export type ComparedApp = {
  name: string
  url: string
  operatingSystem?: string
  /** Who makes it, when the developer names themselves. */
  developer?: string
}

/**
 * A plain Thing typed as software through `additionalType`: a nested
 * SoftwareApplication would be a Software App rich-result candidate, and the
 * site never supplies offers or ratings for other apps. Only MacWall's own
 * `#softwareapplication` node is a SoftwareApplication.
 */
export function comparedAppNode(app: ComparedApp): JsonLdNode {
  return {
    "@type": "Thing",
    additionalType: "https://schema.org/SoftwareApplication",
    name: app.name,
    url: app.url,
    sameAs: app.url,
    ...(app.operatingSystem || app.developer
      ? {
          description: [
            app.developer ? `By ${app.developer}.` : null,
            app.operatingSystem ? `Runs on ${app.operatingSystem}.` : null,
          ]
            .filter(Boolean)
            .join(" "),
        }
      : {}),
  }
}

/**
 * A comparison or alternatives page: MacWall > Compare > page breadcrumbs
 * (visible and in JSON-LD), an Article that cites the page's own Sources
 * list and is about MacWall and the app it compares, and the shared
 * SeoLandingPage body with its FAQ.
 */
export function ComparisonLandingPage({
  page,
  breadcrumbName,
  compared = [],
  mentions,
}: Readonly<{
  page: SeoContentPage
  /** Short leaf crumb, e.g. "MacWall vs Backdrop". */
  breadcrumbName: string
  /** The competitor(s) the page is about. */
  compared?: readonly ComparedApp[]
  /** Other apps the page names, for a roundup. */
  mentions?: readonly ComparedApp[]
}>) {
  const origin = canonicalSiteOrigin()
  // Read once: a sale-priced page builds its sections when they are read.
  const sections = page.sections

  return (
    <>
      <JsonLd
        payload={articleJsonLd({
          origin,
          pathname: page.pathname,
          headline: page.headline,
          description: page.description,
          datePublished: page.publishedAt ?? "",
          dateModified: page.updatedAt,
          image: ogImageForPath(page.pathname)?.url,
          section: COMPARE_HUB,
          breadcrumbName,
          type: "Article",
          citation: pageCitations(sections),
          about: [
            "#softwareapplication",
            ...compared.map((app) => comparedAppNode(app)),
          ],
          ...(mentions && mentions.length > 0
            ? { mentions: mentions.map((app) => comparedAppNode(app)) }
            : {}),
        })}
      />
      <SeoLandingPage
        page={{ ...page, sections }}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: COMPARE_HUB.name, href: COMPARE_HUB.pathname },
          { label: breadcrumbName, href: page.pathname },
        ]}
      />
    </>
  )
}
