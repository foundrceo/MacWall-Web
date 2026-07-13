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
  if (path === "/pricing" || path === "/blog") return 0.9
  if (path.startsWith("/blog/")) return 0.8
  if (path.startsWith("/wallpapers/") || path.startsWith("/alternatives/"))
    return 0.85
  if (path === "/lock-screen-wallpaper") return 0.85
  return 0.4
}

function changeFrequencyForPath(
  path: string
): MetadataRoute.Sitemap[number]["changeFrequency"] {
  if (path === "/" || path === "/blog") return "weekly"
  if (path.startsWith("/blog/")) return "monthly"
  return "monthly"
}

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = canonicalSiteOrigin()
  const stamp = new Date()

  return indexableMarketingPaths().map((path) => ({
    url: path === "/" ? origin : `${origin}${path}`,
    lastModified: stamp,
    changeFrequency: changeFrequencyForPath(path),
    priority: priorityForPath(path),
  }))
}
