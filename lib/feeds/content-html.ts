import type { ContentBlock, ContentFaq } from "@/lib/content/types"
import { canonicalSiteOrigin } from "@/lib/site-url"

/**
 * Renders `ContentBlock[]` to standalone HTML for feed payloads
 * (`content:encoded`, Atom `<content>`, JSON Feed `content_html`).
 *
 * Escaping happens before inline Markdown conversion, so authored text can
 * never inject markup — only the small inline subset below produces tags.
 */

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/** `**bold**`, `` `code` ``, and `[label](href)` — nothing else is honoured. */
function inlineMarkdownToHtml(text: string): string {
  const origin = canonicalSiteOrigin()

  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(
      /\[([^\]]+)\]\(([^)\s]+)\)/g,
      (_match, label: string, href: string) => {
        const absolute = href.startsWith("/") ? `${origin}${href}` : href
        const safe = /^(https?:|mailto:)/i.test(absolute) ? absolute : "#"
        return `<a href="${safe}">${label}</a>`
      }
    )
}

export function contentBlocksToHtml(blocks: readonly ContentBlock[]): string {
  const parts: string[] = []

  for (const block of blocks) {
    switch (block.type) {
      case "h2":
        parts.push(`<h2>${inlineMarkdownToHtml(block.text)}</h2>`)
        break
      case "h3":
        parts.push(`<h3>${inlineMarkdownToHtml(block.text)}</h3>`)
        break
      case "p":
        parts.push(`<p>${inlineMarkdownToHtml(block.text)}</p>`)
        break
      case "ul":
        parts.push(
          `<ul>${block.items
            .map((item) => `<li>${inlineMarkdownToHtml(item)}</li>`)
            .join("")}</ul>`
        )
        break
      case "ol":
        parts.push(
          `<ol>${block.items
            .map((item) => `<li>${inlineMarkdownToHtml(item)}</li>`)
            .join("")}</ol>`
        )
        break
      default: {
        const exhaustive: never = block
        void exhaustive
      }
    }
  }

  return parts.join("\n")
}

export function faqToHtml(faq: readonly ContentFaq[]): string {
  if (faq.length === 0) return ""

  const items = faq
    .map(
      (item) =>
        `<h3>${inlineMarkdownToHtml(item.question)}</h3>\n<p>${inlineMarkdownToHtml(item.answer)}</p>`
    )
    .join("\n")

  return `<h2>Frequently asked questions</h2>\n${items}`
}

/** Escapes text for XML character data and attribute values. */
export function escapeXml(value: string): string {
  return escapeHtml(value)
}

/** Wraps a value in CDATA, neutralising any embedded terminator. */
export function cdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`
}
