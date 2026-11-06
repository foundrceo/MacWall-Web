"use client"

import { TrackedLink } from "@/components/analytics/tracked-link"
import { SaleWasPrice } from "@/components/macwall-marketing/sale-was-price"
import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import { trackSiteEventClient } from "@/lib/analytics/client"
import {
  macwallCatalog,
  macwallInstallerLatestPath,
  macwallMinimumMacOSVersion,
} from "@/lib/macwall-site"

/** Where the CTA sits on the page, sent with every click. */
export type ContentCtaPosition = "mid_article" | "end_article"

/**
 * The in-content download prompt for blog posts and help pages, placed after
 * the first section. Clicks send `cta_click` with `{ slug, position,
 * page_type }` so content can be ranked by the downloads it leads to; the
 * download button also sends the usual `download_click`. The price is the
 * visitor's regional one, struck through against the regular price during a
 * sale, like the homepage caption.
 */
export function ContentCta({
  slug,
  pageType,
  position = "mid_article",
}: Readonly<{
  slug: string
  /** "blog", "docs", "learn"… */
  pageType: string
  position?: ContentCtaPosition
}>) {
  const pricing = useMarketingPricing()
  const metadata = { slug, position, page_type: pageType }

  return (
    <aside
      aria-label="Try MacWall"
      className="my-9 rounded-2xl border border-border bg-white/[0.03] px-5 py-6 text-center md:my-10 md:px-8"
    >
      <p className="font-sans text-[17px] leading-snug font-medium tracking-[-0.015em] text-foreground">
        Put a live wallpaper on your Mac
      </p>
      <p className="mx-auto mt-2 max-w-[30rem] font-sans text-[14px] leading-[1.55] text-pretty text-foreground/70">
        MacWall plays {macwallCatalog.liveCountLabel} 4K live wallpapers on your
        desktop, and on the Lock Screen from macOS 26. Free for 24 hours, then{" "}
        <SaleWasPrice />
        <span className="text-foreground">{pricing.permanentPrice}</span> once.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
        <TrackedLink
          href={macwallInstallerLatestPath}
          eventName="download_click"
          metadata={{ location: `${pageType}_${position}`, ...metadata }}
          onClick={() =>
            trackSiteEventClient("cta_click", {
              ...metadata,
              target: "download",
            })
          }
          className="inline-flex h-10 items-center justify-center rounded-full bg-white px-5 font-sans text-[14px] font-medium text-black no-underline transition-opacity hover:opacity-90"
        >
          Download for Mac
        </TrackedLink>
        <TrackedLink
          href="/pricing"
          eventName="cta_click"
          metadata={{ ...metadata, target: "pricing" }}
          className="inline-flex h-10 items-center justify-center rounded-full bg-white/[0.08] px-5 font-sans text-[14px] font-medium text-foreground no-underline transition-colors hover:bg-white/[0.12]"
        >
          See pricing
        </TrackedLink>
      </div>
      <p className="mt-3 font-sans text-[12px] leading-4 text-marketing-muted">
        Needs {macwallMinimumMacOSVersion} or later. No card for the trial.
      </p>
    </aside>
  )
}
