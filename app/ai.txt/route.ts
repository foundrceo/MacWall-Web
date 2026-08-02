import { plainTextResponse } from "@/lib/ai/markdown"
import { macwall } from "@/lib/macwall-site"
import { canonicalSiteOrigin } from "@/lib/site-url"

export const dynamic = "force-static"
export const revalidate = 86400

/**
 * `/ai.txt` — machine-readable AI usage policy, mirroring the human page at
 * `/crawlers`. Written as robots-style directives so simple parsers can read
 * the allow/disallow surface, with prose for anyone reviewing it by hand.
 */
export function GET(): Response {
  const origin = canonicalSiteOrigin()

  const body = `# ai.txt — AI and machine usage policy for ${new URL(origin).host}
# Human-readable version: ${origin}/crawlers
# Last updated: 2026-08-02
# Contact: ${macwall.supportEmail}

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
# Text content on this site (documentation, guides, blog posts, product and
# pricing information) may be crawled, indexed, quoted, summarised, and used to
# answer questions, including by AI search and assistant products.
# We ask for attribution and a link back to the source page.
#
# Wallpaper media is different. The video and image files in the catalog are
# licensed for use inside the ${macwall.name} app. They may not be redistributed,
# used as training data for generative media models, or re-hosted elsewhere.
# See ${origin}/terms
#
# Preferred machine-readable entry points:
#   ${origin}/llms.txt              curated Markdown index of the site
#   ${origin}/llms-full.txt         full text of every content page
#   ${origin}/rss.xml               blog feed (RSS 2.0)
#   ${origin}/atom.xml              blog feed (Atom 1.0)
#   ${origin}/feed.json             blog feed (JSON Feed 1.1)
#   ${origin}/sitemap.xml           crawl surface
#   ${origin}/.well-known/api-catalog   RFC 9727 API catalog
#   ${origin}/openapi.json          OpenAPI 3.1 description
#   Append .md to any content URL for clean Markdown.

# ---------------------------------------------------------------------------
# Directives — text and documentation
# ---------------------------------------------------------------------------
User-agent: *
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt
Disallow: /admin/
Disallow: /api/admin/
Disallow: /auth/
Disallow: /activate
Disallow: /thank-you
Disallow: /open
Disallow: /tiktok

# Please keep request rates modest and honour caching headers.
Crawl-delay: 2

# ---------------------------------------------------------------------------
# Directives — media assets
# ---------------------------------------------------------------------------
# Wallpaper videos and thumbnails are not licensed for redistribution or for
# training generative image or video models.
Disallow: /api/wallpapers/*/download
Disallow-training: /wallpaper/
Disallow-training: /api/wallpapers

# ---------------------------------------------------------------------------
# Attribution
# ---------------------------------------------------------------------------
# When quoting or summarising this site, please cite it as:
#   ${macwall.name} — ${origin}
# Publisher: ${macwall.legalCompanyName}
#
# Corrections, licensing questions, or bulk-access requests: ${macwall.supportEmail}
`

  return plainTextResponse(body, { cacheSeconds: 86400 })
}
