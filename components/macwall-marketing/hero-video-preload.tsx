import {
  marketingWalkthroughVideoPreloadUrl,
} from "@/lib/marketing-assets-urls"
import { getR2PublicBaseUrl } from "@/lib/env/catalog-storage"

/** Preload above-the-fold marketing clip + warm CDN connection. */
export function HeroVideoPreload() {
  const heroSrc = marketingWalkthroughVideoPreloadUrl()
  const cdnOrigin = (() => {
    try {
      return new URL(getR2PublicBaseUrl()).origin
    } catch {
      return null
    }
  })()

  return (
    <>
      {cdnOrigin ? (
        <>
          <link rel="preconnect" href={cdnOrigin} crossOrigin="anonymous" />
          <link rel="dns-prefetch" href={cdnOrigin} />
        </>
      ) : null}
      {heroSrc ? (
        <link
          rel="preload"
          href={heroSrc}
          as="video"
          type="video/quicktime"
          fetchPriority="high"
        />
      ) : null}
    </>
  )
}
