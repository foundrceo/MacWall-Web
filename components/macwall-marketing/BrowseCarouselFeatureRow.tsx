import WallpaperBrowseCarousel from "@/components/macwall-marketing/WallpaperBrowseCarousel"
import { fetchMarketingFeatureCarouselWallpapers } from "@/lib/fetch-marketing-feature-carousel-wallpapers"

export default async function BrowseCarouselFeatureRow() {
  const carouselWallpapers = await fetchMarketingFeatureCarouselWallpapers()

  return (
    <section className="py-12 md:py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 md:gap-10 lg:grid-cols-[1fr_minmax(0,360px)] lg:gap-14">
        <div className="order-2 lg:order-none lg:col-start-2">
          <div className="w-full max-w-[360px]">
            <h2 className="text-[clamp(1.625rem,2.8vw,2.25rem)] font-normal leading-[1.2] tracking-[-0.02em]">
              Browse 1,000+ wallpapers
            </h2>
            <p className="mt-4 text-[17px] leading-[1.55] text-foreground/70">
              Scroll a curated cloud catalog across every genre — nature, space,
              anime, sci-fi, and more. Pick one and it becomes your desktop
              background instantly with a single click.
            </p>
          </div>
        </div>
        <div className="order-1 min-w-0 lg:order-none lg:col-start-1 lg:row-start-1">
          <div className="relative aspect-video overflow-hidden rounded-2xl">
            <WallpaperBrowseCarousel wallpapers={carouselWallpapers} />
          </div>
        </div>
      </div>
    </section>
  )
}
