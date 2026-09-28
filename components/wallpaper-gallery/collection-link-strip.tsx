import Link from "next/link"
import { GALLERY_CHIP_CLASS } from "@/lib/public-catalog/chrome"
import { WALLPAPER_SECTION_SERIF_HEADING_CLASS } from "@/lib/public-catalog/typography"
import {
  WALLPAPER_COLLECTIONS_HUB_PATH,
  wallpaperCollectionPath,
  type WallpaperCollection,
} from "@/lib/seo/wallpaper-collections"

/** Crawlable chip row linking gallery surfaces to topic collections. */
export function CollectionLinkStrip({
  title,
  collections,
}: Readonly<{
  title: string
  collections: readonly WallpaperCollection[]
}>) {
  if (collections.length === 0) return null

  return (
    <nav
      aria-label={title}
      className="border-t border-dashed border-border px-4 py-10 md:px-6"
    >
      <h2 className={WALLPAPER_SECTION_SERIF_HEADING_CLASS}>{title}</h2>
      <ul className="mt-5 flex flex-wrap gap-2.5">
        {collections.map((entry) => (
          <li key={entry.slug}>
            <Link
              href={wallpaperCollectionPath(entry.slug)}
              className={GALLERY_CHIP_CLASS}
            >
              {entry.name} wallpapers
            </Link>
          </li>
        ))}
        <li>
          <Link
            href={WALLPAPER_COLLECTIONS_HUB_PATH}
            className={GALLERY_CHIP_CLASS}
          >
            All collections
          </Link>
        </li>
      </ul>
    </nav>
  )
}
