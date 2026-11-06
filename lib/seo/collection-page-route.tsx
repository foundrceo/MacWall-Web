import { GalleryPagination } from "@/components/wallpaper-gallery/gallery-pagination"
import {
  WallpaperCollectionPage,
  type CollectionLink,
} from "@/components/wallpaper-gallery/wallpaper-collection-page"
import { JsonLd } from "@/components/seo/json-ld"
import type { ContentBlock } from "@/lib/content/types"
import {
  macwall,
  macwallBatteryPolicy,
  macwallLockScreenMacOSVersion,
  macwallMinimumMacOSVersion,
  macwallTrial,
} from "@/lib/macwall-site"
import { listCollectionWallpapers } from "@/lib/public-catalog/collections"
import type { PublicWallpaper } from "@/lib/public-catalog/types"
import {
  wallpaperCategorySlugOrFallback,
  wallpapersGalleryPath,
} from "@/lib/public-catalog/urls"
import { categoryDisplayLabel } from "@/lib/seo/category-seo"
import { brandedTitle, OPEN_GRAPH_LOCALE } from "@/lib/seo/create-page-metadata"
import {
  galleryPageCopy,
  galleryPageHref,
  parseGalleryPage,
} from "@/lib/seo/gallery-pages"
import { faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import { ogImageForPath } from "@/lib/seo/og-images"
import {
  COLLECTION_MIN_WALLPAPERS,
  COLLECTION_PAGE_SIZE,
  WALLPAPER_COLLECTIONS_HUB_PATH,
  collectionFaq,
  collectionPublishable,
  getWallpaperCollection,
  wallpaperCollectionPath,
  wallpaperCollections,
  type WallpaperCollection,
} from "@/lib/seo/wallpaper-collections"
import { wallpaperCollectionJsonLd } from "@/lib/seo/wallpaper-json-ld"
import {
  canonicalSiteOrigin,
  canonicalSitePath,
  feedAlternateTypes,
  openGraphImageAbsoluteUrl,
} from "@/lib/site-url"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

/**
 * Shared by `/wallpapers/collections/[slug]` and its `/page/[page]` route.
 * Page 1 lists the first `COLLECTION_PAGE_SIZE` members (the gallery's page
 * size); later pages are self-canonical and 404 past the end. next.config.mjs
 * 308s `/page/1` to the collection itself.
 */

/** Built collections only: a likeness topic's route 404s. */
export function publishedCollection(
  slug: string
): WallpaperCollection | undefined {
  const entry = getWallpaperCollection(slug)
  return entry && collectionPublishable(entry) ? entry : undefined
}

export function collectionStaticParams(): { slug: string }[] {
  return wallpaperCollections
    .filter(collectionPublishable)
    .map((entry) => ({ slug: entry.slug }))
}

/** Null when the catalog read failed (the page then keeps its index status). */
export async function loadCollection(
  entry: WallpaperCollection
): Promise<PublicWallpaper[] | null> {
  try {
    return await listCollectionWallpapers(entry)
  } catch {
    return null
  }
}

export function collectionHeadline(entry: WallpaperCollection): string {
  return entry.headline ?? `${entry.name} live wallpapers for Mac`
}

function coverAlt(entry: WallpaperCollection, cover?: PublicWallpaper) {
  return cover
    ? `${cover.name}: ${entry.name.toLowerCase()} live wallpaper for Mac`
    : `${entry.name} live wallpapers for Mac`
}

function collectionMetadata(input: {
  entry: WallpaperCollection
  pathname: string
  title: string
  description: string
  wallpapers: PublicWallpaper[] | null
  markdown: boolean
}): Metadata {
  const { entry, pathname, title, description, wallpapers } = input
  const canonical = canonicalSitePath(pathname)
  const cover = wallpapers?.[0]
  // Generated share card first, then the cover poster.
  const image =
    ogImageForPath(wallpaperCollectionPath(entry.slug))?.url ??
    cover?.thumbUrl ??
    openGraphImageAbsoluteUrl()
  const alt = coverAlt(entry, cover)
  // A failed catalog read keeps the page indexable; only a genuinely thin topic is not.
  const thin =
    wallpapers !== null && wallpapers.length < COLLECTION_MIN_WALLPAPERS

  return {
    title: { absolute: brandedTitle(title) },
    description,
    alternates: {
      canonical,
      types: {
        ...feedAlternateTypes(),
        ...(input.markdown
          ? { "text/markdown": canonicalSitePath(`${pathname}.md`) }
          : {}),
      },
    },
    ...(thin ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: brandedTitle(title),
      description,
      url: canonical,
      siteName: macwall.name,
      locale: OPEN_GRAPH_LOCALE,
      type: "website",
      images: [{ url: image, alt }],
    },
    twitter: {
      card: "summary_large_image",
      title: brandedTitle(title),
      description,
      images: [{ url: image, alt }],
    },
  }
}

export async function collectionPageMetadata(slug: string): Promise<Metadata> {
  const entry = publishedCollection(slug)
  if (!entry) return {}
  return collectionMetadata({
    entry,
    pathname: wallpaperCollectionPath(entry.slug),
    title: entry.title,
    description: entry.description,
    wallpapers: await loadCollection(entry),
    markdown: true,
  })
}

function pageCopy(
  entry: WallpaperCollection,
  page: number,
  wallpapers: PublicWallpaper[]
) {
  const totalPages = Math.max(
    1,
    Math.ceil(wallpapers.length / COLLECTION_PAGE_SIZE)
  )
  const start = (page - 1) * COLLECTION_PAGE_SIZE
  const shown = wallpapers.slice(start, start + COLLECTION_PAGE_SIZE)
  const copy = galleryPageCopy({
    label: `${entry.name} Live Wallpapers`,
    page,
    totalPages,
    total: wallpapers.length,
    firstName: shown[0]?.name,
  })
  return { totalPages, shown, copy }
}

export async function collectionPageNMetadata(
  slug: string,
  rawPage: string
): Promise<Metadata> {
  const entry = publishedCollection(slug)
  if (!entry) return {}
  const wallpapers = await loadCollection(entry)
  if (!wallpapers) return {}
  const page = parseGalleryPage(rawPage, wallpapers.length)
  if (!page) return {}
  const { copy } = pageCopy(entry, page, wallpapers)
  return collectionMetadata({
    entry,
    pathname: galleryPageHref(wallpaperCollectionPath(entry.slug), page),
    title: copy.title,
    description: copy.description,
    wallpapers,
    // Numbered pages have no Markdown twin.
    markdown: false,
  })
}

function collectionSections(entry: WallpaperCollection): ContentBlock[] {
  const topic = entry.name
  const categoryPath = wallpapersGalleryPath(
    wallpaperCategorySlugOrFallback(entry.category)
  )
  const { pauseBehindFullScreen, pauseOnBattery } = macwallBatteryPolicy
  return [
    { type: "h2", text: `How to set a ${topic} live wallpaper on Mac` },
    {
      type: "ol",
      items: [
        `[Download ${macwall.name}](/download) and drag it to Applications. It runs on Apple Silicon and Intel Macs with ${macwallMinimumMacOSVersion} or later (for Mac only, not Windows).`,
        `Pick any ${topic} wallpaper above to preview the loop, its resolution, and its length.`,
        `Choose **Set on Mac**. ${macwall.name} opens that wallpaper and applies it to your desktop, on one display or all of them.`,
        `Optional: with Pro on ${macwallLockScreenMacOSVersion} or later, use the same loop on your Lock Screen and as a Screen Saver.`,
      ],
    },
    {
      type: "h2",
      text: `Why ${topic} wallpapers look better in ${macwall.name}`,
    },
    {
      type: "ul",
      items: [
        "**Real video, not a GIF**: loops play at full frame rate and up to 4K, decoded on Apple's media engine instead of the CPU.",
        `**Battery-aware**: ${pauseBehindFullScreen.label} is on by default, and playback stops while the display sleeps. Turn on ${pauseOnBattery.label} and it ${pauseOnBattery.detail}. See [live wallpaper CPU and battery use](/blog/live-wallpaper-cpu-usage-mac).`,
        "**Every display**: sync one loop across monitors or give each screen its own wallpaper.",
        `**One payment**: every Mac gets a ${macwallTrial.name}; the full catalog then stays unlocked with a one-time Pro license, no subscription. See [pricing](/pricing) for your region.`,
      ],
    },
    {
      type: "p",
      text: `Looking for more? Browse the full [${categoryDisplayLabel(entry.category)} category](${categoryPath}), every [live wallpaper collection](${WALLPAPER_COLLECTIONS_HUB_PATH}), or read [how to set a live wallpaper on Mac](/blog/how-to-set-live-wallpaper-mac).`,
    },
  ]
}

function relatedLinks(entry: WallpaperCollection): CollectionLink[] {
  return entry.related
    .map((relatedSlug) => publishedCollection(relatedSlug))
    .filter((item): item is WallpaperCollection => Boolean(item))
    .map((item) => ({
      href: wallpaperCollectionPath(item.slug),
      label: `${item.name} wallpapers`,
    }))
}

function collectionCrumbs(
  entry: WallpaperCollection,
  page: number
): CollectionLink[] {
  const pathname = wallpaperCollectionPath(entry.slug)
  return [
    { href: wallpapersGalleryPath(), label: "Wallpapers" },
    { href: WALLPAPER_COLLECTIONS_HUB_PATH, label: "Collections" },
    { href: pathname, label: entry.name },
    ...(page > 1
      ? [{ href: galleryPageHref(pathname, page), label: `Page ${page}` }]
      : []),
  ]
}

export async function CollectionRoute({
  slug,
  rawPage,
}: {
  slug: string
  /** Absent on the collection itself (page 1). */
  rawPage?: string
}) {
  const entry = publishedCollection(slug)
  if (!entry) notFound()

  const loaded = await loadCollection(entry)
  const wallpapers = loaded ?? []
  let page = 1
  if (rawPage !== undefined) {
    // A failed read can't prove the page exists.
    const parsed = loaded ? parseGalleryPage(rawPage, wallpapers.length) : null
    if (!parsed) notFound()
    page = parsed
  }

  const count = wallpapers.length
  const { totalPages, shown, copy } = pageCopy(entry, page, wallpapers)
  const basePath = wallpaperCollectionPath(entry.slug)
  const pathname = galleryPageHref(basePath, page)
  const origin = canonicalSiteOrigin()
  const faq = collectionFaq(entry, count)
  const categorySlug = wallpaperCategorySlugOrFallback(entry.category)
  const pagination = (
    <GalleryPagination
      basePath={basePath}
      current={page}
      totalPages={totalPages}
      label={`${entry.name} wallpaper pages`}
    />
  )

  if (page > 1) {
    return (
      <>
        <JsonLd
          payload={wallpaperCollectionJsonLd({
            origin,
            pathname,
            name: entry.name,
            pageTitle: copy.title,
            description: copy.description,
            wallpapers: shown,
            about: entry.entity
              ? { name: entry.entity.name, sameAs: entry.entity.sameAs }
              : undefined,
          })}
        />
        <WallpaperCollectionPage
          breadcrumbs={collectionCrumbs(entry, page)}
          title={`${entry.name} live wallpapers for Mac, page ${page}`}
          intro={copy.description}
          wallpapers={shown}
          footer={pagination}
          related={relatedLinks(entry)}
        />
      </>
    )
  }

  return (
    <>
      {count > 0 ? (
        <JsonLd
          payload={wallpaperCollectionJsonLd({
            origin,
            pathname,
            name: entry.name,
            pageTitle: entry.title,
            description: entry.description,
            wallpapers: shown,
            about: entry.entity
              ? { name: entry.entity.name, sameAs: entry.entity.sameAs }
              : undefined,
          })}
        />
      ) : null}
      <JsonLd payload={faqPageJsonLd(faq)} />
      <WallpaperCollectionPage
        breadcrumbs={collectionCrumbs(entry, 1)}
        title={collectionHeadline(entry)}
        intro={entry.intro}
        meta={
          count > 0
            ? `${count} ${count === 1 ? "wallpaper" : "wallpapers"} · up to 4K · updated as new loops publish`
            : undefined
        }
        wallpapers={shown}
        footer={pagination}
        moreHref={totalPages > 1 ? galleryPageHref(basePath, 2) : undefined}
        moreLabel={
          totalPages > 1
            ? `Browse all ${count} ${entry.name} wallpapers`
            : undefined
        }
        sections={collectionSections(entry)}
        faq={faq}
        related={relatedLinks(entry)}
        emptyState={
          <p className="mt-8 text-[15px] text-white/65">
            New {entry.name} wallpapers are on the way. Meanwhile, browse the{" "}
            <Link
              className="underline"
              href={wallpapersGalleryPath(categorySlug)}
            >
              {categoryDisplayLabel(entry.category)} category
            </Link>
            .
          </p>
        }
      />
    </>
  )
}
