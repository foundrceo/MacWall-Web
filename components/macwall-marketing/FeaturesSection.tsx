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
    <div id="features">
      <section className="py-12 md:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 md:gap-10 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-14">
          <div className="w-full max-w-[360px]">
            <h2 className="text-[clamp(1.625rem,2.8vw,2.25rem)] font-normal leading-[1.2] tracking-[-0.02em]">
              {ls.title}
            </h2>
            <p className="mt-4 text-[17px] leading-[1.55] text-foreground/70">
              {ls.strong} {ls.rest}
            </p>
          </div>
          <div className="min-w-0">
            <LockScreenFeatureVideo ariaLabel={ls.title} />
          </div>
        </div>
      </section>

      <Suspense fallback={<BrowseCarouselFeatureRowFallback />}>
        <BrowseCarouselFeatureRow />
      </Suspense>

      <section className="py-12 md:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 md:gap-10 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-14">
          <div className="w-full max-w-[360px]">
            <h2 className="text-[clamp(1.625rem,2.8vw,2.25rem)] font-normal leading-[1.2] tracking-[-0.02em]">
              {native.title}
            </h2>
            <p className="mt-4 text-[17px] leading-[1.55] text-foreground/70">
              {native.lead}
            </p>
            <ul className="mt-4 space-y-3">
              {native.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex gap-3 text-[16px] leading-[1.5] text-foreground/70"
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
          <div className="min-w-0">
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
