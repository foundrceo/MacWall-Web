import robots from "@/app/robots"
import { plainTextResponse } from "@/lib/ai/markdown"
import { macwall } from "@/lib/macwall-site"
import { AI_POLICY_UPDATED_ISO } from "@/lib/seo/crawlers-page"
import { canonicalSiteOrigin } from "@/lib/site-url"

export const dynamic = "force-static"
export const revalidate = 86400

/** The `User-agent: *` rules from app/robots.ts, so the two files can't disagree. */
function robotsWildcardRules(): { allow: string[]; disallow: string[] } {
  const rules = robots().rules
  const list = Array.isArray(rules) ? rules : [rules]
  const wildcard =
    list.find((rule) => rule.userAgent === "*") ?? list[0] ?? undefined
  const asArray = (value: string | string[] | undefined) =>
    value === undefined ? [] : Array.isArray(value) ? value : [value]
  return {
    allow: asArray(wildcard?.allow),
    disallow: asArray(wildcard?.disallow),
  }
}

/**
 * `/ai.txt`: machine-readable AI usage policy, mirroring the human page at
 * `/crawlers`. The allow and disallow lines are robots.txt's own rules; the
 * policy on text and media is in the comments, because no crawler reads a
 * training directive from this file.
 */
export function GET(): Response {
  const origin = canonicalSiteOrigin()
  const { allow, disallow } = robotsWildcardRules()

  const body = `# ai.txt: AI and machine usage policy for ${new URL(origin).host}
# Human-readable version: ${origin}/crawlers
# Policy last updated: ${AI_POLICY_UPDATED_ISO}
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
# See ${origin}/legal/terms
#
# Preferred machine-readable entry points:
#   ${origin}/ai-info.md           canonical product facts and guidance
#   ${origin}/llms.txt              curated Markdown index of the site
#   ${origin}/llms-full.txt         combined long-form site reference
#   ${origin}/rss.xml               blog feed (RSS 2.0)
#   ${origin}/atom.xml              blog feed (Atom 1.0)
#   ${origin}/feed.json             blog feed (JSON Feed 1.1)
#   ${origin}/sitemap.xml           crawl surface
#   ${origin}/.well-known/api-catalog   RFC 9727 API catalog
#   ${origin}/openapi.json          OpenAPI 3.1 description
#   Append .md to any content URL for clean Markdown.

# ---------------------------------------------------------------------------
# Directives: the same rules as ${origin}/robots.txt
# ---------------------------------------------------------------------------
User-agent: *
${[...allow.map((path) => `Allow: ${path}`), ...disallow.map((path) => `Disallow: ${path}`)].join("\n")}

# Please keep request rates modest and honour caching headers.

# ---------------------------------------------------------------------------
# Media assets
# ---------------------------------------------------------------------------
# Wallpaper videos and thumbnails (served from the catalog CDN and linked from
# /wallpaper/ pages and /api/wallpapers) are not licensed for redistribution
# or for training generative image or video models. Pages and API records
# describing them may be crawled like any other text.

# ---------------------------------------------------------------------------
# Attribution
# ---------------------------------------------------------------------------
# When quoting or summarising this site, please cite it as:
#   ${macwall.name}: ${origin}
# Publisher: ${macwall.name} (${macwall.legalCompanyName})
#
# Corrections, licensing questions, or bulk-access requests: ${macwall.supportEmail}
`

  return plainTextResponse(body, { cacheSeconds: 86400 })
}
