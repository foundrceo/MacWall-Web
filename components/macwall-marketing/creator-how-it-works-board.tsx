import type { ReactNode } from "react"
import { MarketingRichText } from "@/components/macwall-marketing/marketing-primitives"
import { macwallCreatorCopy as copy } from "@/lib/macwall-creator-copy"
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

function CreatorStepLink({
  href,
  children,
}: Readonly<{
  href: string
  children: ReactNode
}>) {
  return (
    <a
      href={href}
      className="marketing-inline-link"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  )
}

function CreatorStepBody({
  stepId,
  body,
}: Readonly<{ stepId: string; body: string }>) {
  if (stepId === "3") {
    return (
      <p className="text-[15px] leading-relaxed text-foreground/65">
        Instagram, TikTok, YouTube Shorts, Threads, or X. Your pick. Add{" "}
        <CreatorStepLink href={macwall.reelRefundHashtagURL}>
          {macwall.reelRefundHashtag}
        </CreatorStepLink>
        {" wherever you post. Tag "}
        <CreatorStepLink href={macwall.reelRefundInstagramURL}>
          {macwall.reelRefundInstagram}
        </CreatorStepLink>
        {" or "}
        <CreatorStepLink href={macwall.reelRefundTiktokURL}>
          {macwall.reelRefundTiktok}
        </CreatorStepLink>
        {" so we can find you."}
      </p>
    )
  }

  return (
    <MarketingRichText
      as="p"
      className="text-[15px] leading-relaxed text-foreground/65"
    >
      {body}
    </MarketingRichText>
  )
}

export default function CreatorHowItWorksBoard() {
  return (
    <div className="mx-auto max-w-2xl">
      <ol className="space-y-2">
        {copy.steps.map((step, index) => (
          <li key={step.id} className="relative flex gap-5 pb-8 last:pb-0">
            <span
              aria-hidden
              className={cn(
                "relative z-10 inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[15px] font-medium tabular-nums",
                index === 0
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-foreground"
              )}
            >
              {`0${index + 1}`}
            </span>
            <div className="min-w-0 flex-1 pt-1.5">
              <h3 className="text-[19px] leading-snug font-medium tracking-tight text-foreground">
                {step.title}
              </h3>
              <div className="mt-2">
                <CreatorStepBody stepId={step.id} body={step.body} />
              </div>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-10 text-[13px] leading-relaxed text-muted-foreground">
        {copy.finePrint}
      </p>
    </div>
  )
}
