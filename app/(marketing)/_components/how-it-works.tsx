import {
  landingBlockPad,
  LandingSectionHeader,
} from "@/components/macwall-marketing/landing-section-header"
import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { cn } from "@/lib/utils"

export function HowItWorks() {
  const landing = macwallMarketingCopy.landing

  return (
    <MarketingSection id="how" aria-labelledby="how-heading">
      <LandingSectionHeader
        id="how-heading"
        title={landing.howTitle}
        lead={landing.howEyebrow}
      />
      <ol className="grid grid-cols-1 divide-x divide-y divide-dashed divide-border border-t border-dashed border-border sm:grid-cols-2 xl:grid-cols-4">
        {landing.steps.map((step, index) => (
          <li
            key={step.id}
            className={cn(
              landingBlockPad,
              "flex min-w-0 flex-col gap-6 py-8 transition-colors hover:bg-card/80"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-display text-3xl leading-none text-muted-foreground/60">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "inline-flex h-7 items-center rounded-md px-2.5 text-xs",
                  step.id === "set"
                    ? "bg-primary font-medium text-primary-foreground"
                    : "border border-border text-foreground"
                )}
              >
                {step.mark}
              </span>
            </div>
            <div>
              <h3 className="text-lg tracking-tight text-foreground">{step.title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </MarketingSection>
  )
}
