import "server-only"

import { listPublicWallpapersForCollections } from "@/lib/public-catalog/fetch"
import {
  buildDisplayPage,
  displayPageDef,
  type DisplayPageData,
} from "@/lib/seo/display-pages"

/** A display page built from the cached catalog index; null for unknown slugs. */
export async function loadDisplayPage(
  slug: string
): Promise<DisplayPageData | null> {
  const def = displayPageDef(slug)
  if (!def) return null
  const catalog = await listPublicWallpapersForCollections()
  return buildDisplayPage(def, catalog)
}
