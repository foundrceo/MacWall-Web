import { TrackedLink } from "@/components/analytics/tracked-link"
import Image from "next/image"
import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import {
  ghostCtaHeroClass,
  landingH2,
  landingLead,
  landingPad,
  pillCtaHeroClass,
} from "@/components/macwall-marketing/landing-type"
import { macwall } from "@/lib/macwall-site"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { cn } from "@/lib/utils"

export function Community() {
  const landing = macwallMarketingCopy.landing

  return (
    <MarketingSection>
      <div className="grid lg:grid-cols-2 lg:divide-x lg:divide-dashed lg:divide-border">
        <div
          className={cn(
            landingPad,
            "flex flex-col justify-center py-10 md:py-14 lg:py-16"
          )}
        >
          <h2 className={landingH2}>{landing.communityTitle}</h2>
          <p className={cn(landingLead, "mt-4")}>{landing.communityLead}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <TrackedLink
              href={macwall.discordInvite}
              eventName="cta_click"
              metadata={{ location: "join_community_discord" }}
              external
              className={cn(pillCtaHeroClass, "justify-center sm:w-auto")}
            >
              Join Discord
            </TrackedLink>
            <a
              href={macwall.reelRefundTiktokURL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(ghostCtaHeroClass, "justify-center sm:w-auto")}
            >
              Follow on TikTok
            </a>
          </div>
        </div>
        <div className="relative min-h-[14rem] bg-card">
          <Image
            alt={`${macwall.name} live wallpapers on a MacBook`}
            src="/Img.png"
            width={1024}
            height={683}
            className="h-full w-full object-cover"
            sizes="(max-width: 896px) 100vw, 700px"
          />
        </div>
      </div>
    </MarketingSection>
  )
}
