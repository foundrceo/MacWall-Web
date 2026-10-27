import Link from "next/link"
import {
  GALLERY_CHIP_CLASS,
  GALLERY_TEXT_TERTIARY_CLASS,
} from "@/lib/public-catalog/chrome"
import { galleryPageHref, galleryPageNumbers } from "@/lib/seo/gallery-pages"
import { cn } from "@/lib/utils"

/**
 * Plain links to every page of a gallery. "Show more" loads pages with script;
 * this is the crawlable path to wallpapers past the first page.
 */
export function GalleryPagination({
  basePath,
  current,
  totalPages,
  label,
}: Readonly<{
  basePath: string
  current: number
  totalPages: number
  label: string
}>) {
  if (totalPages <= 1) return null
  const numbers = galleryPageNumbers(current, totalPages)
  return (
    <nav aria-label={label} className="mt-10 flex flex-col items-center gap-3">
      <p className={cn("text-[13px]", GALLERY_TEXT_TERTIARY_CLASS)}>
        Page {current} of {totalPages}
      </p>
      <ul className="flex flex-wrap justify-center gap-2">
        {current > 1 ? (
          <li>
            <Link
              href={galleryPageHref(basePath, current - 1)}
              rel="prev"
              className={GALLERY_CHIP_CLASS}
            >
              Previous
            </Link>
          </li>
        ) : null}
        {numbers.map((n, i) =>
          n === null ? (
            <li
              key={`gap-${i}`}
              aria-hidden
              className={cn("px-1 text-[13px]", GALLERY_TEXT_TERTIARY_CLASS)}
            >
              …
            </li>
          ) : (
            <li key={n}>
              <Link
                href={galleryPageHref(basePath, n)}
                aria-current={n === current ? "page" : undefined}
                className={cn(
                  GALLERY_CHIP_CLASS,
                  n === current && "bg-white text-black hover:bg-white"
                )}
              >
                {n}
              </Link>
            </li>
          )
        )}
        {current < totalPages ? (
          <li>
            <Link
              href={galleryPageHref(basePath, current + 1)}
              rel="next"
              className={GALLERY_CHIP_CLASS}
            >
              Next
            </Link>
          </li>
        ) : null}
      </ul>
    </nav>
  )
}
