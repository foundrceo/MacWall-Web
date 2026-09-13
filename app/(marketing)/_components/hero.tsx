import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { HeroActions } from "./hero-actions"
import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"

export function Hero() {
  const ix = macwallMarketingCopy.interact

  return (
    <MarketingSection className="relative flex min-h-[calc(100svh-var(--marketing-chrome-height))] w-full items-center overflow-hidden bg-background px-4 py-20 sm:px-16 sm:py-24">
      <Image
        alt=""
        src="/images/shape-3.png"
        width={314}
        height={265}
        priority
        className="pointer-events-none absolute right-0 bottom-0 z-0 h-auto w-[min(90vw,28rem)] select-none sm:w-[min(72vw,36rem)]"
      />
      <div className="relative z-10 mx-auto flex flex-col items-center justify-center gap-8">
        <Link
          href={ix.chipHref}
          className="group inline-flex h-8 items-center gap-2 rounded-full border border-border bg-muted/70 px-3.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
        >
          {ix.chip}
          <ArrowUpRight className="size-3.5 transition-transform group-hover:-rotate-12" />
        </Link>
        <div className="flex flex-col items-center gap-4">
          <h1 className="max-w-4xl text-center text-5xl font-normal tracking-tighter md:text-7xl">
            Cinematic 4K wallpapers
            <br />
            Built for Mac
          </h1>
          <p className="mx-auto max-w-xl text-center text-lg leading-relaxed tracking-tight text-muted-foreground md:text-xl">
            {ix.heroLead}
          </p>
        </div>
        <HeroActions />
      </div>
    </MarketingSection>
  )
}
