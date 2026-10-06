import { HeroActions } from "./hero-actions"
import { HeroBadge } from "./hero-badge"
import { HeroStage } from "./hero-stage"
import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"

export function Hero() {
  const ix = macwallMarketingCopy.interact

  return (
    <MarketingSection className="relative isolate overflow-hidden px-4 pt-14 pb-12 sm:px-8 sm:pt-20 sm:pb-16 lg:pt-24">
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <HeroBadge />

        <h1 className="mt-6 text-[2.75rem] leading-[1.02] font-normal tracking-tighter text-balance sm:text-6xl md:text-7xl">
          {ix.title}{" "}
          <span className="text-muted-foreground md:block">{ix.titleMuted}</span>
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed tracking-tight text-pretty text-muted-foreground sm:text-lg">
          {ix.heroLead}
        </p>

        <div className="mt-8 w-full">
          <HeroActions />
        </div>
      </div>

      <div className="mt-14 sm:mt-16">
        <HeroStage />
      </div>
    </MarketingSection>
  )
}
