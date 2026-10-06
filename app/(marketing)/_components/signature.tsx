import { DeferredVideo } from "@/components/macwall-marketing/deferred-video"
import {
  landingBlockPad,
  LandingSectionHeader,
} from "@/components/macwall-marketing/landing-section-header"
import { landingEyebrow } from "@/components/macwall-marketing/landing-type"
import { MarketingMediaSlot } from "@/components/macwall-marketing/marketing-media-slot"
import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { cn } from "@/lib/utils"

const MEDIA_FRAME = "relative h-64 w-full overflow-hidden bg-black sm:h-72 lg:h-80"

/** Music Sync and Bend, side by side: the two features no one else has. */
export function Signature() {
  const sig = macwallMarketingCopy.home.signature

  const cells = [
    {
      key: "music",
      copy: sig.music,
      media: <MarketingMediaSlot id="musicSync" />,
    },
    {
      key: "bend",
      copy: sig.bend,
      media: (
        <DeferredVideo
          src="/hero/bend-demo.mp4"
          poster="/hero/bend-poster.jpg"
          label={sig.bend.title}
        />
      ),
    },
  ]

  return (
    <MarketingSection id="music-sync" aria-labelledby="signature-heading">
      <LandingSectionHeader id="signature-heading" title={sig.title} lead={sig.lead} />
      <div className="grid grid-cols-1 border-t border-dashed border-border lg:grid-cols-2 lg:divide-x lg:divide-dashed lg:divide-border">
        {cells.map((cell, index) => (
          <div
            key={cell.key}
            id={cell.key === "bend" ? "bend" : undefined}
            className={cn(
              "flex min-w-0 flex-col",
              index > 0 && "border-t border-dashed border-border lg:border-t-0"
            )}
          >
            <div className={MEDIA_FRAME}>{cell.media}</div>
            <div
              className={cn(
                landingBlockPad,
                "flex flex-1 flex-col gap-3 border-t border-dashed border-border py-10"
              )}
            >
              <p className={landingEyebrow}>{cell.copy.eyebrow}</p>
              <h3 className="font-display text-3xl font-normal tracking-tighter md:text-4xl">
                {cell.copy.title}
              </h3>
              <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
                {cell.copy.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </MarketingSection>
  )
}
