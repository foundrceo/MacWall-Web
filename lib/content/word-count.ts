import type { ContentBlock, ContentFaq } from "@/lib/content/types"

/**
 * Words a reader sees in a content page body: paragraphs, headings, list
 * items, table cells and captions, media captions and the FAQ. Inline
 * Markdown is reduced to its visible text first, so `[label](/path)` counts
 * as "label" and link targets never inflate the total.
 */

const WORDS_PER_MINUTE = 220

function visibleText(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)\s]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
}

/** Whitespace-separated tokens that contain a letter or digit. */
export function countWords(text: string): number {
  return visibleText(text)
    .split(/\s+/)
    .filter((token) => /[\p{L}\p{N}]/u.test(token)).length
}

function blockText(block: ContentBlock): string[] {
  switch (block.type) {
    case "p":
    case "h2":
    case "h3":
      return [block.text]
    case "ul":
    case "ol":
      return block.items
    case "table":
      return [...block.columns, ...block.rows.flat(), block.caption ?? ""]
    case "image":
      return [block.caption ?? ""]
    case "video":
      return [block.caption]
    default: {
      const exhaustive: never = block
      return exhaustive
    }
  }
}

export function contentWordCount(
  sections: readonly ContentBlock[],
  faq: readonly ContentFaq[] = []
): number {
  const texts = [
    ...sections.flatMap(blockText),
    ...faq.flatMap((item) => [item.question, item.answer]),
  ]
  return texts.reduce((total, text) => total + countWords(text), 0)
}

/** Minutes to read `words` at 220 words a minute, never below 1. */
export function readMinutesForWords(words: number): number {
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}
