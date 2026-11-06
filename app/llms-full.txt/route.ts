import { llmsTxtFactLines, llmsTxtSummary } from "@/lib/ai/llms-txt"
import { plainTextResponse } from "@/lib/ai/markdown"
import { siteMarkdownDocuments } from "@/lib/ai/site-content"
import { macwall } from "@/lib/macwall-site"
import { canonicalSiteOrigin } from "@/lib/site-url"

export const dynamic = "force-static"
export const revalidate = 3600

/**
 * `/llms-full.txt` — long-form product, documentation, FAQ, learning, blog,
 * and comparison pages concatenated for one-fetch ingestion. Volatile
 * listings, the changelog, and legal text stay linked instead of being cached
 * here. Prices are computed when this renders; the sale-boundary cron
 * revalidates it when a sale starts or ends.
 */
export async function GET(): Promise<Response> {
  const origin = canonicalSiteOrigin()
  const now = Date.now()
  const documents = siteMarkdownDocuments().filter(
    (doc) => doc.includeInFullText
  )

  const rendered = await Promise.all(
    documents.map(async (doc) => {
      const markdown = await doc.render()
      return `<!-- BEGIN ${origin}${doc.path} -->\n\n${markdown.trim()}\n\n<!-- END ${origin}${doc.path} -->`
    })
  )

  // The newest content change among the documents, not the time of this render.
  const lastContentUpdate = documents
    .map((doc) => doc.updatedAt)
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1)

  const header = `# ${macwall.name}: full site text

> ${llmsTxtSummary(now)}

${llmsTxtFactLines(origin, now).join("\n\n")}

Contact: ${macwall.supportEmail}
Documents: ${documents.length}
Newest document update: ${lastContentUpdate ?? macwall.productInfoLastReviewedIso}
Served from cache built: ${new Date(now).toISOString()}

Curated index: ${origin}/llms.txt
Canonical product reference: ${origin}/ai-info.md
Blog feed: ${origin}/rss.xml
API catalog: ${origin}/.well-known/api-catalog
AI usage policy: ${origin}/ai.txt

Each document below is delimited by \`<!-- BEGIN <url> -->\` and \`<!-- END <url> -->\` comments. Legal text, the changelog, and gallery listings are omitted here because they change often, so fetch those pages directly.

---
`

  return plainTextResponse(`${header}\n${rendered.join("\n\n")}\n`)
}
