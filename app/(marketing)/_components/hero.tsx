import { HeroActions } from "./hero-actions"
import { HeroBadge } from "./hero-badge"
import { HeroStage } from "./hero-stage"
import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"

export function Hero() {
  const ix = macwallMarketingCopy.interact

  return (
    <MarketingSection className="relative isolate pt-14 pb-20 sm:pt-20 lg:pt-24 lg:pb-24">
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <div className="hero-rise">
          <HeroBadge />
        </div>

        <h1 className="hero-rise mt-6 text-[2.75rem] leading-[1.02] font-normal tracking-tighter text-balance text-ink [--rise-delay:80ms] sm:text-6xl md:text-7xl">
          {ix.title}{" "}
          <span className="text-ink-3 md:block">{ix.titleMuted}</span>
        </h1>

        <p className="hero-rise mt-5 max-w-2xl text-base leading-relaxed tracking-tight text-pretty text-ink-2 [--rise-delay:160ms] sm:text-lg">
          {ix.heroLead}
        </p>

        <div className="hero-rise mt-8 w-full [--rise-delay:240ms]">
          <HeroActions />
        </div>
      </div>

      <div className="hero-rise mt-14 [--rise-delay:320ms] sm:mt-16">
        <HeroStage />
      </div>
    </MarketingSection>
  )
}
