import {
  WallpaperCollectionPage,
  type CollectionLink,
} from "@/components/wallpaper-gallery/wallpaper-collection-page"
import { JsonLd } from "@/components/seo/json-ld"
import type { ContentBlock } from "@/lib/content/types"
import { macwall, macwallLockScreenMacOSVersion } from "@/lib/macwall-site"
import { listCollectionWallpapers } from "@/lib/public-catalog/collections"
import type { PublicWallpaper } from "@/lib/public-catalog/types"
import {
  wallpaperCategorySlugOrFallback,
  wallpapersGalleryPath,
} from "@/lib/public-catalog/urls"
import { faqPageJsonLd } from "@/lib/seo/json-ld-helpers"
import {
  COLLECTION_GRID_LIMIT,
  COLLECTION_MIN_WALLPAPERS,
  WALLPAPER_COLLECTIONS_HUB_PATH,
  collectionFaq,
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

type PageProps = {
  params: Promise<{ slug: string }>
}

/** Collections re-sort as likes and uploads change; hourly ISR matches the catalog cache. */
export const revalidate = 3600

export function generateStaticParams() {
  return wallpaperCollections.map((entry) => ({ slug: entry.slug }))
}

async function loadCollection(
  entry: WallpaperCollection
): Promise<PublicWallpaper[] | null> {
  try {
    return await listCollectionWallpapers(entry)
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const entry = getWallpaperCollection(slug)
  if (!entry) return {}

  const wallpapers = await loadCollection(entry)
  const pathname = wallpaperCollectionPath(entry.slug)
  const canonical = canonicalSitePath(pathname)
  const cover = wallpapers?.[0]
  const image = cover?.thumbUrl ?? openGraphImageAbsoluteUrl()
  // A failed catalog read keeps the page indexable; only a genuinely thin topic is not.
  const thin =
    wallpapers !== null && wallpapers.length < COLLECTION_MIN_WALLPAPERS

  return {
    title: entry.title,
    description: entry.description,
    keywords: entry.keywords,
    alternates: {
      canonical,
      types: {
        ...feedAlternateTypes(),
        "text/markdown": canonicalSitePath(`${pathname}.md`),
      },
    },
    ...(thin ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: `${entry.name} Live Wallpapers for Mac · ${macwall.name}`,
      description: entry.description,
      url: canonical,
      siteName: macwall.name,
      type: "website",
      images: [
        {
          url: image,
          alt: cover
            ? `${cover.name}, a ${entry.name} live wallpaper for Mac`
            : `${entry.name} live wallpapers for Mac`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${entry.name} Live Wallpapers for Mac · ${macwall.name}`,
      description: entry.description,
      images: [image],
    },
  }
}

function collectionSections(entry: WallpaperCollection): ContentBlock[] {
  const topic = entry.name
  const categoryPath = wallpapersGalleryPath(
    wallpaperCategorySlugOrFallback(entry.category)
  )
  return [
    { type: "h2", text: `How to set a ${topic} live wallpaper on Mac` },
    {
      type: "ol",
      items: [
        `[Download ${macwall.name}](/download) and drag it to Applications. It runs on Apple Silicon and Intel Macs with macOS 15 or later.`,
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
        "**Battery-aware**: playback pauses on battery, in full-screen apps, and when the display sleeps. See [live wallpaper battery drain on Mac](/blog/live-wallpaper-battery-drain-mac).",
        "**Every display**: sync one loop across monitors or give each screen its own wallpaper.",
        `**One payment**: try everything free for 24 hours; the full catalog then stays unlocked with a one-time ${macwall.pro.price} license, no subscription. See [pricing](/pricing).`,
      ],
    },
    {
      type: "p",
      text: `Looking for more? Browse the full [${entry.category} category](${categoryPath}), every [live wallpaper collection](${WALLPAPER_COLLECTIONS_HUB_PATH}), or read [how to set a live wallpaper on Mac](/blog/how-to-set-live-wallpaper-mac).`,
    },
  ]
}

export default async function WallpaperCollectionRoute({ params }: PageProps) {
  const { slug } = await params
  const entry = getWallpaperCollection(slug)
  if (!entry) notFound()

  const wallpapers = (await loadCollection(entry)) ?? []
  const count = wallpapers.length
  const shown = wallpapers.slice(0, COLLECTION_GRID_LIMIT)
  const pathname = wallpaperCollectionPath(entry.slug)
  const origin = canonicalSiteOrigin()
  const faq = collectionFaq(entry, count)
  const categorySlug = wallpaperCategorySlugOrFallback(entry.category)

  const related: CollectionLink[] = entry.related
    .map((relatedSlug) => getWallpaperCollection(relatedSlug))
    .filter((item): item is WallpaperCollection => Boolean(item))
    .map((item) => ({
      href: wallpaperCollectionPath(item.slug),
      label: `${item.name} wallpapers`,
    }))

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
            totalCount: count,
          })}
        />
      ) : null}
      <JsonLd payload={faqPageJsonLd(faq)} />
      <WallpaperCollectionPage
        breadcrumbs={[
          { href: wallpapersGalleryPath(), label: "Wallpapers" },
          { href: WALLPAPER_COLLECTIONS_HUB_PATH, label: "Collections" },
          { href: pathname, label: entry.name },
        ]}
        title={`${entry.name} live wallpapers for Mac`}
        intro={entry.intro}
        meta={
          count > 0
            ? `${count} ${count === 1 ? "wallpaper" : "wallpapers"} · up to 4K · updated as new loops publish`
            : undefined
        }
        wallpapers={shown}
        moreHref={
          count > shown.length ? wallpapersGalleryPath(categorySlug) : undefined
        }
        moreLabel={
          count > shown.length
            ? `Browse all ${entry.category} wallpapers`
            : undefined
        }
        sections={collectionSections(entry)}
        faq={faq}
        related={related}
        emptyState={
          <p className="mt-8 text-[15px] text-white/65">
            New {entry.name} wallpapers are on the way. Meanwhile, browse the{" "}
            <Link
              className="underline"
              href={wallpapersGalleryPath(categorySlug)}
            >
              {entry.category} category
            </Link>
            .
          </p>
        }
      />
    </>
  )
}
