import { cva } from "class-variance-authority"

import { LandingSectionHeader } from "@/components/macwall-marketing/landing-section-header"
import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"

import { PillarVisual, type PillarVisualId } from "./pillar-visuals"

const featureItemVariants = cva(
  "flex flex-col justify-between gap-8 overflow-hidden px-6 py-8 lg:px-8",
  {
    variants: {
      size: {
        sm: "",
        lg: "lg:col-span-2",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
)

export function Pillars() {
  const landing = macwallMarketingCopy.landing

  const items = landing.pillars.map((item, index) => ({
    ...item,
    size: index === 0 || index === 3 ? ("lg" as const) : ("sm" as const),
  }))

  return (
    <MarketingSection className="relative w-full" aria-labelledby="pillars-heading">
      <div className="flex flex-col">
        <LandingSectionHeader
          id="pillars-heading"
          title={landing.pillarsTitle}
          lead={landing.pillarsLead}
        />

        <div className="w-full border-t border-dashed border-border">
          <div className="grid grid-cols-1 divide-x divide-y divide-dashed divide-border text-left sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                className={featureItemVariants({ size: item.size })}
                key={item.id}
              >
                <PillarVisual id={item.id as PillarVisualId} />
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-lg tracking-tight">{item.title}</h3>
                  <p className="max-w-xs text-[15px] leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MarketingSection>
  )
}
