import { existsSync } from "node:fs"
import path from "node:path"
import { unstable_cache } from "next/cache"
import {
  MARKETING_CATALOG_REVALIDATE_SECONDS,
  MARKETING_HOME_PICK_CACHE_TAG,
} from "@/lib/marketing-cache"
import type { MarketingCatalogSlide } from "@/lib/marketing-catalog-slides"
import {
  catalogRowToMarketingSlide,
  fetchMarketingCatalogRows,
  pickMarketingHomePickRows,
} from "@/lib/marketing-catalog-selection"
import { mergeMarketingHomePickSlides } from "@/lib/marketing-home-picks-fallback"

function preferVendoredPickThumb(
  slide: MarketingCatalogSlide
): MarketingCatalogSlide {
  const localFile = path.join(
    process.cwd(),
    "public/marketing-supabase-thumbs",
    `${slide.id}.jpg`
  )
  if (!existsSync(localFile)) return slide

  const localThumb = `/marketing-supabase-thumbs/${slide.id}.jpg`
  return {
    ...slide,
    thumbPath: localThumb,
    thumbFallbackPath: slide.thumbFallbackPath ?? slide.thumbPath,
  }
}

async function fetchMarketingHomePickSlidesFromSupabase(): Promise<
  MarketingCatalogSlide[]
> {
  const rows = await fetchMarketingCatalogRows()
  const picked = pickMarketingHomePickRows(rows)
    .map(catalogRowToMarketingSlide)
    .map(preferVendoredPickThumb)
  return mergeMarketingHomePickSlides(picked)
}

const getCachedMarketingHomePickSlides = unstable_cache(
  async () => {
    try {
      return await fetchMarketingHomePickSlidesFromSupabase()
    } catch {
      return mergeMarketingHomePickSlides([])
    }
  },
  ["marketing-home-pick-wallpapers-v2"],
  {
    revalidate: MARKETING_CATALOG_REVALIDATE_SECONDS,
    tags: [MARKETING_HOME_PICK_CACHE_TAG],
  }
)

/** Top 6 catalog wallpapers for the desktop demo “MacWall's Pick” row (not used elsewhere on the site). */
export async function fetchMarketingHomePickSlides(): Promise<
  MarketingCatalogSlide[]
> {
  return getCachedMarketingHomePickSlides()
}