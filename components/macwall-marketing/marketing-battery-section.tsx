"use client"

import { Battery, Cpu, Monitor, Scale } from "lucide-react"
import Image from "next/image"
import {
  MarketingContainer,
  MarketingSection,
  SectionEyebrow,
  SectionTitle,
} from "@/components/macwall-marketing/marketing-primitives"
import MacWallMarketingIconCardGallery, {
  type MarketingIconCard,
} from "@/components/macwall-marketing/marketing-icon-card-gallery"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"
import { macwall } from "@/lib/macwall-site"

const batteryCards: MarketingIconCard[] = macwallExactCopy.battery.cards.map(
  (card) => ({
    ...card,
    icon: {
      violet: Monitor,
      orange: Scale,
      teal: Battery,
      blue: Cpu,
    }[card.accent],
  })
)

export default function MacWallMarketingBatterySection() {
  const bat = macwallExactCopy.battery

  return (
    <MarketingSection>
      <MarketingContainer wide>
        <div className="mb-12 text-center md:mb-16">
          <SectionEyebrow className="mb-2">{bat.kicker}</SectionEyebrow>
          <SectionTitle id="battery-section-header">{bat.title}</SectionTitle>
        </div>
        <div className="overflow-hidden rounded-[28px] bg-[#f5f5f7]">
          <Image
            alt={`${macwall.name} Settings, playback, battery, and CPU options`}
            width={1722}
            height={956}
            className="h-auto w-full"
            src="/Settings.png"
            sizes="(max-width: 1068px) 100vw, 980px"
          />
        </div>
      </MarketingContainer>

      <MacWallMarketingIconCardGallery
        cards={batteryCards}
        layout="quad"
        labelledBy="battery-section-header"
        className="mt-10 md:mt-14"
      />
    </MarketingSection>
  )
}
