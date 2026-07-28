import { getAllBlogSlugs } from "@/lib/blog"
import { wallpaperCategorySlugs } from "@/lib/seo/category-slugs"

/** All indexable marketing paths for sitemap generation. */
export function indexableMarketingPaths(): string[] {
  const staticPaths = [
    "/",
    "/download",
    "/pricing",
    "/pricing/reel-refund",
    "/blog",
    "/live-wallpaper-mac",
    "/lock-screen-wallpaper",
    "/best-live-wallpaper-mac",
    "/submit",
    "/submit",
    "/alternatives/wallpaper-engine",
    "/alternatives/macwall-vs-backdrop",
    "/alternatives/macwall-vs-wallper",
    "/alternatives/macwall-vs-wallspace",
    "/alternatives/lively-wallpaper-mac",
    "/privacy",
    "/terms",
  ]

  const blogPaths = getAllBlogSlugs().map((slug) => `/blog/${slug}`)

  const wallpaperPaths = wallpaperCategorySlugs.map(
    (slug) => `/wallpapers/${slug}`
  )

  return [...staticPaths, ...blogPaths, ...wallpaperPaths]
}
