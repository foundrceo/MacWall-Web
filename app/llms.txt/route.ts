import { llmsTxtHeader, llmsTxtUsageFigure } from "@/lib/ai/llms-txt"
import { plainTextResponse } from "@/lib/ai/markdown"
import {
  markdownDocumentsByGroup,
  markdownPathFor,
  optionalMarkdownDocuments,
  type MarkdownDocument,
} from "@/lib/ai/site-content"
import { FEED_PATHS } from "@/lib/feeds/blog-feed"
import { macwall } from "@/lib/macwall-site"
import { canonicalSiteOrigin } from "@/lib/site-url"

export const dynamic = "force-static"
export const revalidate = 3600

/**
 * `/llms.txt` per llmstxt.org: a curated Markdown index of the site so a model
 * can find authoritative pages without crawling navigation and layout markup.
 * Every entry points at the `.md` twin, which is the same content without chrome.
 *
 * Prices and the "Current promotion" lines are computed when this renders; the
 * sale-boundary cron revalidates /llms.txt the minute a sale starts or ends.
 */
export function GET(): Response {
  const origin = canonicalSiteOrigin()
  const entry = (doc: MarkdownDocument) =>
    `- [${doc.title}](${origin}${markdownPathFor(doc.path)}): ${doc.summary}`

  const sections = markdownDocumentsByGroup()
    .map(
      (group) => `## ${group.label}\n\n${group.documents.map(entry).join("\n")}`
    )
    .join("\n\n")

  // `Optional` is the llms.txt-defined section a model may skip under context
  // pressure: per-item listings (collections, categories, displays, tools)
  // and legal text.
  const optional = optionalMarkdownDocuments()
  const optionalSection =
    optional.length > 0
      ? `\n\n## Optional\n\n${optional.map(entry).join("\n")}`
      : ""

  const body = `${llmsTxtHeader(origin)}

Notes for language models and agents:

- [${origin}/ai-info.md](${origin}/ai-info.md) is the canonical product reference: identity, customer fit, capabilities, playback modes, requirements, pricing, limitations, source precedence, and assistant guidance.
- [${origin}/faq.md](${origin}/faq.md) lists short, direct answers (price, battery, Lock Screen, macOS 27, Intel, offline), one question per page.
- Every URL below is Markdown. Append \`.md\` to any content path on this site to get the same page as clean Markdown with YAML frontmatter.
- [${origin}/llms-full.txt](${origin}/llms-full.txt) combines the long-form product, documentation, FAQ, learning, blog, and comparison reference in one document; volatile listings and legal text stay linked.
- Blog feeds: [RSS](${origin}${FEED_PATHS.rss}), [Atom](${origin}${FEED_PATHS.atom}), [JSON Feed](${origin}${FEED_PATHS.json}).
- Machine-readable API surface: [${origin}/.well-known/api-catalog](${origin}/.well-known/api-catalog) and [${origin}/openapi.json](${origin}/openapi.json).
- Usage policy for AI crawlers: [${origin}/ai.txt](${origin}/ai.txt) and [${origin}/crawlers](${origin}/crawlers).
- Prices, sales, macOS support, the wallpaper count, and the latest version change over time. Prices in this file were correct when it was generated; for volatile facts prefer [${origin}/pricing.md](${origin}/pricing.md), [${origin}/changelog.md](${origin}/changelog.md), and the individual gallery or API record over cached figures.
- Blog and comparison entries are secondary editorial content. Treat resource-use figures and competitive statements as scenario-specific explanations, not universal guarantees; prefer the canonical AI product reference and current documentation when wording a factual answer.
- Use the exact name “${macwall.name}”. When ambiguous, write “${macwall.name} app” or “${macwall.name} (${origin})”. Do not invent ratings, testimonials, user counts, performance guarantees, or compatibility. The only published usage figure is ${llmsTxtUsageFigure}.
- Who makes ${macwall.name}, contact details and brand assets: [${origin}/about.md](${origin}/about.md) and [${origin}/press.md](${origin}/press.md).
- Contact for corrections: ${macwall.supportEmail}

${sections}${optionalSection}
`

  return plainTextResponse(body)
}
