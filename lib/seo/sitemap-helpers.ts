import type { ContentBlock } from "@/lib/content/types"

/**
 * Pure helpers for `app/sitemap.ts`: content dates, hub dates and image
 * URLs. Kept free of catalog reads so they can be tested on their own.
 */

/** A content date ("2026-10-24" or full ISO 8601); undefined when missing or invalid. */
export function parseContentDate(
  value: string | Date | null | undefined
): Date | undefined {
  if (value instanceof Date)
    return Number.isFinite(value.getTime()) ? value : undefined
  if (typeof value !== "string" || !value.trim()) return undefined
  const parsed = Date.parse(value.trim())
  return Number.isFinite(parsed) ? new Date(parsed) : undefined
}

/** The newest of `dates`, skipping missing ones. */
export function newestDate(
  dates: Iterable<Date | undefined>
): Date | undefined {
  let newest: Date | undefined
  for (const date of dates) {
    if (date && (!newest || date.getTime() > newest.getTime())) newest = date
  }
  return newest
}

/** Records `date` for `path`, keeping whichever of the two is newer. */
export function noteDate(
  dates: Map<string, Date>,
  path: string,
  date: Date | undefined
): void {
  const newest = newestDate([dates.get(path), date])
  if (newest) dates.set(path, newest)
}

/** A listing page whose content changes whenever one of its children does. */
export type SitemapHub = {
  path: string
  isChild: (path: string) => boolean
}

/**
 * Gives each listed hub the newest date among its own and its listed
 * children's, so `/blog` moves when a post is edited. Children are leaf
 * pages: a hub is never another hub's child.
 */
export function applyHubDates(
  dates: Map<string, Date>,
  paths: readonly string[],
  hubs: readonly SitemapHub[]
): void {
  const listed = new Set(paths)
  for (const hub of hubs) {
    if (!listed.has(hub.path)) continue
    const children = paths.filter(
      (path) => path !== hub.path && hub.isChild(path)
    )
    noteDate(
      dates,
      hub.path,
      newestDate(children.map((path) => dates.get(path)))
    )
  }
}

/** Absolute URL for a site-relative path ("/blog/thumbs/x.jpg"); absolute URLs pass through. */
export function absoluteSiteUrl(origin: string, src: string): string {
  return src.startsWith("/") ? `${origin}${src}` : src
}

/** `src` of every image block in a page body, in order. */
export function contentImageSources(
  blocks: readonly ContentBlock[] | undefined
): string[] {
  return (blocks ?? []).flatMap((block) =>
    block.type === "image" && block.src ? [block.src] : []
  )
}

/** Adds image URLs to a page's sitemap entry, once each, skipping empty ones. */
export function addImages(
  images: Map<string, string[]>,
  path: string,
  urls: Iterable<string | null | undefined>
): void {
  const list = images.get(path) ?? []
  for (const url of urls) {
    if (url && !list.includes(url)) list.push(url)
  }
  if (list.length > 0) images.set(path, list)
}
