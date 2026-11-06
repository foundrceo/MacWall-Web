import { blogArticles, getBlogArticle } from "@/lib/blog"
import type { BlogArticle, SeoContentPage } from "@/lib/content/types"
import { docsPages } from "@/lib/docs/pages"
import { learnPages } from "@/lib/learn/pages"

/**
 * Related reading for a blog post, scored by how many search terms it shares
 * with the post (its keywords and title), across the blog, Learn and Docs.
 * Terms most pages share ("wallpaper", "mac") weigh almost nothing; specific
 * ones ("lock", "battery", "resolution") carry the match, and a whole
 * keyword phrase in common counts extra.
 */

/** A Docs or Learn page shown under a post's related articles. */
export type RelatedGuide = {
  kind: "Docs" | "Learn"
  title: string
  description: string
  pathname: string
}

/** Grammar words: never part of a term. */
const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "can",
  "do",
  "does",
  "for",
  "from",
  "how",
  "i",
  "in",
  "is",
  "it",
  "my",
  "of",
  "on",
  "or",
  "the",
  "to",
  "vs",
  "what",
  "when",
  "why",
  "with",
  "you",
  "your",
])

/**
 * On nearly every page here, or brand words that say nothing about the
 * topic: not terms on their own, but kept inside pairs ("lock screen").
 */
const GENERIC_WORDS = new Set([
  "mac",
  "macos",
  "macwall",
  "app",
  "apps",
  "pro",
  "guide",
  "best",
  "free",
  "every",
  "one",
  "per",
  "screen",
])

type Scorable = Pick<
  SeoContentPage,
  "slug" | "pathname" | "title" | "headline" | "keywords"
>

function words(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1 && !STOPWORDS.has(word))
}

/**
 * Specific single words and adjacent pairs ("lock screen", "screen saver")
 * from the title, headline and keywords.
 */
function terms(page: Scorable): Set<string> {
  const result = new Set<string>()
  for (const text of [page.title, page.headline, ...page.keywords]) {
    const list = words(text)
    list.forEach((word, index) => {
      if (!GENERIC_WORDS.has(word)) result.add(word)
      const previous = list[index - 1]
      if (previous && !(GENERIC_WORDS.has(previous) && GENERIC_WORDS.has(word)))
        result.add(`${previous} ${word}`)
    })
  }
  return result
}

function phrases(page: Scorable): Set<string> {
  return new Set(page.keywords.map((keyword) => keyword.trim().toLowerCase()))
}

type Indexed = { page: Scorable; terms: Set<string>; phrases: Set<string> }

type Corpus = { entries: Indexed[]; termWeight: Map<string, number> }

let cachedCorpus: Corpus | null = null

/** Built on first use (the page lists are static), not at import time. */
function corpus(): Corpus {
  if (cachedCorpus) return cachedCorpus
  const entries = [...blogArticles, ...docsPages, ...learnPages].map(
    (page) => ({ page, terms: terms(page), phrases: phrases(page) })
  )
  const frequency = new Map<string, number>()
  for (const { terms: pageTerms } of entries) {
    for (const term of pageTerms) {
      frequency.set(term, (frequency.get(term) ?? 0) + 1)
    }
  }
  // ln(N / document frequency): rare terms carry the match.
  const termWeight = new Map<string, number>()
  for (const [term, count] of frequency) {
    termWeight.set(term, Math.log(entries.length / count))
  }
  cachedCorpus = { entries, termWeight }
  return cachedCorpus
}

const PHRASE_BONUS = 2

function overlapScore(a: Indexed, b: Indexed): number {
  const { termWeight } = corpus()
  let score = 0
  for (const term of a.terms) {
    if (b.terms.has(term)) score += termWeight.get(term) ?? 0
  }
  for (const phrase of a.phrases) {
    if (b.phrases.has(phrase)) score += PHRASE_BONUS
  }
  return score
}

function indexedFor(pathname: string): Indexed | undefined {
  return corpus().entries.find((entry) => entry.page.pathname === pathname)
}

/** Pages in `pool` ranked by overlap with `current`; ties keep pool order. */
function ranked<T extends Scorable>(
  current: Indexed,
  pool: readonly T[]
): { page: T; score: number }[] {
  return pool
    .filter((page) => page.pathname !== current.page.pathname)
    .map((page, order) => {
      const entry = indexedFor(page.pathname)
      return { page, order, score: entry ? overlapScore(current, entry) : 0 }
    })
    .sort((a, b) => b.score - a.score || a.order - b.order)
}

/**
 * Blog posts that share the most terms with this one. Posts with nothing in
 * common fall back to the blog's own order (pillar guides first).
 */
export function getRelatedBlogArticles(
  currentSlug: string,
  limit = 3
): BlogArticle[] {
  const current = getBlogArticle(currentSlug)
  const entry = current ? indexedFor(current.pathname) : undefined
  if (!entry) return []
  return ranked(entry, blogArticles)
    .slice(0, limit)
    .map(({ page }) => page)
}

/** Docs and Learn pages on the same subject, best match first. */
export function getRelatedGuides(
  currentSlug: string,
  limit = 3
): RelatedGuide[] {
  const current = getBlogArticle(currentSlug)
  const entry = current ? indexedFor(current.pathname) : undefined
  if (!entry) return []

  const pool = [
    ...docsPages.map((page) => ({ ...page, kind: "Docs" as const })),
    ...learnPages.map((page) => ({ ...page, kind: "Learn" as const })),
  ]
  return ranked(entry, pool)
    .filter(({ score }) => score > PHRASE_BONUS / 2)
    .slice(0, limit)
    .map(({ page }) => ({
      kind: page.kind,
      title: page.title,
      description: page.description,
      pathname: page.pathname,
    }))
}
