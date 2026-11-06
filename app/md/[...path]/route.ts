import { markdownResponse } from "@/lib/ai/markdown"
import { findMarkdownDocument } from "@/lib/ai/site-content"
import {
  galleryPageMarkdown,
  wallpaperDetailMarkdown,
} from "@/lib/ai/wallpaper-markdown"
import { canonicalSiteOrigin } from "@/lib/site-url"

export const dynamic = "force-static"
export const revalidate = 3600

/**
 * Serves the Markdown twin of a content page.
 *
 * Reached through the `/:path*.md` rewrite in `next.config.mjs`, so the public
 * URL is `/blog/example.md` rather than `/md/blog/example`. `/index.md` maps to
 * the home page.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> }
): Promise<Response> {
  const { path } = await context.params
  const joined = path.join("/")
  const lookup = joined === "index" ? "/" : `/${joined}`
  const document = findMarkdownDocument(lookup)

  // Catalog pages (wallpapers, gallery pages) render their twins on demand.
  if (!document) {
    const catalog = lookup.startsWith("/wallpaper/")
      ? await wallpaperDetailMarkdown(lookup)
      : lookup.includes("/page/")
        ? await galleryPageMarkdown(lookup)
        : null
    if (catalog) {
      return markdownResponse(catalog.body, {
        canonicalPath: catalog.canonicalPath,
        cacheSeconds: 86400,
      })
    }
  }

  if (!document) {
    const origin = canonicalSiteOrigin()
    return new Response(
      `# Not found\n\nNo Markdown document exists for \`${lookup}\`.\n\nSee ${origin}/llms.txt for the full index of available Markdown documents.\n`,
      {
        status: 404,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Cache-Control": "public, s-maxage=300",
          "X-Robots-Tag": "noindex",
          Vary: "Accept",
        },
      }
    )
  }

  return markdownResponse(await document.render(), {
    canonicalPath: document.path,
  })
}

/**
 * Empty on purpose, as on the wallpaper detail page: it marks the catch-all
 * as a static route so `force-static` and `revalidate` above apply. Twins
 * render on first request and are then served from the ISR cache (and
 * revalidated by tag, e.g. the sale-boundary cron for priced twins).
 */
export async function generateStaticParams(): Promise<{ path: string[] }[]> {
  return []
}
