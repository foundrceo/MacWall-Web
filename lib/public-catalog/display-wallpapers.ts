import "server-only"

import { listPublicWallpapersForCollections } from "@/lib/public-catalog/fetch"
import {
  buildDisplayIndex,
  buildDisplayPage,
  buildMacbookHub,
  displayPageDef,
  type DisplayIndexData,
  type DisplayPageData,
  type MacbookHubData,
} from "@/lib/seo/display-pages"

/** `/page/{n}` as a number; null for page 1, junk, or a leading zero. */
function parsePageNumber(raw: string): number | null {
  if (!/^[1-9]\d*$/.test(raw)) return null
  const page = Number(raw)
  return page >= 2 ? page : null
}

/** A display page built from the cached catalog index; null for unknown slugs. */
export async function loadDisplayPage(
  slug: string
): Promise<DisplayPageData | null> {
  const def = displayPageDef(slug)
  if (!def) return null
  const catalog = await listPublicWallpapersForCollections()
  return buildDisplayPage(def, catalog)
}

/** `/wallpapers/display/{slug}/page/{n}`; null when the page doesn't exist. */
export async function loadDisplayPageNumber(
  slug: string,
  rawPage: string
): Promise<DisplayPageData | null> {
  const def = displayPageDef(slug)
  const page = parsePageNumber(rawPage)
  if (!def?.paginate || !page) return null
  const catalog = await listPublicWallpapersForCollections()
  return buildDisplayPage(def, catalog, page)
}

/** `/wallpapers/macbook`, or `/wallpapers/macbook/page/{n}` when `rawPage` is given. */
export async function loadMacbookHub(
  rawPage?: string
): Promise<MacbookHubData | null> {
  const page = rawPage === undefined ? 1 : parsePageNumber(rawPage)
  if (!page) return null
  const catalog = await listPublicWallpapersForCollections()
  return buildMacbookHub(catalog, page)
}

/**
 * `/wallpapers/display`. The index is mostly Apple's specs, so a catalog
 * outage drops the counts and covers instead of failing the page.
 */
export async function loadDisplayIndex(): Promise<DisplayIndexData> {
  const catalog = await listPublicWallpapersForCollections().catch(
    (error: unknown) => {
      console.error("[display index] catalog unavailable", error)
      return null
    }
  )
  return buildDisplayIndex(catalog)
}
