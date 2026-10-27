/**
 * `Accept: text/markdown` content negotiation for page URLs.
 *
 * Every public page has a Markdown twin at `<path>.md` (`/index.md` for the
 * home page). An agent that asks for Markdown on the page URL itself gets the
 * twin instead of HTML. Kept dependency-free so the Worker entry and the Next
 * proxy can both import it without pulling in page content.
 */

/** Paths that never have a Markdown twin. */
const EXCLUDED_PREFIXES = [
  "/api/",
  "/_next/",
  "/admin",
  "/md/",
  "/auth",
  "/r/",
  "/.well-known/",
]

function qualityOf(accept: string, type: string): number {
  let best = 0
  for (const part of accept.split(",")) {
    const [mediaRange, ...params] = part.trim().toLowerCase().split(";")
    if (mediaRange.trim() !== type) continue
    const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="))
    const value = q ? Number(q.slice(2)) : 1
    if (Number.isFinite(value) && value > best) best = value
  }
  return best
}

/** True when the client ranks `text/markdown` above `text/html`. */
export function prefersMarkdown(accept: string | null | undefined): boolean {
  if (!accept) return false
  const markdown = qualityOf(accept, "text/markdown")
  return markdown > 0 && markdown > qualityOf(accept, "text/html")
}

/** The twin's public path for a page path, or null when the path has none. */
export function negotiatedMarkdownPath(pathname: string): string | null {
  if (EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix)))
    return null
  // Files (`.md`, `.xml`, `.txt`, images) are already a representation.
  if (/\.[a-z0-9]+$/i.test(pathname)) return null
  const trimmed = pathname.replace(/\/+$/, "")
  return trimmed === "" ? "/index.md" : `${trimmed}.md`
}
