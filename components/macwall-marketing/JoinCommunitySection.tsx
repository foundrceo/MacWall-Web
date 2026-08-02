import Image from "next/image"
import { TrackedLink } from "@/components/analytics/tracked-link"
import { macwall } from "@/lib/macwall-site"

export default function JoinCommunitySection() {
  return (
    <section className="marketing-section-elevated bg-background">
      <div className="marketing-container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[13px] font-medium text-marketing-muted sm:text-[14px]">
            Community
          </p>
          <h2 className="mt-3 text-[clamp(1.75rem,4vw,2.25rem)] leading-[1.15] font-normal tracking-[-0.02em] text-foreground">
            {macwall.name} is building the future of live desktops.
          </h2>
          <p className="mx-auto mt-4 max-w-[36rem] text-[16px] leading-[1.55] text-foreground/70 sm:text-[17px]">
            Join thousands of Mac users sharing setups, new drops, and tips in
            our Discord — or follow along on social for the latest wallpapers.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <TrackedLink
              href={macwall.discordInvite}
              eventName="cta_click"
              metadata={{ location: "join_community_discord" }}
              external
              className="marketing-hero-primary-btn shrink-0 px-4 py-2.5 text-[14px] sm:text-[15px]"
            >
              Join Discord
            </TrackedLink>
            <a
              href={macwall.reelRefundTiktokURL}
              target="_blank"
              rel="noopener noreferrer"
              className="marketing-hero-secondary-btn shrink-0 px-4 py-2.5 text-[14px] sm:text-[15px]"
            >
              Follow on TikTok
            </a>
          </div>
        </div>

        <div className="relative mx-auto mt-10 max-w-5xl overflow-hidden rounded-2xl md:mt-14">
          <Image
            alt={`${macwall.name} live wallpapers on a MacBook`}
            src="/Img.png"
            width={1024}
            height={683}
            className="h-auto w-full object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>
      </div>
    </section>
  )
}
