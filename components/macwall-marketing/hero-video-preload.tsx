import { marketingWalkthroughVideoSources } from "@/lib/marketing-assets-urls"
import { MARKETING_LOCK_SCREEN_VIDEO_WEBM } from "@/lib/marketing-shell/assets"

/** Preload above-the-fold marketing clips so reserved aspect boxes fill without a late jump. */
export function HeroVideoPreload() {
  const heroSrc = marketingWalkthroughVideoSources()[0]

  return (
    <>
      {heroSrc ? (
        <link rel="preload" href={heroSrc} as="video" fetchPriority="high" />
      ) : null}
      <link
        rel="preload"
        href={MARKETING_LOCK_SCREEN_VIDEO_WEBM}
        as="video"
        fetchPriority="high"
      />
    </>
  )
}
