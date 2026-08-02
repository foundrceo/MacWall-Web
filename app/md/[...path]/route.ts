import { markdownResponse } from "@/lib/ai/markdown"
import { findMarkdownDocument, siteMarkdownDocuments } from "@/lib/ai/site-content"
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
        },
      }
    )
  }

  return markdownResponse(await document.render())
}

/** Prerender every known Markdown twin at build time. */
export function generateStaticParams(): { path: string[] }[] {
  return siteMarkdownDocuments().map((document) => ({
    path:
      document.path === "/"
        ? ["index"]
        : document.path.replace(/^\//, "").split("/"),
  }))
}
