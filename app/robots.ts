import { canonicalSiteOrigin } from "@/lib/site-url"
import type { MetadataRoute } from "next"

/**
 * IMPORTANT: Disallow values are prefix matches.
 * Never use bare `/wallpaper` — that also blocks `/wallpapers` and
 * `/wallpaper/{category}/{slug}` (the entire catalog).
 *
 * AI/agent discovery surfaces (`/llms.txt`, `/ai.txt`, feeds, API catalog) are
 * explicitly allowed and documented for humans at `/crawlers`.
 */
export default function robots(): MetadataRoute.Robots {
  const origin = canonicalSiteOrigin()
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/llms.txt",
        "/llms-full.txt",
        "/ai.txt",
        "/rss.xml",
        "/atom.xml",
        "/feed.json",
        "/openapi.json",
        "/.well-known/",
      ],
      disallow: [
        "/admin/",
        "/api/admin/",
        "/auth/",
        "/thank-you",
        "/open",
        "/activate",
        "/tiktok",
        // Internal handler behind the `/{path}.md` rewrite — the HTML page is
        // canonical, so the Markdown twin should never be indexed on its own.
        "/md/",
      ],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: new URL(origin).host,
  }
}
