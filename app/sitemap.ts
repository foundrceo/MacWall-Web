import { siteMarkdownDocuments } from "@/lib/ai/site-content"
import { blogArticles } from "@/lib/blog"
import { blogTilePoster } from "@/lib/blog/tile-media"
import { curatedChangelogReleases } from "@/lib/changelog/curated-releases"
import { webAutoChangelogReleases } from "@/lib/changelog/web-auto-releases"
import { docsPages } from "@/lib/docs/pages"
import { learnPages } from "@/lib/learn/pages"
import { macwall } from "@/lib/macwall-site"
import {
  collectionMembersFrom,
  listCollectionSummaries,
} from "@/lib/public-catalog/collections"
import { loadDisplayPage } from "@/lib/public-catalog/display-wallpapers"
import {
  listPublicWallpaperSitemapEntries,
  listPublicWallpapersForCollections,
} from "@/lib/public-catalog/fetch"
import type { PublicWallpaper } from "@/lib/public-catalog/types"
import { categorySlugFromName } from "@/lib/seo/category-slugs"
import { comparisonPages } from "@/lib/seo/compare-pages"
import {
  DISPLAY_PAGES_PATH,
  displayPageDefs,
  displayPagePath,
} from "@/lib/seo/display-pages"
import { screenSaverMacPage } from "@/lib/seo/landing-pages"
import { indexableMarketingPaths } from "@/lib/seo/routes"
import {
  absoluteSiteUrl,
  addImages,
  applyHubDates,
  contentImageSources,
  newestDate,
  noteDate,
  parseContentDate,
  type SitemapHub,
} from "@/lib/seo/sitemap-helpers"
import {
  WALLPAPER_COLLECTIONS_HUB_PATH,
  wallpaperCollectionPath,
} from "@/lib/seo/wallpaper-collections"
import { canonicalSiteOrigin } from "@/lib/site-url"
import type { MetadataRoute } from "next"

function priorityForPath(path: string): number {
  if (path === "/") return 1
  if (path === "/download" || path === "/best-live-wallpaper-mac") return 0.95
  if (
    path === "/pricing" ||
    path === "/ai-info" ||
    path === "/blog" ||
    path === "/compare" ||
    path === "/tools" ||
    path === "/wallpapers" ||
    path === WALLPAPER_COLLECTIONS_HUB_PATH ||
    path === "/docs"
  )
    return 0.9
  if (path === "/wallpapers/macbook") return 0.9
  if (path.startsWith(`${WALLPAPER_COLLECTIONS_HUB_PATH}/`)) return 0.85
  if (path === "/learn" || path === "/faq" || path === "/screen-saver-mac")
    return 0.85
  if (path.startsWith("/faq/")) return 0.75
  if (path === "/about" || path === "/press") return 0.5
  if (path.startsWith("/blog/") || path.startsWith("/docs/")) return 0.8
  if (path.startsWith("/learn/")) return 0.75
  if (path === "/crawlers") return 0.2
  if (
    path.startsWith("/wallpapers/") ||
    path.startsWith("/wallpaper/") ||
    path.startsWith("/alternatives/")
  )
    return 0.85
  return 0.4
}

function changeFrequencyForPath(
  path: string
): MetadataRoute.Sitemap[number]["changeFrequency"] {
  if (path === "/" || path === "/blog" || path === "/wallpapers")
    return "weekly"
  // Galleries, collections and display pages pick up new loops.
  if (path.startsWith("/wallpapers/")) return "weekly"
  if (path.startsWith("/blog/")) return "weekly"
  // Wallpaper pages (/wallpaper/…) are written once; new loops get new pages.
  return "monthly"
}

/**
 * Listing pages and the pages they list. A hub's lastmod is the newest of
 * its own date and its children's, so `/blog` moves when a post is edited.
 */
const SITEMAP_HUBS: readonly SitemapHub[] = [
  { path: "/blog", isChild: (path) => path.startsWith("/blog/") },
  { path: "/docs", isChild: (path) => path.startsWith("/docs/") },
  { path: "/learn", isChild: (path) => path.startsWith("/learn/") },
  { path: "/faq", isChild: (path) => path.startsWith("/faq/") },
  { path: "/tools", isChild: (path) => path.startsWith("/tools/") },
  { path: "/legal", isChild: (path) => path.startsWith("/legal/") },
  {
    path: "/compare",
    isChild: (path) =>
      path.startsWith("/alternatives/") || path === "/best-live-wallpaper-mac",
  },
  {
    path: DISPLAY_PAGES_PATH,
    isChild: (path) => path.startsWith(`${DISPLAY_PAGES_PATH}/`),
  },
  {
    // The MacBook hub is about the MacBook display pages.
    path: "/wallpapers/macbook",
    isChild: (path) => path.startsWith(`${DISPLAY_PAGES_PATH}/macbook-`),
  },
  {
    path: WALLPAPER_COLLECTIONS_HUB_PATH,
    isChild: (path) => path.startsWith(`${WALLPAPER_COLLECTIONS_HUB_PATH}/`),
  },
]

/**
 * Editorial dates: each page's own `updatedAt` (or `publishedAt`). Real
 * content dates only: a lastmod that always says "now" gets ignored.
 */
