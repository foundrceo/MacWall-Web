import Image from "next/image"
import BrowseCarouselFeatureRow from "@/components/macwall-marketing/BrowseCarouselFeatureRow"
import LockScreenFeatureVideo from "@/components/macwall-marketing/LockScreenFeatureVideo"
import {
  landingBody,
  landingH2,
  landingSectionY,
} from "@/components/macwall-marketing/landing-type"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { cn } from "@/lib/utils"

export default function FeaturesSection() {
  const ls = macwallMarketingCopy.lockScreen
  const native = macwallMarketingCopy.nativeMac

  return (
    <div id="features">
      <section className={landingSectionY}>
        <div className="marketing-container grid items-center gap-8 md:gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="order-2 flex w-full min-w-0 flex-col justify-center lg:order-none lg:max-w-md">
            <h2 className={landingH2}>{ls.title}</h2>
            <p className={cn(landingBody, "mt-4 max-w-[36rem]")}>
              {ls.strong}
              {ls.rest ? ` ${ls.rest}` : null}
            </p>
          </div>
          <div className="order-1 min-w-0 lg:order-none">
            <div className="relative overflow-hidden rounded-2xl bg-[#111]">
              <LockScreenFeatureVideo ariaLabel={ls.title} />
            </div>
          </div>
        </div>
      </section>

      <BrowseCarouselFeatureRow />

      <section className={landingSectionY}>
        <div className="marketing-container grid items-center gap-8 md:gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="order-2 flex w-full min-w-0 flex-col justify-center lg:order-none lg:max-w-md">
            <h2 className={landingH2}>{native.title}</h2>
            <p className={cn(landingBody, "mt-4 max-w-[36rem]")}>
              {native.lead}
            </p>
            <ul className="mt-5 space-y-4">
              {native.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="grid grid-cols-[0.375rem_1fr] items-start gap-x-3 text-[15px] leading-6 text-landing-muted md:text-[16px]"
                >
                  <span
                    className="mt-[0.65em] size-1.5 rounded-full bg-white/35"
                    aria-hidden
                  />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 min-w-0 lg:order-none">
            <div className="relative overflow-hidden rounded-2xl bg-[#111]">
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
