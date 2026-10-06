import {
  landingBlockPad,
  LandingSectionHeader,
} from "@/components/macwall-marketing/landing-section-header"
import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { cn } from "@/lib/utils"

import { STEP_VISUALS, type HowStep } from "./how-it-works-visuals"

function StepText({
  step,
  index,
}: Readonly<{ step: HowStep; index: number }>) {
  return (
    <>
      <span className="text-sm text-muted-foreground tabular-nums">
        Step {index + 1}
      </span>
      <h3 className="mt-2 text-lg tracking-tight text-foreground">
        {step.title}
      </h3>
    </>
  )
}

function CardSteps({ steps }: Readonly<{ steps: readonly HowStep[] }>) {
  return (
    <ol
      className={cn(
        landingBlockPad,
        "grid grid-cols-1 gap-10 pb-12 md:grid-cols-3 md:gap-10 md:pb-16 xl:gap-16"
      )}
    >
      {steps.map((step, index) => {
        const Visual = STEP_VISUALS[step.id]
        return (
          <li key={step.id} className="flex flex-col">
            {/* A Mac window's shape; a floor keeps narrow tablet columns usable. */}
            <div className="mb-6 aspect-[16/10] min-h-48">
              <Visual />
            </div>
            <StepText step={step} index={index} />
          </li>
        )
      })}
    </ol>
  )
}

export function HowItWorks() {
  const landing = macwallMarketingCopy.landing

  return (
    <MarketingSection id="how" aria-labelledby="how-heading">
      <LandingSectionHeader
        id="how-heading"
        title={landing.howTitle}
        lead={landing.howEyebrow}
      />
      <CardSteps steps={landing.steps} />
    </MarketingSection>
  )
}
