import Link from "next/link"
import { CatalogImage } from "@/components/wallpaper-gallery/catalog-image"
import { WallpaperCollectionPage } from "@/components/wallpaper-gallery/wallpaper-collection-page"
import { JsonLd } from "@/components/seo/json-ld"
import {
  GALLERY_MEDIA_RADIUS_CLASS,
  GALLERY_TEXT_PRIMARY_CLASS,
  GALLERY_TEXT_TERTIARY_CLASS,
} from "@/lib/public-catalog/chrome"
import { loadDisplayIndex } from "@/lib/public-catalog/display-wallpapers"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import {
  DISPLAY_PAGES_PATH,
  buildDisplayIndex,
  displayIndexDef,
  displayRelatedLinks,
} from "@/lib/seo/display-pages"
import {
  faqPageJsonLd,
  jsonLdGraph,
  webPageJsonLd,
} from "@/lib/seo/json-ld-helpers"
import { canonicalSiteOrigin, canonicalSitePath } from "@/lib/site-url"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"

/** Matches the catalog cache (6h); counts move as wallpapers are added. */
export const revalidate = 21600

export function generateMetadata(): Metadata {
  // Title and description don't depend on the catalog.
  return createSeoPageMetadata(buildDisplayIndex(null).page)
}

/**
 * /wallpapers/display: every display page and the MacBook hub, with Apple's
 * native resolution for every Mac and how many catalog loops fit each one.
 */
export default async function DisplayIndexPage() {
  const { page, entries } = await loadDisplayIndex()
  const origin = canonicalSiteOrigin()

  return (
    <>
      <JsonLd
        payload={jsonLdGraph(
          webPageJsonLd({
            origin,
            pathname: DISPLAY_PAGES_PATH,
            type: "CollectionPage",
            name: page.title,
            headline: page.headline,
            description: page.description,
            breadcrumbs: [{ name: "Wallpapers", pathname: "/wallpapers" }],
            breadcrumbName: displayIndexDef.label,
            dateModified: page.updatedAt,
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: entries.length,
              itemListElement: entries.map((entry, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: `${entry.label} live wallpapers`,
                url: canonicalSitePath(entry.href),
              })),
            },
          }),
          faqPageJsonLd(page.faq ?? [])
        )}
      />
      <WallpaperCollectionPage
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/wallpapers", label: "Wallpapers" },
          { href: DISPLAY_PAGES_PATH, label: displayIndexDef.label },
        ]}
        title={page.headline}
        intro={page.description}
        wallpapers={[]}
        emptyState={
          <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
            {entries.map((entry) => (
              <li key={entry.href}>
                <Link
                  href={entry.href}
                  className="group flex flex-col gap-2.5 outline-none"
                >
                  <div
                    className={cn(
                      "relative aspect-video overflow-hidden bg-[#141414] ring-1 ring-white/[0.08] group-focus-visible:ring-2 group-focus-visible:ring-white/40",
                      GALLERY_MEDIA_RADIUS_CLASS
                    )}
                  >
                    {entry.cover ? (
                      <CatalogImage
                        src={entry.cover.thumbUrl}
                        alt={`${entry.cover.name}, a live wallpaper for ${entry.label}`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 px-0.5">
                    <p
                      className={cn(
                        "truncate text-[15px] leading-snug",
                        GALLERY_TEXT_PRIMARY_CLASS
                      )}
                    >
                      {entry.label}
                    </p>
                    <p
                      className={cn(
                        "mt-0.5 text-[13px]",
                        GALLERY_TEXT_TERTIARY_CLASS
                      )}
                    >
                      {entry.summary}
                      {entry.count !== null
                        ? ` · ${entry.count} ${entry.count === 1 ? "loop" : "loops"}`
                        : ""}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        }
        sections={page.sections}
        faq={page.faq}
        relatedTitle="Live wallpapers by display"
        related={displayRelatedLinks(DISPLAY_PAGES_PATH)}
      />
    </>
  )
}
