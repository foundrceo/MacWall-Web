import Image from "next/image"
import BrowseCarouselFeatureRow from "@/components/macwall-marketing/BrowseCarouselFeatureRow"
import LockScreenFeatureVideo from "@/components/macwall-marketing/LockScreenFeatureVideo"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"

/** Three alternating feature rows — copy + media with consistent rhythm. */
export default function FeaturesSection() {
  const ls = macwallExactCopy.lockScreen
  const native = macwallExactCopy.nativeMac

  return (
    <div id="features" className="bg-surface-elevated">
      <section className="marketing-section">
        <div className="marketing-container grid items-center gap-10 md:gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="order-2 flex w-full min-w-0 flex-col justify-center lg:order-none lg:max-w-md">
            <h2 className="text-[clamp(1.75rem,4vw,2.25rem)] leading-[1.15] font-normal tracking-[-0.02em] text-foreground">
              {ls.title}
            </h2>
            <p className="mt-4 max-w-[36rem] text-[16px] leading-[1.55] text-foreground/70 sm:text-[17px]">
              {ls.strong} {ls.rest}
            </p>
          </div>
          <div className="order-1 min-w-0 lg:order-none">
            <LockScreenFeatureVideo ariaLabel={ls.title} />
          </div>
        </div>
      </section>

      <BrowseCarouselFeatureRow />

      <section className="marketing-section">
        <div className="marketing-container grid items-center gap-10 md:gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="order-2 flex w-full min-w-0 flex-col justify-center lg:order-none lg:max-w-md">
            <h2 className="text-[clamp(1.75rem,4vw,2.25rem)] leading-[1.15] font-normal tracking-[-0.02em] text-foreground">
              {native.title}
            </h2>
            <p className="mt-4 max-w-[36rem] text-[16px] leading-[1.55] text-foreground/70 sm:text-[17px]">
              {native.lead}
            </p>
            <ul className="mt-5 space-y-4">
              {native.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="grid grid-cols-[0.375rem_1fr] items-start gap-x-3 text-[15px] leading-[1.55] text-foreground/70 sm:text-[16px]"
                >
                  <span
                    className="mt-[0.65em] size-1.5 rounded-full bg-foreground/35"
                    aria-hidden
                  />
                  <span>{bullet}</span>
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
