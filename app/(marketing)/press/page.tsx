import { SeoPageShell } from "@/components/content/seo-page-shell"
import { JsonLd } from "@/components/seo/json-ld"
import { PRESS_ASSETS, getPressPage } from "@/lib/company/about-press"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { webPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { canonicalSiteOrigin } from "@/lib/site-url"
import type { Metadata } from "next"

export function generateMetadata(): Metadata {
  return createSeoPageMetadata(getPressPage())
}

/** Press kit: boilerplate, fact sheet, brand assets and a press contact. */
export default function PressPage() {
  const page = getPressPage()
  const previews = PRESS_ASSETS.filter((asset) => asset.preview)

  return (
    <>
      <JsonLd
        payload={webPageJsonLd({
          origin: canonicalSiteOrigin(),
          pathname: page.pathname,
          name: page.title,
          headline: page.headline,
          description: page.description,
          about: ["#organization", "#softwareapplication"],
          breadcrumbs: [],
          breadcrumbName: "Press kit",
          datePublished: page.publishedAt,
          dateModified: page.updatedAt,
        })}
      />
      <SeoPageShell
        headline={page.headline}
        description={page.description}
        sections={page.sections}
        breadcrumbs={[{ label: "Home", href: "/" }]}
      >
        <ul
          className="not-prose mt-8 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2"
          aria-label="Image previews"
        >
          {previews.map((asset) => (
            <li
              key={asset.href}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <a
                href={asset.href}
                download
                className="block outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {/* Plain <img>: the files are the downloads themselves, shown as-is. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.preview ?? asset.href}
                  alt={asset.label}
                  loading="lazy"
                  decoding="async"
                  className="aspect-video w-full bg-black/40 object-contain"
                />
                <span className="block px-4 py-3 text-sm text-foreground">
                  {asset.label}
                  <span className="block text-[13px] text-muted-foreground">
                    Download
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </SeoPageShell>
    </>
  )
}
