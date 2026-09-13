import { LandingSurface } from "@/components/macwall-marketing/landing-surface"
import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import {
  landingBody,
  landingH2,
  landingH3,
  landingLead,
  landingPad,
} from "@/components/macwall-marketing/landing-type"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { cn } from "@/lib/utils"

export function HowItWorks() {
  const landing = macwallMarketingCopy.landing

  return (
    <MarketingSection id="how">
      <div className={cn(landingPad, "flex flex-col gap-2 pt-10 pb-8")}>
        <h2 className={cn(landingH2, "max-w-xl")}>{landing.howTitle}</h2>
        <p className={landingLead}>{landing.howEyebrow}</p>
      </div>
      <ol className="grid grid-cols-1 divide-x divide-y divide-dashed divide-border border-t border-dashed border-border sm:grid-cols-2 xl:grid-cols-4">
        {landing.steps.map((step) => (
          <li key={step.id} className="min-w-0">
            <LandingSurface className="flex h-full min-h-[16rem] flex-col justify-between gap-10 p-6 sm:p-8">
              <span
                className={cn(
                  "inline-flex h-8 w-fit items-center rounded-md px-3 text-xs",
                  step.id === "set"
                    ? "bg-primary font-medium text-primary-foreground"
                    : "border border-border text-foreground"
                )}
              >
                {step.mark}
              </span>
              <div>
                <h3 className={landingH3}>{step.title}</h3>
                <p className={cn(landingBody, "mt-2")}>{step.body}</p>
              </div>
            </LandingSurface>
          </li>
        ))}
      </ol>
    </MarketingSection>
  )
}
