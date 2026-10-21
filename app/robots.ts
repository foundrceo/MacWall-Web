import { canonicalSiteOrigin } from "@/lib/site-url"
import type { MetadataRoute } from "next"

/**
 * Disallow values are prefix matches: a bare `/wallpaper` would also block
 * `/wallpapers` and every `/wallpaper/{category}/{slug}` page.
 *
 * `/llms.txt`, `/ai.txt`, feeds and the API catalog are allowed on purpose and
 * documented at `/crawlers`.
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
        "/ai-info",
        "/ai-info.md",
        "/rss.xml",
        "/atom.xml",
        "/feed.json",
        "/openapi.json",
        "/.well-known/",
      ],
      disallow: [
        "/admin/",
        "/api/admin/",
        // Buy links mint a Stripe Checkout Session per request.
        "/api/checkout/",
        "/auth/",
        "/thank-you",
        "/open",
        "/activate",
        "/tiktok",
        "/unsubscribe",
        // Internal handler behind the `/{path}.md` rewrite. The HTML page is
        // canonical, so the Markdown twin should never be indexed on its own.
        "/md/",
      ],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: new URL(origin).host,
  }
}
