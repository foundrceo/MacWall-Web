import HeroSectionActions from "@/components/macwall-marketing/HeroSectionActions"
import { HeroWalkthroughVideo } from "@/components/macwall-marketing/hero-walkthrough-video"
import { LandingPillars } from "@/components/macwall-marketing/landing-pillars"
import { LandingSurface } from "@/components/macwall-marketing/landing-surface"
import {
  landingBelow,
  landingH1,
  landingH1Muted,
  landingLead,
} from "@/components/macwall-marketing/landing-type"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { cn } from "@/lib/utils"

export default function HeroSection() {
  const ix = macwallMarketingCopy.interact
  const landing = macwallMarketingCopy.landing

  return (
    <section className="relative overflow-x-clip bg-background pt-8 pb-0 sm:pt-10 md:pt-14 lg:pt-16">
      <div className="marketing-container">
        <div className="flex min-w-0 flex-col gap-8 md:gap-12">
          <div className="flex min-w-0 flex-col gap-6 sm:gap-8">
            <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
              <h1 className={landingH1}>
                {ix.title}
                <span className={landingH1Muted}>{ix.titleMuted}</span>
              </h1>
              <p className={cn(landingLead, "max-w-3xl")}>{ix.heroLead}</p>
            </div>
            <HeroSectionActions />
          </div>
          <LandingPillars />
        </div>

        <div className={cn(landingBelow, "overflow-hidden rounded-2xl bg-[#111]")}>
          <HeroWalkthroughVideo />
        </div>

        <div className="py-12 sm:py-16 md:py-20">
          <p className="text-center text-[13px] leading-5 text-landing-muted">
            {landing.catalogEyebrow}
          </p>
          <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
            {landing.genres.map((label) => (
              <li key={label} className="min-w-0">
                <LandingSurface
                  className="flex min-h-[4rem] items-center justify-center rounded-none px-2.5 py-3 sm:min-h-[4.5rem] sm:px-3 sm:py-4 md:min-h-[5.5rem]"
                >
                  <span className="text-center text-[14px] leading-5 font-normal text-white sm:text-[16px] sm:leading-6">
                    {label}
                  </span>
                </LandingSurface>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
