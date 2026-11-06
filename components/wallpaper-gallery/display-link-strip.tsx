import Link from "next/link"
import { GALLERY_CHIP_CLASS } from "@/lib/public-catalog/chrome"
import { WALLPAPER_SECTION_SERIF_HEADING_CLASS } from "@/lib/public-catalog/typography"
import { displayRelatedLinks } from "@/lib/seo/display-pages"

/**
 * "By Mac display" chip row: links the gallery hubs to the MacBook hub, the
 * display pages (which pick loops by resolution for each Mac screen) and the
 * index of every Mac display.
 */
export function DisplayLinkStrip({
  title = "By Mac display",
}: Readonly<{ title?: string }>) {
  const links = displayRelatedLinks()
  if (links.length === 0) return null

  return (
    <nav aria-label={title} className="px-4 py-10 md:px-6">
      <h2 className={WALLPAPER_SECTION_SERIF_HEADING_CLASS}>{title}</h2>
      <ul className="mt-5 flex flex-wrap gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              prefetch={false}
              className={GALLERY_CHIP_CLASS}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
