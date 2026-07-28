import { FaqChevronIcon } from "@/components/macwall-marketing/FaqChevronIcon"
import {
  MarketingReelFaqRefundCopy,
  MarketingRichText,
} from "@/components/macwall-marketing/marketing-primitives"
import { macwallPricingCopy as pricingCopy } from "@/lib/macwall-pricing-copy"

const answerClassName = "pb-5 text-[16px] leading-[1.55] text-foreground/70"

function FaqAnswer({ question, answer }: Readonly<{ question: string; answer: string }>) {
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
    <section className="bg-surface-elevated py-16 md:py-24">
      <div className="mx-auto max-w-[1360px] px-6 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[15px] text-marketing-muted">FAQ</p>
          <h2 className="mt-3 text-[clamp(1.75rem,3vw,2.25rem)] font-normal leading-[1.15] tracking-[-0.02em] text-foreground">
            {pricingCopy.faqTitle}
          </h2>
          <div className="mt-12 divide-y divide-border border-t border-border text-left md:mt-14">
            {pricingCopy.faq.map((item) => (
              <details key={item.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[17px] font-normal text-foreground [&::-webkit-details-marker]:hidden">
                  {item.q}
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
