import Image from "next/image"

import LockScreenFeatureVideo from "@/components/macwall-marketing/LockScreenFeatureVideo"
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
    <MarketingSection id="features">
      <div className="flex flex-col items-start gap-2 px-6 pt-10 text-left">
        <h2 className="max-w-xl text-3xl font-normal tracking-tighter md:text-5xl">
          {landing.featuresTitle}
        </h2>
        <p className="max-w-xl text-lg leading-relaxed tracking-tight text-muted-foreground">
          {landing.featuresLead}
        </p>
      </div>

      <div className="mt-10 grid border-t border-dashed border-border lg:grid-cols-2 lg:items-stretch lg:divide-x lg:divide-dashed lg:divide-border">
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
            <h2 className="text-3xl font-normal tracking-tighter md:text-4xl">
              {native.title}
            </h2>
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
            <h2 className="text-3xl font-normal tracking-tighter md:text-4xl">
              {ls.title}
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
              {ls.strong}
              {ls.rest ? ` ${ls.rest}` : null}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-dashed border-border">
        <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
          <h2 className="max-w-xl text-3xl font-normal tracking-tighter md:text-5xl">
            {landing.browseTitle}
          </h2>
          <p className="max-w-xl text-lg leading-relaxed tracking-tight text-muted-foreground">
            {landing.browseLead}
          </p>
        </div>
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
