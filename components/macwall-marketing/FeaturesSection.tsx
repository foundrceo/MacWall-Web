import Image from "next/image"
import BrowseCarouselFeatureRow from "@/components/macwall-marketing/BrowseCarouselFeatureRow"
import BrowseCarouselFeatureRowFallback from "@/components/macwall-marketing/BrowseCarouselFeatureRowFallback"
import LockScreenFeatureVideo from "@/components/macwall-marketing/LockScreenFeatureVideo"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"
import { Suspense } from "react"

/** Three alternating feature rows — Palmier layout, MacWall copy and assets. */
export default function FeaturesSection() {
  const ls = macwallExactCopy.lockScreen
  const native = macwallExactCopy.nativeMac

  return (
    <div id="features" className="bg-surface-elevated">
      <section className="marketing-section">
        <div
        className="marketing-container grid items-center gap-8 md:gap-10 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-14"
        >
          {/* Mobile: media first, then copy */}
          <div className="order-2 w-full min-w-0 lg:order-none lg:max-w-[360px]">
            <h2 className="text-[clamp(1.5rem,4vw,2.25rem)] leading-[1.2] font-normal tracking-[-0.02em]">
              {ls.title}
            </h2>
            <p className="mt-4 text-[16px] leading-[1.55] text-foreground/70 sm:text-[17px]">
              {ls.strong} {ls.rest}
            </p>
          </div>
          <div className="order-1 min-w-0 lg:order-none">
            <LockScreenFeatureVideo ariaLabel={ls.title} />
          </div>
        </div>
      </section>

      <Suspense fallback={<BrowseCarouselFeatureRowFallback />}>
        <BrowseCarouselFeatureRow />
      </Suspense>

      <section className="marketing-section">
        <div
        className="marketing-container grid items-center gap-8 md:gap-10 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-14"
        >
          <div className="order-2 w-full min-w-0 lg:order-none lg:max-w-[360px]">
            <h2 className="text-[clamp(1.5rem,4vw,2.25rem)] leading-[1.2] font-normal tracking-[-0.02em]">
              {native.title}
            </h2>
            <p className="mt-4 text-[16px] leading-[1.55] text-foreground/70 sm:text-[17px]">
              {native.lead}
            </p>
            <ul className="mt-4 space-y-3">
              {native.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex gap-3 text-[15px] leading-[1.5] text-foreground/70 sm:text-[16px]"
                >
                  <span
                    className="mt-[0.5em] size-1.5 shrink-0 rounded-full bg-foreground/35"
                    aria-hidden
                  />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 min-w-0 lg:order-none">
            <div className="relative overflow-hidden rounded-2xl">
              <Image
                alt="MacWall app settings"
                width={1440}
                height={799}
                className="h-auto w-full"
                src="/Settings.jpg"
                sizes="(max-width: 1280px) 100vw, 896px"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