function editorialDates(): Map<string, Date> {
  const dates = new Map<string, Date>()
  for (const document of siteMarkdownDocuments()) {
    noteDate(dates, document.path, parseContentDate(document.updatedAt))
  }
  // Pages that have no Markdown twin yet.
  for (const page of [...comparisonPages, screenSaverMacPage]) {
    noteDate(
      dates,
      page.pathname,
      newestDate([
        parseContentDate(page.updatedAt),
        parseContentDate(page.publishedAt),
      ])
    )
  }
  return dates
}

function newestCreated(
  wallpapers: readonly PublicWallpaper[]
): Date | undefined {
  return newestDate(
    wallpapers.map((wallpaper) => parseContentDate(wallpaper.createdAt))
  )
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = canonicalSiteOrigin()
  const dates = editorialDates()
  const images = new Map<string, string[]>()

  // Throw on transient failures so ISR retains its last successful sitemap.
  const [allDetailEntries, catalog] = await Promise.all([
    listPublicWallpaperSitemapEntries(),
    listPublicWallpapersForCollections(),
  ])
  // These read the same cached catalog, warm by now.
  const [collectionSummaries, displayPages] = await Promise.all([
    listCollectionSummaries(),
    Promise.all(
      displayPageDefs.map(async (def) => ({
        path: displayPagePath(def.slug),
        data: await loadDisplayPage(def.slug),
      }))
    ),
  ])

  // Thin wallpaper pages are noindex; listing them would contradict that.
  const detailEntries = allDetailEntries.filter((entry) => !entry.thin)
  for (const entry of detailEntries) {
    dates.set(entry.path, entry.lastModified)
    addImages(images, entry.path, [entry.imageUrl])
  }

  // Galleries list the catalog most-liked first: the cover is the first loop,
  // and the page changes whenever a wallpaper is added.
  noteDate(dates, "/wallpapers", newestCreated(catalog))
  addImages(images, "/wallpapers", [catalog[0]?.thumbUrl])
  const byCategoryPath = new Map<string, PublicWallpaper[]>()
  for (const wallpaper of catalog) {
    const slug = categorySlugFromName(wallpaper.category)
    if (!slug) continue
    const path = `/wallpapers/${slug}`
    const list = byCategoryPath.get(path) ?? []
    list.push(wallpaper)
    byCategoryPath.set(path, list)
  }
  for (const [path, wallpapers] of byCategoryPath) {
    noteDate(dates, path, newestCreated(wallpapers))
    addImages(images, path, [wallpapers[0]?.thumbUrl])
  }

  // A collection changes when a loop joins it: its date is the newest member's.
  const listedCollections = collectionSummaries.filter(
    (summary) => summary.indexable
  )
  // Same matcher as the collection pages, over the catalog already in hand.
  const members = listedCollections.map((summary) =>
    collectionMembersFrom(catalog, summary.collection)
  )
  listedCollections.forEach((summary, index) => {
    const path = wallpaperCollectionPath(summary.collection.slug)
    noteDate(dates, path, newestCreated(members[index]))
    addImages(images, path, [summary.cover?.thumbUrl])
  })
  // The hub shows every listed collection's cover.
  addImages(
    images,
    WALLPAPER_COLLECTIONS_HUB_PATH,
    listedCollections.map((summary) => summary.cover?.thumbUrl)
  )

  for (const { path, data } of displayPages) {
    if (!data) continue
    noteDate(dates, path, newestCreated(data.wallpapers))
    addImages(images, path, [data.wallpapers[0]?.thumbUrl])
  }

  // /download serves the current release; /changelog lists every release.
  const releaseDate = parseContentDate(macwall.currentVersionReleasedIso)
  noteDate(dates, "/download", releaseDate)
  noteDate(
    dates,
    "/changelog",
    newestDate([
      releaseDate,
      ...[...webAutoChangelogReleases, ...curatedChangelogReleases].map(
        (release) => parseContentDate(release.date)
      ),
    ])
  )

  for (const article of blogArticles) {
    addImages(images, article.pathname, [
      absoluteSiteUrl(
        origin,
        blogTilePoster(article.slug, article.category, "tile")
      ),
      ...contentImageSources(article.sections).map((src) =>
        absoluteSiteUrl(origin, src)
      ),
    ])
  }
  for (const page of [...docsPages, ...learnPages]) {
    addImages(
      images,
      page.pathname,
      contentImageSources(page.sections).map((src) =>
        absoluteSiteUrl(origin, src)
      )
    )
  }

  const paths = [
    ...new Set([
      ...indexableMarketingPaths(),
      WALLPAPER_COLLECTIONS_HUB_PATH,
      ...listedCollections.map((summary) =>
        wallpaperCollectionPath(summary.collection.slug)
      ),
      ...detailEntries.map((entry) => entry.path),
    ]),
  ]

  applyHubDates(dates, paths, SITEMAP_HUBS)

  // A page with no date of its own is built from the product facts in
  // lib/macwall-site.ts; this is the day those were last checked.
  const factsReviewed = parseContentDate(macwall.productInfoLastReviewedIso)

  return paths.map((path) => {
    const lastModified = dates.get(path) ?? factsReviewed
    const pageImages = images.get(path)
    return {
      url: path === "/" ? origin : `${origin}${path}`,
      ...(lastModified ? { lastModified } : {}),
      ...(pageImages ? { images: pageImages } : {}),
      changeFrequency: changeFrequencyForPath(path),
      priority: priorityForPath(path),
    }
  })
}
