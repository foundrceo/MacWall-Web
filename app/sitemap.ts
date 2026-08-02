import { listPublicWallpaperSitemapEntries } from "@/lib/public-catalog/fetch"
import { indexableMarketingPaths } from "@/lib/seo/routes"
import { canonicalSiteOrigin } from "@/lib/site-url"
import type { MetadataRoute } from "next"

function priorityForPath(path: string): number {
  if (path === "/") return 1
  if (
    path === "/download" ||
    path === "/live-wallpaper-mac" ||
    path === "/best-live-wallpaper-mac"
  )
    return 0.95
  if (path === "/pricing" || path === "/blog" || path === "/wallpapers")
    return 0.9
  if (path.startsWith("/blog/")) return 0.8
  if (
    path.startsWith("/wallpapers/") ||
    path.startsWith("/wallpaper/") ||
    path.startsWith("/alternatives/")
  )
    return 0.85
  if (path === "/lock-screen-wallpaper") return 0.85
  return 0.4
}

function changeFrequencyForPath(
  path: string
): MetadataRoute.Sitemap[number]["changeFrequency"] {
  if (path === "/" || path === "/blog" || path === "/wallpapers") return "weekly"
  if (path.startsWith("/blog/") || path.startsWith("/wallpaper/")) return "weekly"
  return "monthly"
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = canonicalSiteOrigin()
  const stamp = new Date()

  let detailEntries: Awaited<ReturnType<typeof listPublicWallpaperSitemapEntries>> =
    []
  try {
    detailEntries = await listPublicWallpaperSitemapEntries()
  } catch {
    detailEntries = []
  }

  const detailLastModByPath = new Map(
    detailEntries.map((entry) => [entry.path, entry.lastModified])
  )
  const staticPaths = indexableMarketingPaths()
  const detailPaths = detailEntries.map((entry) => entry.path)
  const paths = [...staticPaths, ...detailPaths]

  return paths.map((path) => ({
    url: path === "/" ? origin : `${origin}${path}`,
    lastModified: detailLastModByPath.get(path) ?? stamp,
    changeFrequency: changeFrequencyForPath(path),
    priority: priorityForPath(path),
  }))
}
