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

/** Every `GALLERY_PAGE_JUMP`th page is linked from every page. */
export const GALLERY_PAGE_JUMP = 10

/**
 * First, last, two either side of the current page, and every 10th page;
 * null marks a gap. With the jumps no page is more than four clicks from
 * the first (page 25 of 48: 1 → 20 → 22 → 24 → 25), where it took twelve.
 */
export function galleryPageNumbers(
  current: number,
  total: number
): (number | null)[] {
  const keep = new Set([1, total])
  for (let n = current - 2; n <= current + 2; n += 1)
    if (n >= 1 && n <= total) keep.add(n)
  for (let n = GALLERY_PAGE_JUMP; n < total; n += GALLERY_PAGE_JUMP) keep.add(n)
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
