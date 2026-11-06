import Link from "next/link"

import { listCollectionSummaries } from "@/lib/public-catalog/collections"
import {
  DISPLAY_PAGES_PATH,
  MACBOOK_HUB_PATH,
  displayPageDefs,
  displayPagePath,
} from "@/lib/seo/display-pages"
import {
  WALLPAPER_COLLECTIONS_HUB_PATH,
  promotableCollections,
  wallpaperCollectionPath,
  type WallpaperCollection,
} from "@/lib/seo/wallpaper-collections"
import { cn } from "@/lib/utils"

/*
 * Crawlable link rows for the home page, the page most visits (and every ad
 * click) land on: popular collections and Mac display pages under the
 * category marquee, comparisons beside the FAQ. Each link's text, with its
 * visually hidden suffix, names the page it opens ("Rain live wallpapers").
 */

/** Home page order: evergreen and in-season moods first. */
const POPULAR_COLLECTION_ORDER = [
  "rain",
  "city",
  "galaxy",
  "sunset",
  "lofi",
  "autumn",
  "snow",
  "ocean",
  "neon",
  "forest",
  "mountain",
  "black-hole",
  "moon",
  "cherry-blossom",
  "christmas",
] as const

const POPULAR_COLLECTION_LIMIT = 12
/** Fewer than this from the curated order, and other promotable ones fill in. */
const POPULAR_COLLECTION_MINIMUM = 8

/**
 * Slugs of collections with enough wallpapers to be indexed, or null when the
 * catalog can't be read. The home page must render either way: it then
 * falls back to the curated order alone.
 */
async function indexableCollectionSlugs(): Promise<Set<string> | null> {
  try {
    const summaries = await listCollectionSummaries()
    return new Set(
      summaries
        .filter((summary) => summary.indexable)
        .map((summary) => summary.collection.slug)
    )
  } catch (error) {
    console.error("[home] collection counts unavailable", error)
    return null
  }
}

async function popularCollections(): Promise<WallpaperCollection[]> {
  const indexable = await indexableCollectionSlugs()
  const eligible = promotableCollections().filter(
    (entry) => !indexable || indexable.has(entry.slug)
  )
  const bySlug = new Map(eligible.map((entry) => [entry.slug, entry]))
  const curated = POPULAR_COLLECTION_ORDER.flatMap((slug) => {
    const entry = bySlug.get(slug)
    return entry ? [entry] : []
  })
  if (curated.length >= POPULAR_COLLECTION_MINIMUM) {
    return curated.slice(0, POPULAR_COLLECTION_LIMIT)
  }
  const rest = eligible.filter((entry) => !curated.includes(entry))
  return [...curated, ...rest].slice(0, POPULAR_COLLECTION_LIMIT)
}

type BandLink = { href: string; label: string; hiddenSuffix?: string }

const PILL =
  "inline-flex h-8 items-center rounded-full bg-white/[0.06] px-3.5 text-[13px] leading-5 whitespace-nowrap text-ink-2 transition-colors outline-none hover:bg-white/10 hover:text-ink focus-visible:ring-2 focus-visible:ring-white/30"

function LinkRow({
  id,
  title,
  links,
  more,
}: Readonly<{
  id: string
  title: string
  links: readonly BandLink[]
  more?: BandLink
}>) {
  return (
    <nav aria-labelledby={id} className="flex flex-col items-center gap-3">
      <h3
        id={id}
        className="font-sans text-[13px] leading-5 font-normal text-ink-3"
      >
        {title}
      </h3>
      <ul className="flex max-w-4xl flex-wrap justify-center gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={PILL}>
              {link.label}
              {link.hiddenSuffix ? (
                <span className="sr-only"> {link.hiddenSuffix}</span>
              ) : null}
            </Link>
          </li>
        ))}
        {more ? (
          <li>
            <Link
              href={more.href}
              className={cn(
                PILL,
                "bg-transparent text-ink-3 hover:bg-white/[0.06]"
              )}
            >
              {more.label}
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  )
}

/**
 * Popular collections and wallpapers by Mac display, under the category
 * marquee.
 */
export async function HomeBrowseLinks({
  className,
}: Readonly<{ className?: string }>) {
  const collections = await popularCollections()

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      {collections.length > 0 ? (
        <LinkRow
          id="home-popular-collections"
          title="Popular collections"
          links={collections.map((entry) => ({
            href: wallpaperCollectionPath(entry.slug),
            label: entry.name,
            hiddenSuffix: "live wallpapers",
          }))}
          more={{
            href: WALLPAPER_COLLECTIONS_HUB_PATH,
            label: "All collections",
          }}
        />
      ) : null}
      <LinkRow
        id="home-by-mac"
        title="Wallpapers by Mac"
        links={[
          {
            href: MACBOOK_HUB_PATH,
            label: "MacBook",
            hiddenSuffix: "wallpapers",
          },
          // Each def's short label; the hidden suffix completes it.
          ...displayPageDefs.map((def) => ({
            href: displayPagePath(def.slug),
            label: def.label,
            hiddenSuffix: "live wallpapers",
          })),
        ]}
        more={{ href: DISPLAY_PAGES_PATH, label: "Every Mac display" }}
      />
    </div>
  )
}

/** Comparison pages, as a line beside the home FAQ. */
export function HomeCompareLinks() {
  const link =
    "text-ink underline underline-offset-4 decoration-white/25 transition-colors hover:decoration-white"
  return (
    <p>
      Comparing apps? See{" "}
      <Link href="/best-live-wallpaper-mac" className={link}>
        live wallpaper apps for Mac, compared
      </Link>
      ,{" "}
      <Link href="/alternatives/wallpaper-engine" className={link}>
        Wallpaper Engine for Mac
      </Link>
      ,{" "}
      <Link href="/screen-saver-mac" className={link}>
        live screen savers
      </Link>{" "}
      or{" "}
      <Link href="/compare" className={link}>
        every comparison
      </Link>
      .
    </p>
  )
}
