import {
  marketingLockScreenVideoSources,
  marketingWalkthroughVideoSources,
} from "@/lib/marketing-assets-urls"

/** Preload above-the-fold marketing clips so reserved aspect boxes fill without a late jump. */
export function HeroVideoPreload() {
  const preloadUrls = [
    ...marketingWalkthroughVideoSources(),
    ...marketingLockScreenVideoSources(),
  ].filter((url, index, all) => all.indexOf(url) === index)

  return (
    <>
      {preloadUrls.map((href) => (
        <link
          key={href}
          rel="preload"
          href={href}
          as="video"
          fetchPriority="high"
        />
      ))}
    </>
  )
}
