import { marketingWalkthroughPosterUrl } from "@/lib/marketing-assets-urls"
import { getR2PublicBaseUrl } from "@/lib/env/catalog-storage"

/** Warms the CDN and fetches the hero poster. The video itself loads only once
 * the hero scrolls into view, so first paint costs one image, not a clip. */
export function HeroVideoPreload() {
  const posterSrc = marketingWalkthroughPosterUrl()
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
      <link
        rel="preload"
        href={posterSrc}
        as="image"
        fetchPriority="high"
      />
    </>
  )
}
