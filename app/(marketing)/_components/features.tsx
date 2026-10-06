import Image from "next/image"

import LockScreenFeatureVideo from "@/components/macwall-marketing/LockScreenFeatureVideo"
import { LandingSectionHeader } from "@/components/macwall-marketing/landing-section-header"
import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import { ImageStreamHero } from "@/components/ui/image-stream-hero"
import { fetchMarketingPopularStreamWallpapers } from "@/lib/fetch-marketing-feature-carousel-wallpapers"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"

const FEATURE_MEDIA_FRAME =
  "relative h-64 w-full shrink-0 overflow-hidden bg-black sm:h-72 lg:h-80"

export async function Features() {
  const landing = macwallMarketingCopy.landing
  const ls = macwallMarketingCopy.lockScreen
  const native = macwallMarketingCopy.nativeMac
  const wallpapers = await fetchMarketingPopularStreamWallpapers()
  const posters = wallpapers.slice(0, 12)
  const split = Math.ceil(posters.length / 2)
  const leftImages = posters.slice(0, split).map((item) => ({
    poster: item.posterUrl,
    video: item.videoUrl,
    videoKey: item.videoKey,
  }))
  const rightImages = posters.slice(split).map((item) => ({
    poster: item.posterUrl,
    video: item.videoUrl,
    videoKey: item.videoKey,
  }))

  return (
    <MarketingSection id="features" aria-labelledby="features-heading">
      <LandingSectionHeader
        id="features-heading"
        title={landing.featuresTitle}
        lead={landing.featuresLead}
      />

      <div className="grid grid-cols-1 border-t border-dashed border-border lg:grid-cols-2 lg:items-stretch lg:divide-x lg:divide-dashed lg:divide-border">
        <div className="flex h-full flex-col">
          <div className={FEATURE_MEDIA_FRAME}>
            <Image
              alt="MacWall Settings window"
              fill
              className="object-cover"
              src="/Settings.jpg"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-1 flex-col px-6 py-10 lg:px-8">
            <h3 className="font-display text-3xl font-normal tracking-tighter md:text-4xl">
              {native.title}
            </h3>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
              {native.lead} {native.bullets.join(". ")}.
            </p>
          </div>
        </div>

        <div className="flex h-full flex-col border-t border-dashed border-border lg:border-t-0">
          <div className={FEATURE_MEDIA_FRAME}>
            <LockScreenFeatureVideo
              ariaLabel={ls.title}
              className="h-full min-h-0 w-full"
            />
          </div>
          <div className="flex flex-1 flex-col px-6 py-10 lg:px-8">
            <h3 className="font-display text-3xl font-normal tracking-tighter md:text-4xl">
              {ls.title}
            </h3>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
              {ls.strong}
              {ls.rest ? ` ${ls.rest}` : null}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-dashed border-border">
        <LandingSectionHeader
          align="center"
          title={landing.browseTitle}
          lead={landing.browseLead}
        />
        <ImageStreamHero
          leftImages={leftImages}
          rightImages={rightImages}
          speed={20}
          axis={52}
          className="h-56 w-full bg-background sm:h-64"
        />
      </div>
    </MarketingSection>
  )
}
