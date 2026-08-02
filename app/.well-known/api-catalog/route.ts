import { macwall } from "@/lib/macwall-site"
import { canonicalSiteOrigin } from "@/lib/site-url"

export const dynamic = "force-static"
export const revalidate = 86400

/**
 * RFC 9727 API catalog served as `application/linkset+json` (RFC 9264).
 *
 * Each linkset member anchors an API endpoint and points at its machine
 * description (`service-desc`), human documentation (`service-doc`), and
 * metadata (`service-meta`), using the link relations from RFC 8631.
 */
export function GET(): Response {
  const origin = canonicalSiteOrigin()
  const openapi = `${origin}/openapi.json`
  const docs = `${origin}/docs/public-api`

  const apiEntry = (input: {
    anchor: string
    title: string
    description: string
  }) => ({
    anchor: input.anchor,
    "service-desc": [
      {
        href: openapi,
        type: "application/openapi+json",
        title: `OpenAPI 3.1 description for ${macwall.name} public endpoints`,
      },
    ],
    "service-doc": [
      {
        href: docs,
        type: "text/html",
        title: input.title,
      },
    ],
    "service-meta": [
      {
        href: `${origin}/terms`,
        type: "text/html",
        title: "Terms of service",
      },
      {
        href: `${origin}/ai.txt`,
        type: "text/plain",
        title: "AI and machine usage policy",
      },
    ],
    author: [{ href: origin, title: macwall.legalCompanyName }],
    describedby: [
      {
        href: `${docs}.md`,
        type: "text/markdown",
        title: `${input.title} (Markdown)`,
      },
    ],
    summary: input.description,
  })

  const linkset = {
    linkset: [
      apiEntry({
        anchor: `${origin}/api/wallpapers`,
        title: "Public wallpaper catalog API",
        description:
          "Read-only, unauthenticated, paginated public wallpaper catalog with search, category, tag, and sort filters.",
      }),
      apiEntry({
        anchor: `${origin}/api/installers/releases/version.json`,
        title: "Release metadata API",
        description:
          "Current app version, build number, download URL, and release notes — the same feed the in-app updater reads.",
      }),
      apiEntry({
        anchor: `${origin}/download/latest`,
        title: "Latest installer redirect",
        description:
          "Stable path that redirects to the current signed macOS installer.",
      }),
      {
        anchor: `${origin}/.well-known/api-catalog`,
        item: [
          {
            href: `${origin}/api/wallpapers`,
            type: "application/json",
            title: "Public wallpaper catalog API",
          },
          {
            href: `${origin}/api/installers/releases/version.json`,
            type: "application/json",
            title: "Release metadata API",
          },
          {
            href: `${origin}/download/latest`,
            type: "application/octet-stream",
            title: "Latest installer redirect",
          },
        ],
        "service-desc": [
          { href: openapi, type: "application/openapi+json" },
        ],
        "service-doc": [{ href: docs, type: "text/html" }],
        author: [{ href: origin, title: macwall.legalCompanyName }],
      },
    ],
  }

  return new Response(JSON.stringify(linkset, null, 2), {
    headers: {
      "Content-Type": "application/linkset+json; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
