import { WallpaperCollectionPage } from "@/components/wallpaper-gallery/wallpaper-collection-page"
import { JsonLd } from "@/components/seo/json-ld"
import { loadDisplayPage } from "@/lib/public-catalog/display-wallpapers"
import { wallpaperDetailPath } from "@/lib/public-catalog/urls"
import { createSeoPageMetadata } from "@/lib/seo/create-page-metadata"
import { displayPageDefs, displayPagePath } from "@/lib/seo/display-pages"
import { faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { canonicalSitePath } from "@/lib/site-url"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

type PageProps = { params: Promise<{ slug: string }> }

/** Matches the catalog cache (6h); counts move as wallpapers are added. */
export const revalidate = 21600

export function generateStaticParams() {
  return displayPageDefs.map((def) => ({ slug: def.slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const data = await loadDisplayPage(slug).catch(() => null)
  if (!data) return {}
  return createSeoPageMetadata(data.page)
}

export default async function DisplayWallpapersPage({ params }: PageProps) {
  const { slug } = await params
  const data = await loadDisplayPage(slug)
  if (!data) notFound()
  const { page, wallpapers } = data

  const crumbs = [
    { href: "/", label: "Home" },
    { href: "/wallpapers", label: "Wallpapers" },
    {
      href: page.pathname,
      label: page.headline.replace(/ live wallpapers.*$/i, ""),
    },
  ]

  return (
    <>
      <JsonLd
        payload={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${canonicalSitePath(page.pathname)}#webpage`,
          url: canonicalSitePath(page.pathname),
          name: page.headline,
          description: page.description,
          ...(page.updatedAt ? { dateModified: page.updatedAt } : {}),
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: wallpapers.length,
            itemListElement: wallpapers.map((wallpaper, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: wallpaper.name,
              url: canonicalSitePath(wallpaperDetailPath(wallpaper)),
            })),
          },
          breadcrumb: {
            "@type": "BreadcrumbList",
            itemListElement: crumbs.map((crumb, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: crumb.label,
              item: canonicalSitePath(crumb.href),
            })),
          },
        }}
      />
      {page.faq?.length ? <JsonLd payload={faqPageJsonLd(page.faq)} /> : null}
      <WallpaperCollectionPage
        breadcrumbs={crumbs}
        title={page.headline.replace(/^./, (c) => c.toUpperCase())}
        intro={page.description}
        meta={`${data.fitCount} matching wallpapers in the catalog`}
        wallpapers={wallpapers}
        moreHref="/wallpapers"
        moreLabel="Browse all live wallpapers"
        sections={page.sections}
        faq={page.faq}
        relatedTitle="Live wallpapers by display"
        related={displayPageDefs
          .filter((def) => def.slug !== page.slug)
          .map((def) => ({
            href: displayPagePath(def.slug),
            label: def.headline.replace(/^./, (c) => c.toUpperCase()),
          }))}
      />
    </>
  )
}
