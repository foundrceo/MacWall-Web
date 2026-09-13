import Link from "next/link"
import WallpaperBrowseCarousel from "@/components/macwall-marketing/WallpaperBrowseCarousel"
import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import {
  landingBody,
  landingH2,
  landingPad,
} from "@/components/macwall-marketing/landing-type"
import { MARKETING_FEATURE_CAROUSEL_FALLBACK } from "@/lib/marketing-feature-carousel-wallpapers"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { cn } from "@/lib/utils"

export function Catalog() {
  const landing = macwallMarketingCopy.landing

  return (
    <MarketingSection>
      <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-dashed lg:divide-border">
        <div className="min-h-[14rem] bg-card sm:min-h-[16rem]">
          <WallpaperBrowseCarousel
            wallpapers={MARKETING_FEATURE_CAROUSEL_FALLBACK}
          />
        </div>
        <div
          className={cn(
            landingPad,
            "flex flex-col justify-center py-10 md:py-14 lg:py-16"
          )}
        >
          <h2 className={landingH2}>{landing.browseTitle}</h2>
          <p className={cn(landingBody, "mt-4 max-w-md")}>
            {landing.browseLead}
          </p>
          <p className="mt-6">
            <Link href="/wallpapers" className="marketing-inline-link">
              {landing.browseLink}
            </Link>
          </p>
        </div>
      </div>
    </MarketingSection>
  )
}
