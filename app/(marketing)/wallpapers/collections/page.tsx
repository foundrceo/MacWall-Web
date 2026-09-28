import Image from "next/image"
import Link from "next/link"
import { MarketingRail } from "@/components/macwall-marketing/marketing-rail"
import { JsonLd } from "@/components/seo/json-ld"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { macwall } from "@/lib/macwall-site"
import {
  GALLERY_MEDIA_RADIUS_CLASS,
  GALLERY_SUBTITLE_AFTER_TITLE_CLASS,
  GALLERY_TEXT_PRIMARY_CLASS,
  GALLERY_TEXT_SECONDARY_CLASS,
  GALLERY_TEXT_TERTIARY_CLASS,
  GALLERY_TITLE_AFTER_BREADCRUMB_CLASS,
} from "@/lib/public-catalog/chrome"
import {
  listCollectionSummaries,
  type CollectionSummary,
} from "@/lib/public-catalog/collections"
import {
  WALLPAPER_DISPLAY_HEADING_CLASS,
  WALLPAPER_SECTION_FONT_CLASS,
  WALLPAPER_SECTION_SERIF_HEADING_CLASS,
} from "@/lib/public-catalog/typography"
import { wallpapersGalleryPath } from "@/lib/public-catalog/urls"
import { collectionPageJsonLd } from "@/lib/seo/json-ld-helpers"
import {
  COLLECTION_GROUP_LABELS,
  COLLECTION_GROUP_ORDER,
  WALLPAPER_COLLECTIONS_HUB_PATH,
  wallpaperCollectionPath,
  wallpaperCollections,
} from "@/lib/seo/wallpaper-collections"
import {
  canonicalSitePath,
  feedAlternateTypes,
  openGraphImageAbsoluteUrl,
  openGraphImageSize,
} from "@/lib/site-url"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"

export const revalidate = 3600

const TITLE = "Live Wallpaper Collections for Mac: Anime, Cars, Rain & More"
const DESCRIPTION = `Browse ${wallpaperCollections.length} curated live wallpaper collections for Mac: Gojo, Naruto, Spider-Man, BMW, F1, rain, lofi, galaxy, and more. 4K loops for your desktop.`

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "live wallpaper collections",
    "anime live wallpaper mac",
    "car live wallpaper mac",
    "aesthetic live wallpaper mac",
    "4k live wallpapers for mac",
  ],
  alternates: {
    canonical: canonicalSitePath(WALLPAPER_COLLECTIONS_HUB_PATH),
    types: {
      ...feedAlternateTypes(),
      "text/markdown": canonicalSitePath(
        `${WALLPAPER_COLLECTIONS_HUB_PATH}.md`
      ),
    },
  },
  openGraph: {
    title: `${macwall.name} – ${TITLE}`,
    description: DESCRIPTION,
    url: canonicalSitePath(WALLPAPER_COLLECTIONS_HUB_PATH),
    siteName: macwall.name,
    type: "website",
    images: [
      {
        url: openGraphImageAbsoluteUrl(),
        width: openGraphImageSize.width,
        height: openGraphImageSize.height,
        alt: TITLE,
      },
    ],
  },
}

export default async function WallpaperCollectionsHubPage() {
  const summaries = await listCollectionSummaries()
  // Catalog outage: still link every topic so the hub never renders empty.
  const visible: CollectionSummary[] =
    summaries.length > 0
      ? summaries.filter((summary) => summary.indexable)
      : wallpaperCollections.map((collection) => ({
          collection,
          count: 0,
          cover: null,
          indexable: true,
        }))

  const groups = COLLECTION_GROUP_ORDER.map((group) => ({
    group,
    items: visible.filter((summary) => summary.collection.group === group),
  })).filter((entry) => entry.items.length > 0)

  return (
    <>
      <JsonLd
        payload={collectionPageJsonLd({
          pathname: WALLPAPER_COLLECTIONS_HUB_PATH,
          name: TITLE,
          description: DESCRIPTION,
          breadcrumbLabel: "Wallpaper collections",
          items: visible.map(({ collection }) => ({
            name: `${collection.name} live wallpapers`,
            pathname: wallpaperCollectionPath(collection.slug),
          })),
        })}
      />
      <MarketingRail innerClassName="min-h-[70vh]">
        <div className={WALLPAPER_SECTION_FONT_CLASS}>
          <Breadcrumb>
            <BreadcrumbList
              className={cn(
                "flex-wrap gap-y-1 text-[13px]",
                GALLERY_TEXT_TERTIARY_CLASS
              )}
            >
              <BreadcrumbItem>
                <BreadcrumbLink asChild className="transition hover:text-white">
                  <Link href={wallpapersGalleryPath()}>Wallpapers</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/35" />
              <BreadcrumbItem>
                <BreadcrumbPage className={GALLERY_TEXT_PRIMARY_CLASS}>
                  Collections
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <header className={GALLERY_TITLE_AFTER_BREADCRUMB_CLASS}>
            <h1
              className={cn(
                WALLPAPER_DISPLAY_HEADING_CLASS,
                GALLERY_TEXT_PRIMARY_CLASS
              )}
            >
              Live wallpaper collections for Mac
            </h1>
            <p
              className={cn(
                GALLERY_SUBTITLE_AFTER_TITLE_CLASS,
                "max-w-3xl text-[15px] leading-[1.6] sm:text-[16px]",
                GALLERY_TEXT_SECONDARY_CLASS
              )}
            >
              Hand-picked sets from the {macwall.name} catalog, grouped by the
              characters, cars, and moods people search for most. Every
              collection updates automatically as new 4K loops are published.
            </p>
          </header>

          {groups.map(({ group, items }) => (
            <section
              key={group}
              className="mt-12"
              aria-labelledby={`collections-${group}`}
            >
              <h2
                id={`collections-${group}`}
                className={WALLPAPER_SECTION_SERIF_HEADING_CLASS}
              >
                {COLLECTION_GROUP_LABELS[group]}
              </h2>
              <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
                {items.map(({ collection, count, cover }) => (
                  <li key={collection.slug}>
                    <Link
                      href={wallpaperCollectionPath(collection.slug)}
                      className="group flex flex-col gap-2.5 outline-none"
                    >
                      <div
                        className={cn(
                          "relative aspect-video overflow-hidden bg-[#141414] ring-1 ring-white/[0.08] group-focus-visible:ring-2 group-focus-visible:ring-white/40",
                          GALLERY_MEDIA_RADIUS_CLASS
                        )}
                      >
                        {cover ? (
                          <Image
                            src={cover.thumbUrl}
                            alt={`${collection.name} live wallpaper for Mac: ${cover.name}`}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover transition duration-300 group-hover:scale-[1.03]"
                            unoptimized
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
                          {collection.name}
                        </p>
                        {count > 0 ? (
                          <p
                            className={cn(
                              "mt-0.5 text-[13px]",
                              GALLERY_TEXT_TERTIARY_CLASS
                            )}
                          >
                            {count} live wallpapers
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </MarketingRail>
    </>
  )
}
