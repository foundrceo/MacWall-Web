import Link from "next/link"
import WallpaperBrowseCarousel from "@/components/macwall-marketing/WallpaperBrowseCarousel"
import { MARKETING_FEATURE_CAROUSEL_FALLBACK } from "@/lib/marketing-feature-carousel-wallpapers"

/** Browse carousel feature row — copy is static; carousel uses bundled fallback wallpapers (no loading skeleton). */
export default function BrowseCarouselFeatureRow() {
  return (
    <section className="marketing-section">
      <div className="marketing-container grid items-center gap-10 md:gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
        <div className="order-1 min-w-0 lg:order-none">
          <div className="relative aspect-video overflow-hidden rounded-2xl">
            <WallpaperBrowseCarousel
              wallpapers={MARKETING_FEATURE_CAROUSEL_FALLBACK}
            />
          </div>
        </div>
        <div className="order-2 flex w-full min-w-0 flex-col justify-center lg:order-none lg:max-w-md lg:justify-self-end">
          <h2 className="text-[clamp(1.75rem,4vw,2.25rem)] leading-[1.15] font-normal tracking-[-0.02em] text-foreground">
            Browse 1,000+ wallpapers
          </h2>
          <p className="mt-4 max-w-[36rem] text-[16px] leading-[1.55] text-foreground/70 sm:text-[17px]">
            Scroll a curated cloud catalog across every genre — nature, space,
            anime, sci-fi, and more. Pick one and it becomes your desktop
            background instantly — a seamless, effortless transform of your
            workspace.
          </p>
          <p className="mt-5">
            <Link href="/wallpapers" className="marketing-inline-link">
              Open the full gallery
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
