import { siteMarkdownDocuments } from "@/lib/ai/site-content"
import { listCollectionSummaries } from "@/lib/public-catalog/collections"
import { listPublicWallpaperSitemapEntries } from "@/lib/public-catalog/fetch"
import { indexableMarketingPaths } from "@/lib/seo/routes"
import {
  WALLPAPER_COLLECTIONS_HUB_PATH,
  wallpaperCollectionPath,
  wallpaperCollections,
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
    path === "/wallpapers" ||
    path === WALLPAPER_COLLECTIONS_HUB_PATH ||
    path === "/docs"
  )
    return 0.9
  if (path.startsWith(`${WALLPAPER_COLLECTIONS_HUB_PATH}/`)) return 0.85
  if (path === "/learn") return 0.85
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
  if (path.startsWith(WALLPAPER_COLLECTIONS_HUB_PATH)) return "weekly"
  if (path.startsWith("/blog/") || path.startsWith("/wallpaper/"))
    return "weekly"
  return "monthly"
}

/** Real content dates only — a lastmod that always says "now" gets ignored by crawlers. */
function editorialLastModifiedByPath(): Map<string, Date> {
  const dates = new Map<string, Date>()
  for (const document of siteMarkdownDocuments()) {
    if (!document.updatedAt) continue
    const parsed = Date.parse(document.updatedAt)
    if (Number.isFinite(parsed)) dates.set(document.path, new Date(parsed))
  }
  return dates
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = canonicalSiteOrigin()

  // Throw on transient failures so ISR retains its last successful sitemap.
  const detailEntries = await listPublicWallpaperSitemapEntries()

  const collectionSummaries = await listCollectionSummaries()
  // Newest wallpaper in the catalog stands in for "collection last changed".
  const newestWallpaper = detailEntries.reduce<Date | undefined>(
    (latest, entry) =>
      !latest || entry.lastModified > latest ? entry.lastModified : latest,
    undefined
  )

  const lastModByPath = editorialLastModifiedByPath()
  for (const entry of detailEntries) {
    lastModByPath.set(entry.path, entry.lastModified)
  }

  // Catalog outage: keep every registered topic listed rather than dropping them.
  const collectionSlugs =
    collectionSummaries.length > 0
      ? collectionSummaries
          .filter((summary) => summary.indexable)
          .map((summary) => summary.collection.slug)
      : wallpaperCollections.map((entry) => entry.slug)
  const collectionPaths = [
    WALLPAPER_COLLECTIONS_HUB_PATH,
    ...collectionSlugs.map(wallpaperCollectionPath),
  ]
  if (newestWallpaper) {
    for (const path of collectionPaths) lastModByPath.set(path, newestWallpaper)
    lastModByPath.set("/wallpapers", newestWallpaper)
  }

  const paths = [
    ...indexableMarketingPaths(),
    ...collectionPaths,
    ...detailEntries.map((entry) => entry.path),
  ]

  return paths.map((path) => {
    const lastModified = lastModByPath.get(path)
    return {
      url: path === "/" ? origin : `${origin}${path}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: changeFrequencyForPath(path),
      priority: priorityForPath(path),
    }
  })
}
