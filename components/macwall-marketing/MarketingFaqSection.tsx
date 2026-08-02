import { FaqChevronIcon } from "@/components/macwall-marketing/FaqChevronIcon"
import {
  MarketingReelFaqRefundCopy,
  MarketingRichText,
} from "@/components/macwall-marketing/marketing-primitives"
import { macwallPricingCopy as pricingCopy } from "@/lib/macwall-pricing-copy"

const answerClassName = "pb-5 text-[16px] leading-[1.55] text-foreground/70"

function FaqAnswer({
  question,
  answer,
}: Readonly<{ question: string; answer: string }>) {
  if (question === "How does the Reel refund work?") {
    return <MarketingReelFaqRefundCopy className={answerClassName} />
  }

  return (
    <MarketingRichText as="p" className={answerClassName}>
      {answer}
    </MarketingRichText>
  )
}

export default function MarketingFaqSection() {
  return (
    <section className="bg-surface-elevated py-14 sm:py-16 md:py-24">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[15px] text-marketing-muted">FAQ</p>
          <h2 className="mt-3 text-[clamp(1.6rem,4vw,2.25rem)] leading-[1.15] font-normal tracking-[-0.02em] text-foreground">
            {pricingCopy.faqTitle}
          </h2>
          <div className="mt-10 divide-y divide-border border-t border-border text-left md:mt-14">
            {pricingCopy.faq.map((item) => (
              <details key={item.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-[15px] font-normal text-foreground sm:gap-4 sm:py-5 sm:text-[17px] [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0 text-left">{item.q}</span>
                  <FaqChevronIcon className="size-4 shrink-0 text-marketing-muted transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <FaqAnswer question={item.q} answer={item.a} />
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
