import { getAllBlogSlugs } from "@/lib/blog"
import { getAllDocsSlugs } from "@/lib/docs/pages"
import { faqAnswerPath, getAllFaqSlugs } from "@/lib/faq/answers"
import { getAllLearnSlugs } from "@/lib/learn/pages"
import { AFFILIATE_UI_VISIBLE } from "@/lib/macwall-affiliate"
import { wallpaperCategorySlugs } from "@/lib/seo/category-slugs"
import { tools } from "@/lib/tools/tools"
import { displayPageDefs, displayPagePath } from "@/lib/seo/display-pages"

/**
 * All indexable marketing paths for sitemap generation. A path belongs here
 * only when its page returns 200 and is indexable; URLs that redirect stay
 * out.
 */
export function indexableMarketingPaths(): string[] {
  const staticPaths = [
    "/",
    "/download",
    "/pricing",
    "/ai-info",
    "/about",
    "/press",
    "/faq",
    "/creator",
    "/blog",
    "/docs",
    "/learn",
    "/changelog",
    "/bend",
    "/screen-saver-mac",
    "/wallpapers",
    "/wallpapers/macbook",
    "/wallpapers/display",
    "/best-live-wallpaper-mac",
    // The affiliate page is hidden from the site chrome until the program reopens.
    ...(AFFILIATE_UI_VISIBLE ? ["/affiliate"] : []),
    "/alternatives/wallpaper-engine",
    "/alternatives/macwall-vs-backdrop",
    "/alternatives/macwall-vs-wallspace",
    "/alternatives/iwallpaper",
    "/alternatives/lively-wallpaper-mac",
    "/alternatives/24-hour-wallpaper",
    "/alternatives/plash",
    "/alternatives/dynamic-wallpaper-club",
    "/compare",
    "/tools",
    ...tools.map((tool) => tool.pathname),
    "/crawlers",
    "/contact",
    "/legal",
    "/legal/terms",
    "/legal/privacy",
    "/legal/cookies",
    "/legal/refund",
    "/legal/subprocessors",
    "/legal/acceptable-use",
    "/legal/dmca",
    "/legal/gdpr",
    "/legal/ccpa",
    "/legal/security",
  ]

  const blogPaths = getAllBlogSlugs().map((slug) => `/blog/${slug}`)

  const docsPaths = getAllDocsSlugs().map((slug) => `/docs/${slug}`)

  const learnPaths = getAllLearnSlugs().map((slug) => `/learn/${slug}`)

  const faqPaths = getAllFaqSlugs().map(faqAnswerPath)

  const wallpaperPaths = [
    ...wallpaperCategorySlugs.map((slug) => `/wallpapers/${slug}`),
    ...displayPageDefs.map((def) => displayPagePath(def.slug)),
  ]

  return [
    ...staticPaths,
    ...blogPaths,
    ...docsPaths,
    ...learnPaths,
    ...faqPaths,
    ...wallpaperPaths,
  ]
}
