import Link from "next/link"
import WallpaperBrowseCarousel from "@/components/macwall-marketing/WallpaperBrowseCarousel"
import {
  landingBody,
  landingH2,
  landingSectionY,
} from "@/components/macwall-marketing/landing-type"
import { MARKETING_FEATURE_CAROUSEL_FALLBACK } from "@/lib/marketing-feature-carousel-wallpapers"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { cn } from "@/lib/utils"

export default function BrowseCarouselFeatureRow() {
  const landing = macwallMarketingCopy.landing

  return (
    <section className={landingSectionY}>
      <div className="marketing-container grid items-center gap-8 md:gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
        <div className="order-1 min-w-0 lg:order-none">
          <div className="min-h-[12rem] overflow-hidden sm:min-h-[14rem] md:min-h-[16rem]">
            <WallpaperBrowseCarousel
              wallpapers={MARKETING_FEATURE_CAROUSEL_FALLBACK}
            />
          </div>
        </div>
        <div className="order-2 flex w-full min-w-0 flex-col justify-center lg:order-none lg:max-w-md lg:justify-self-end">
          <h2 className={landingH2}>{landing.browseTitle}</h2>
          <p className={cn(landingBody, "mt-4 max-w-[36rem]")}>
            {landing.browseLead}
          </p>
          <p className="mt-5">
            <Link href="/wallpapers" className="marketing-inline-link">
              {landing.browseLink}
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
