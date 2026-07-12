import MacWallMarketingWalkthroughVideo from "@/components/macwall-marketing/marketing-walkthrough-video"
import {
  MarketingCard,
  MarketingContainer,
  MarketingSection,
  SectionEyebrow,
  SectionLead,
  SectionTitle,
} from "@/components/macwall-marketing/marketing-primitives"
import { marketingWalkthroughVideoSources } from "@/lib/marketing-assets-urls"

/** “See How it works” — first video frame visible immediately, then autoplay in view. */
export default function MacWallMarketingWalkthroughSection() {
  const sources = marketingWalkthroughVideoSources()
  const preloadSrc = sources[0]

  return (
    <MarketingSection id="how-it-works" muted className="py-16 md:py-20">
      {preloadSrc ? (
        <link rel="preload" href={preloadSrc} as="video" fetchPriority="high" />
      ) : null}
      <MarketingContainer wide>
        <div className="mb-10 text-center md:mb-12">
          <SectionEyebrow className="mb-2">Walkthrough</SectionEyebrow>
          <SectionTitle
            as="h2"
            className="mx-auto max-w-[640px] text-[28px] md:text-[40px]"
          >
            See How it works
          </SectionTitle>
          <SectionLead className="mx-auto mt-5 max-w-[540px]">
            Watch how MacWall brings live wallpapers to your desktop, lets you
            customize playback settings, and stays out of the way in your menu
            bar.
          </SectionLead>
        </div>

        <MarketingCard className="overflow-hidden p-0">
          <MacWallMarketingWalkthroughVideo
            sources={sources}
            ariaLabel="MacWall app walkthrough video"
          />
        </MarketingCard>
      </MarketingContainer>
    </MarketingSection>
  )
}