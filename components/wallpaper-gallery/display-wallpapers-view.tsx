import { GalleryPagination } from "@/components/wallpaper-gallery/gallery-pagination"
import {
  WallpaperCollectionPage,
  type CollectionLink,
} from "@/components/wallpaper-gallery/wallpaper-collection-page"
import { JsonLd } from "@/components/seo/json-ld"
import type { SeoContentPage } from "@/lib/content/types"
import type { PublicWallpaper } from "@/lib/public-catalog/types"
import { wallpaperDetailPath } from "@/lib/public-catalog/urls"
import { displayRelatedLinks } from "@/lib/seo/display-pages"
import {
  faqPageJsonLd,
  webPageJsonLd,
  type BreadcrumbCrumb,
} from "@/lib/seo/json-ld-helpers"
import { canonicalSiteOrigin, canonicalSitePath } from "@/lib/site-url"

/**
 * One display page, the MacBook hub, or a numbered page of either: the
 * server-rendered grid with plain links, the pagination, and a
 * CollectionPage in the site graph (`isPartOf` #website, `inLanguage`,
 * `dateModified`, breadcrumb rooted at MacWall).
 */
export function DisplayWallpapersView({
  page,
  label,
  parents,
  basePath,
  wallpapers,
  offset,
  pageNumber,
  totalPages,
  meta,
  moreHref,
  moreLabel,
}: Readonly<{
  page: SeoContentPage
  /** Short name for the breadcrumb: "MacBook Air". */
  label: string
  /** Levels between the site root and the page, e.g. Wallpapers, Displays. */
  parents: readonly CollectionLink[]
  /** The landing page's path; numbered pages hang off it. */
  basePath: string
  wallpapers: PublicWallpaper[]
  offset: number
  pageNumber: number
  totalPages: number
  meta?: string
  moreHref?: string
  moreLabel?: string
}>) {
  const origin = canonicalSiteOrigin()
  const numbered = pageNumber > 1
  const crumbs: CollectionLink[] = [
    { href: "/", label: "Home" },
    ...parents,
    { href: basePath, label },
    ...(numbered ? [{ href: page.pathname, label: `Page ${pageNumber}` }] : []),
  ]
  const jsonLdParents: BreadcrumbCrumb[] = [
    ...parents.map((crumb) => ({ name: crumb.label, pathname: crumb.href })),
    ...(numbered ? [{ name: label, pathname: basePath }] : []),
  ]

  return (
    <>
      <JsonLd
        payload={webPageJsonLd({
          origin,
          pathname: page.pathname,
          type: "CollectionPage",
          name: page.title,
          headline: page.headline,
          description: page.description,
          breadcrumbs: jsonLdParents,
          breadcrumbName: numbered ? `Page ${pageNumber}` : label,
          dateModified: page.updatedAt,
          ...(wallpapers[0]?.thumbUrl
            ? { primaryImageOfPage: wallpapers[0].thumbUrl }
            : {}),
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: wallpapers.length,
            itemListElement: wallpapers.map((wallpaper, index) => ({
              "@type": "ListItem",
              position: offset + index + 1,
              name: wallpaper.name,
              url: canonicalSitePath(wallpaperDetailPath(wallpaper)),
            })),
          },
        })}
      />
      {page.faq?.length ? <JsonLd payload={faqPageJsonLd(page.faq)} /> : null}
      <WallpaperCollectionPage
        breadcrumbs={crumbs}
        title={page.headline}
        intro={page.description}
        meta={meta}
        wallpapers={wallpapers}
        moreHref={moreHref}
        moreLabel={moreLabel}
        sections={page.sections}
        faq={page.faq}
        relatedTitle="Live wallpapers by display"
        related={displayRelatedLinks(basePath)}
        footer={
          <GalleryPagination
            basePath={basePath}
            current={pageNumber}
            totalPages={totalPages}
            label={`${label} wallpaper pages`}
          />
        }
      />
    </>
  )
}
