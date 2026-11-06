import { canonicalSiteOrigin } from "@/lib/site-url"
import type { MetadataRoute } from "next"

/**
 * Disallow values are prefix matches: a bare `/wallpaper` would also block
 * `/wallpapers` and every `/wallpaper/{category}/{slug}` page. `$` anchors the
 * end of the URL, so `/open$` leaves `/openapi.json` alone.
 *
 * Pages that only need to stay out of the index (`/thank-you`, `/activate`,
 * `/tiktok`, `/unsubscribe/*`) carry `robots: noindex` instead. A Disallow
 * would hide that tag, and Google can then list the bare URL as "Indexed,
 * though blocked by robots.txt".
 *
 * `/llms.txt`, `/ai.txt`, feeds and the API catalog are allowed on purpose and
 * documented at `/crawlers`.
 *
 * Search, image and AI crawlers named explicitly so the policy is unambiguous
 * to each of them. A crawler that matches a named group ignores `*`, so every
 * group carries the same rules.
 */
const NAMED_CRAWLERS = [
  "Googlebot",
  "Googlebot-Image",
  "Google-Extended",
  "Bingbot",
  "Applebot",
  "Applebot-Extended",
  "DuckDuckBot",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "CCBot",
]

const ALLOW = [
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
]

const DISALLOW = [
  "/admin/",
  "/api/admin/",
  // Buy links mint a Stripe Checkout Session per request.
  "/api/checkout/",
  // The installer download: a redirect linked from every page's header CTA,
  // then the .dmg itself.
  "/download/latest",
  "/api/installers/",
  "/auth/",
  // Only the bare deep-link bridge. `/open?id=…` stays crawlable so its
  // noindex is seen.
  "/open$",
  // Internal handler behind the `/{path}.md` rewrite. The HTML page is
  // canonical, so the Markdown twin should never be indexed on its own.
  "/md/",
]

export default function robots(): MetadataRoute.Robots {
  const origin = canonicalSiteOrigin()
  return {
    rules: [
      { userAgent: "*", allow: ALLOW, disallow: DISALLOW },
      { userAgent: NAMED_CRAWLERS, allow: ALLOW, disallow: DISALLOW },
    ],
    sitemap: `${origin}/sitemap.xml`,
  }
}
