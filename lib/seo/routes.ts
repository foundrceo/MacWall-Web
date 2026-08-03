import { getAllBlogSlugs } from "@/lib/blog"
import { getAllDocsSlugs } from "@/lib/docs/pages"
import { getAllLearnSlugs } from "@/lib/learn/pages"
import { wallpaperCategorySlugs } from "@/lib/seo/category-slugs"

/** All indexable marketing paths for sitemap generation. */
export function indexableMarketingPaths(): string[] {
  const staticPaths = [
    "/",
    "/download",
    "/pricing",
    "/creator",
    "/blog",
    "/docs",
    "/learn",
    "/changelog",
    "/wallpapers",
    "/best-live-wallpaper-mac",
    "/submit",
    "/affiliate",
    "/alternatives/wallpaper-engine",
    "/alternatives/macwall-vs-backdrop",
    "/alternatives/macwall-vs-wallspace",
    "/alternatives/lively-wallpaper-mac",
    "/crawlers",
    "/privacy",
    "/terms",
  ]

  const blogPaths = getAllBlogSlugs().map((slug) => `/blog/${slug}`)

  const docsPaths = getAllDocsSlugs().map((slug) => `/docs/${slug}`)

  const learnPaths = getAllLearnSlugs().map((slug) => `/learn/${slug}`)

  const wallpaperPaths = wallpaperCategorySlugs.map(
    (slug) => `/wallpapers/${slug}`
  )

  return [
    ...staticPaths,
    ...blogPaths,
    ...docsPaths,
    ...learnPaths,
    ...wallpaperPaths,
  ]
}
