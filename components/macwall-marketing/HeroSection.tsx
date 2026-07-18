"use client"

import Link from "next/link"
import HeroVideoPlayer from "@/components/macwall-marketing/HeroVideoPlayer"
import { TrackedDownloadButton } from "@/components/analytics/tracked-marketing-buttons"
import {
  HERO_DOWNLOAD_HINT_CLASS,
  HERO_PRIMARY_BTN_CLASS,
  HERO_SECONDARY_BTN_CLASS,
} from "@/lib/marketing-chrome"
import {
  macwall,
  macwallInstallerLatestPath,
  macwallMinimumMacOSRequirement,
} from "@/lib/macwall-site"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"
import { marketingWalkthroughVideoSources } from "@/lib/marketing-assets-urls"

const catalogHighlights = [
  { name: "Nature", subtitle: "Landscapes" },
  { name: "Space", subtitle: "Cosmic" },
  { name: "Anime", subtitle: "Studio quality" },
  { name: "Sci-fi", subtitle: "Cinematic" },
] as const

function AppleIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

export default function HeroSection() {
  const ix = macwallExactCopy.interact
  const videoSources = marketingWalkthroughVideoSources()

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-3xl pt-12 pb-8 md:max-w-none md:pt-16 md:pb-10">
          <p className="inline-flex items-center gap-2 text-[14px] text-marketing-muted">
            <span>{ix.kicker}</span>
            <span className="text-marketing-muted/60">·</span>
            <span>{macwall.pro.socialProofMembers} wallpapers</span>
          </p>

          <h1 className="mt-6 max-w-4xl text-[clamp(2.5rem,4.5vw,3.75rem)] font-normal leading-[1.1] tracking-[-0.03em] text-foreground">
            {ix.title}
          </h1>

          <p className="mt-6 max-w-3xl text-[18px] leading-[1.5] text-marketing-muted sm:text-[19px]">
            <span className="text-foreground/75">{ix.heroLead}</span>
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-2.5 pb-5 md:mt-10">
            <div className="relative inline-block">
              <TrackedDownloadButton
                href={macwallInstallerLatestPath}
                size="pill"
                location="hero"
                className={HERO_PRIMARY_BTN_CLASS}
              >
                <AppleIcon className="size-3.5" />
                Download for macOS
              </TrackedDownloadButton>
              <p className={HERO_DOWNLOAD_HINT_CLASS}>
                {macwallMinimumMacOSRequirement}
              </p>
            </div>
            <Link href="/pricing" className={HERO_SECONDARY_BTN_CLASS}>
              Get Pro — {macwall.pro.price}
            </Link>
          </div>
        </div>

        <HeroVideoPlayer
          sources={videoSources}
          ariaLabel={`${macwall.name} app preview`}
          endCaption={`Live wallpapers on your Mac desktop with ${macwall.name}.`}
        />

        <div className="py-10 md:py-14">
          <p className="mb-6 text-center text-[15px] text-marketing-muted md:mb-10">
            Curated across every genre
          </p>
          <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-center gap-x-6 gap-y-4 px-4 sm:gap-x-8 sm:px-6">
            {catalogHighlights.map((item) => (
              <div key={item.name} className="group flex items-end gap-2.5">
                <span className="text-xl font-normal tracking-tight whitespace-nowrap text-foreground transition-colors group-hover:text-foreground/50 sm:text-2xl">
                  {item.name}
                </span>
                <span className="mb-0.5 text-[14px] whitespace-nowrap text-marketing-muted sm:text-[15px]">
                  {item.subtitle}
                </span>
              </div>
            ))}
            <span className="mb-0.5 text-[14px] text-marketing-muted/60 sm:text-[15px]">
              and more
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
