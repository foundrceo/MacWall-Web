import Image from "next/image"
import { TrackedLink } from "@/components/analytics/tracked-link"
import {
  ghostCtaHeroClass,
  landingEyebrow,
  landingH2,
  landingH2Muted,
  landingLead,
  landingSectionY,
  pillCtaHeroClass,
} from "@/components/macwall-marketing/landing-type"
import { macwall } from "@/lib/macwall-site"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { cn } from "@/lib/utils"

export default function JoinCommunitySection() {
  const landing = macwallMarketingCopy.landing

  return (
    <section className={landingSectionY}>
      <div className="marketing-container grid items-center gap-8 md:gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="min-w-0">
          <p className={landingEyebrow}>{landing.communityEyebrow}</p>
          <h2 className={cn(landingH2, "mt-2")}>
            {landing.communityTitle}
            <span className={landingH2Muted}>{landing.communityMuted}</span>
          </h2>
          <p className={cn(landingLead, "mt-5")}>{landing.communityLead}</p>
          <div className="mt-8 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            <TrackedLink
              href={macwall.discordInvite}
              eventName="cta_click"
              metadata={{ location: "join_community_discord" }}
              external
              className={cn(pillCtaHeroClass, "w-full justify-center sm:w-auto")}
            >
              Join Discord
            </TrackedLink>
            <a
              href={macwall.reelRefundTiktokURL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(ghostCtaHeroClass, "w-full justify-center sm:w-auto")}
            >
              Follow on TikTok
            </a>
          </div>
        </div>

        <div className="relative min-w-0 overflow-hidden rounded-2xl bg-[#111]">
          <Image
            alt={`${macwall.name} live wallpapers on a MacBook`}
            src="/Img.png"
            width={1024}
            height={683}
            className="h-auto w-full object-cover"
            sizes="(max-width: 896px) 100vw, 560px"
          />
        </div>
      </div>
    </section>
  )
}
