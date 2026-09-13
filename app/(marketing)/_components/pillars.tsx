import { cva } from "class-variance-authority"

import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"

import { PillarVisual, type PillarVisualId } from "./pillar-visuals"

const featureItemVariants = cva(
  "flex flex-col justify-between gap-8 overflow-hidden p-6",
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
    <MarketingSection className="relative w-full pt-10">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-2 px-6">
          <h2 className="max-w-xl text-left text-3xl font-normal tracking-tighter md:text-5xl">
            {landing.pillarsTitle}
          </h2>
          <p className="max-w-xl text-left text-lg leading-relaxed tracking-tight text-muted-foreground lg:max-w-lg">
            {landing.pillarsLead}
          </p>
        </div>

        <div className="w-full border-t border-dashed border-border">
          <div className="grid grid-cols-1 divide-x divide-y divide-dashed divide-border text-left sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                className={featureItemVariants({ size: item.size })}
                key={item.id}
              >
                <PillarVisual id={item.id as PillarVisualId} />
                <div className="flex flex-col">
                  <h3 className="text-xl tracking-tight">{item.title}</h3>
                  <p className="max-w-xs text-base text-muted-foreground">
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
