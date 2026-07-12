import {
  MARKETING_CATALOG_SLIDES,
  type MarketingCatalogSlide,
} from "@/lib/marketing-catalog-slides"
import { MARKETING_HOME_PICK_WALLPAPER_COUNT } from "@/lib/marketing-catalog-selection"

/** Home “Browse by Category” grid — matches `CategoryTaxonomy.displayOrder`. */
export const MARKETING_HOME_CATEGORIES = [
  "Nature",
  "Space",
  "Anime",
  "Cars",
  "City",
  "Video Games",
  "Sci-fi",
  "Fantasy",
  "Cats",
] as const

export type MarketingHomeDemoData = {
  featured: MarketingCatalogSlide[]
  picks: MarketingCatalogSlide[]
  latest: MarketingCatalogSlide[]
  popular: MarketingCatalogSlide[]
}

/** Matches `WallpaperStore.featuredRandomCount` — hero rotation pool. */
export const MARKETING_FEATURED_RANDOM_COUNT = 6

function buildFeaturedPool(slides: MarketingCatalogSlide[]): MarketingCatalogSlide[] {
  return slides.slice(0, Math.min(MARKETING_FEATURED_RANDOM_COUNT, slides.length))
}

/** Mirrors `HomeView` row derivation (simplified for static marketing catalog). */
export function buildMarketingHomeDemoData(
  homePickSlides: MarketingCatalogSlide[]
): MarketingHomeDemoData {
  const slides = MARKETING_CATALOG_SLIDES
  const featured = buildFeaturedPool(slides)
  const featuredIds = new Set(featured.map((s) => s.id))
  const picks = homePickSlides
    .filter((s) => !featuredIds.has(s.id))
    .slice(0, MARKETING_HOME_PICK_WALLPAPER_COUNT)
  const latest = [...slides].reverse()
  const latestIds = new Set(latest.map((s) => s.id))
  const byLikes = [...slides].sort((a, b) => {
    if (b.like_count !== a.like_count) return b.like_count - a.like_count
    return a.name.localeCompare(b.name)
  })
  const popular: MarketingCatalogSlide[] = []
  const seen = new Set<string>()
  for (const w of byLikes) {
    if (popular.length >= 15) break
    if (latestIds.has(w.id)) continue
    popular.push(w)
    seen.add(w.id)
  }
  for (const w of byLikes) {
    if (popular.length >= 15) break
    if (seen.has(w.id)) continue
    popular.push(w)
    seen.add(w.id)
  }

  return {
    featured,
    picks,
    latest,
    popular: popular.length > 0 ? popular : [...slides],
  }
}

export function categoryCoverForHome(
  category: string,
  slides: MarketingCatalogSlide[]
): MarketingCatalogSlide | null {
  const match = slides.find((s) => s.category === category)
  return match ?? slides[0] ?? null
}