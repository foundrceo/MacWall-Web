import Link from "next/link"
import WallpaperBrowseCarousel from "@/components/macwall-marketing/WallpaperBrowseCarousel"
import {
  MARKETING_INLINE_LINK_CLASS,
  MARKETING_SECTION_CLASS,
} from "@/lib/marketing-chrome"
import { fetchMarketingFeatureCarouselWallpapers } from "@/lib/fetch-marketing-feature-carousel-wallpapers"

export default async function BrowseCarouselFeatureRow() {
  const carouselWallpapers = await fetchMarketingFeatureCarouselWallpapers()

  return (
    <section className="py-12 md:py-20 lg:py-24">
      <div
        className={`${MARKETING_SECTION_CLASS} grid items-center gap-8 md:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)] lg:gap-14`}
      >
        <div className="order-2 min-w-0 lg:order-none lg:col-start-2">
          <div className="w-full lg:max-w-[360px]">
            <h2 className="text-[clamp(1.5rem,4vw,2.25rem)] leading-[1.2] font-normal tracking-[-0.02em]">
              Browse 1,000+ wallpapers
            </h2>
            <p className="mt-4 text-[16px] leading-[1.55] text-foreground/70 sm:text-[17px]">
              Scroll a curated cloud catalog across every genre — nature, space,
              anime, sci-fi, and more. Pick one and it becomes your desktop
              background instantly with a single click.
            </p>
            <p className="mt-4">
              <Link href="/wallpapers" className={MARKETING_INLINE_LINK_CLASS}>
                Open the full gallery
              </Link>
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
