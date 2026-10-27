import { macwall } from "@/lib/macwall-site"

/** Same page size as the gallery's first render and "Show more". */
export const GALLERY_PAGE_SIZE = 24

export function galleryPageCount(total: number): number {
  return Math.max(1, Math.ceil(total / GALLERY_PAGE_SIZE))
}

/** Page 1 is the gallery itself; later pages live under `/page/{n}`. */
export function galleryPageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}/page/${page}`
}

/** First, last, and two either side of the current page; null marks a gap. */
export function galleryPageNumbers(
  current: number,
  total: number
): (number | null)[] {
  const keep = new Set([1, total])
  for (let n = current - 2; n <= current + 2; n += 1)
    if (n >= 1 && n <= total) keep.add(n)
  const sorted = [...keep].sort((a, b) => a - b)
  const out: (number | null)[] = []
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push(null)
    out.push(n)
  })
  return out
}

/** Parses `/page/{n}`; null for page 1, junk, or anything past the end. */
export function parseGalleryPage(raw: string, total: number): number | null {
  if (!/^\d+$/.test(raw)) return null
  const page = Number(raw)
  if (page < 2 || page > galleryPageCount(total)) return null
  return page
}

export function galleryPageCopy(input: {
  label: string
  page: number
  totalPages: number
  total: number
  firstName?: string
}): { title: string; description: string } {
  const { label, page, totalPages, total } = input
  const start = (page - 1) * GALLERY_PAGE_SIZE + 1
  const end = Math.min(page * GALLERY_PAGE_SIZE, total)
  const describe = (firstName?: string) =>
    `Page ${page} of ${totalPages}: ${label.toLowerCase()} ${start} to ${end} of ${total} in the ${macwall.name} catalog${
      firstName ? `, starting with ${firstName}` : ""
    }. Each one is a video loop you can preview and set on your Mac.`
  const withName = describe(input.firstName)
  return {
    title: `${label} for Mac, Page ${page}`,
    description: withName.length <= 160 ? withName : describe(),
  }
}
