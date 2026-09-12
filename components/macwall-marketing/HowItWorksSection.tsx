import { LandingSurface } from "@/components/macwall-marketing/landing-surface"
import {
  landingBody,
  landingEyebrow,
  landingH2,
  landingH3,
  landingBelow,
  landingSectionY,
} from "@/components/macwall-marketing/landing-type"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { cn } from "@/lib/utils"

export default function HowItWorksSection() {
  const landing = macwallMarketingCopy.landing

  return (
    <section id="how" className={landingSectionY}>
      <div className="marketing-container">
        <p className={landingEyebrow}>{landing.howEyebrow}</p>
        <h2 className={cn(landingH2, "mt-2")}>{landing.howTitle}</h2>
        <ol
          className={cn(
            landingBelow,
            "grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4"
          )}
        >
          {landing.steps.map((step) => (
            <li key={step.id}>
              <LandingSurface className="flex h-full flex-col rounded-none p-5 sm:p-6 md:p-8">
                <div className="flex h-8 items-center">
                  <span
                    className={cn(
                      "inline-flex h-8 items-center rounded-full px-3 text-[12px] leading-none",
                      step.id === "set"
                        ? "bg-white font-medium text-black"
                        : "bg-black/45 text-white"
                    )}
                  >
                    {step.mark}
                  </span>
                </div>
                <h3 className={cn(landingH3, "mt-6 sm:mt-8")}>{step.title}</h3>
                <p className={cn(landingBody, "mt-2")}>{step.body}</p>
              </LandingSurface>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
