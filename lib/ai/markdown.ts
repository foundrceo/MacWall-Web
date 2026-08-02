import type {
  ContentBlock,
  ContentFaq,
  SeoContentPage,
} from "@/lib/content/types"
import { canonicalSiteOrigin } from "@/lib/site-url"

/**
 * Shared plain-text/Markdown serialization for `/llms.txt`, `/llms-full.txt`,
 * and the `.md` twin of every content page.
 *
 * Section copy already uses inline Markdown (`**bold**`, `[label](/path)`), so
 * blocks pass through mostly untouched — only relative links are absolutized so
 * an LLM reading a single file can still resolve every reference.
 */

/** Rewrite `](/path)` to an absolute URL so extracted Markdown stays navigable. */
export function absolutizeMarkdownLinks(text: string): string {
  const origin = canonicalSiteOrigin()
  return text.replace(/\]\((\/[^)]*)\)/g, (_match, path: string) => {
    return `](${origin}${path})`
  })
}

export function contentBlocksToMarkdown(
  blocks: readonly ContentBlock[]
): string {
  const parts: string[] = []

  for (const block of blocks) {
    switch (block.type) {
      case "h2":
        parts.push(`## ${absolutizeMarkdownLinks(block.text)}`)
        break
      case "h3":
        parts.push(`### ${absolutizeMarkdownLinks(block.text)}`)
        break
      case "p":
        parts.push(absolutizeMarkdownLinks(block.text))
        break
      case "ul":
        parts.push(
          block.items
            .map((item) => `- ${absolutizeMarkdownLinks(item)}`)
            .join("\n")
        )
        break
      case "ol":
        parts.push(
          block.items
            .map(
              (item, index) => `${index + 1}. ${absolutizeMarkdownLinks(item)}`
            )
            .join("\n")
        )
        break
      default: {
        const exhaustive: never = block
        void exhaustive
      }
    }
  }

  return parts.join("\n\n")
}

export function faqToMarkdown(faq: readonly ContentFaq[]): string {
  if (faq.length === 0) return ""

  const body = faq
    .map(
      (item) =>
        `### ${absolutizeMarkdownLinks(item.question)}\n\n${absolutizeMarkdownLinks(item.answer)}`
    )
    .join("\n\n")

  return `## Frequently asked questions\n\n${body}`
}

export type MarkdownFrontmatter = Record<
  string,
  string | number | readonly string[] | undefined
>

function serializeFrontmatter(data: MarkdownFrontmatter): string {
  const lines: string[] = ["---"]

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      if (value.length === 0) continue
      lines.push(`${key}:`)
      for (const item of value) lines.push(`  - ${quoteYaml(String(item))}`)
      continue
    }
    lines.push(`${key}: ${quoteYaml(String(value))}`)
  }

  lines.push("---")
  return lines.join("\n")
}

/** Minimal YAML scalar quoting — content here is plain prose, never structural. */
function quoteYaml(value: string): string {
  const escaped = value.replace(/"/g, '\\"')
  return `"${escaped}"`
}

/** Full Markdown document for an SEO/blog/docs page, including frontmatter. */
export function seoPageToMarkdown(
  page: SeoContentPage,
  extraFrontmatter: MarkdownFrontmatter = {}
): string {
  const origin = canonicalSiteOrigin()
  const frontmatter = serializeFrontmatter({
    title: page.title,
    description: page.description,
    canonical: `${origin}${page.pathname}`,
    published: page.publishedAt,
    updated: page.updatedAt ?? page.publishedAt,
    keywords: page.keywords,
    ...extraFrontmatter,
  })

  const chunks = [
    frontmatter,
    `# ${page.headline}`,
    absolutizeMarkdownLinks(page.description),
    contentBlocksToMarkdown(page.sections),
  ]

  const faq = page.faq ? faqToMarkdown(page.faq) : ""
  if (faq) chunks.push(faq)

  chunks.push(`---\n\nSource: ${origin}${page.pathname}`)

  return `${chunks.filter(Boolean).join("\n\n")}\n`
}

/** Shared response helper so every Markdown route sends consistent headers. */
export function markdownResponse(
  body: string,
  options: { cacheSeconds?: number } = {}
): Response {
  const cacheSeconds = options.cacheSeconds ?? 3600
  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": `public, s-maxage=${cacheSeconds}, stale-while-revalidate=86400`,
      "X-Robots-Tag": "noindex",
    },
  })
}

/** `text/plain` variant for `/llms.txt` style manifests. */
export function plainTextResponse(
  body: string,
  options: { cacheSeconds?: number } = {}
): Response {
  const cacheSeconds = options.cacheSeconds ?? 3600
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": `public, s-maxage=${cacheSeconds}, stale-while-revalidate=86400`,
    },
  })
}
