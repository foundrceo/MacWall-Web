"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import {
  MarketingReelFaqRefundCopy,
  MarketingRichText,
} from "@/components/macwall-marketing/marketing-primitives"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { macwallPricingCopy as pricingCopy } from "@/lib/macwall-pricing-copy"
import { mailtoSupport } from "@/lib/macwall-site"

function FaqAnswer({
  question,
  answer,
}: Readonly<{ question: string; answer: string }>) {
  if (question === "How does the Reel refund work?") {
    return <MarketingReelFaqRefundCopy className="text-muted-foreground" />
  }

  return (
    <MarketingRichText as="p" className="max-w-xl text-muted-foreground">
      {answer}
    </MarketingRichText>
  )
}

type MarketingFaqSectionProps = Readonly<{
  className?: string
  defaultOpenQuestion?: string | null
}>

export default function MarketingFaqSection({
  className,
  defaultOpenQuestion = null,
}: MarketingFaqSectionProps) {
  const landing = macwallMarketingCopy.landing
  const defaultValue = defaultOpenQuestion
    ? pricingCopy.faq.find((item) => item.q === defaultOpenQuestion)?.q
    : undefined

  return (
    <MarketingSection
      id="faq"
      className={className}
      innerClassName="grid lg:grid-cols-2 lg:divide-x lg:divide-y-0 lg:divide-dashed lg:divide-border"
    >
      <div className="flex flex-col gap-2 px-6 py-10 md:py-14">
        <h2 className="max-w-xl text-left text-3xl font-normal tracking-tighter md:text-5xl">
          {pricingCopy.faqTitle}
        </h2>
        <p className="max-w-xl text-left text-lg leading-relaxed tracking-tight text-muted-foreground lg:max-w-lg">
          {landing.faqLead}{" "}
          <a
            href={mailtoSupport}
            className="text-foreground underline-offset-4 hover:underline"
          >
            {landing.contactUs}
          </a>
        </p>
      </div>
      <Accordion
        type="single"
        collapsible
        defaultValue={defaultValue}
        className="w-full divide-dashed divide-border border-t border-dashed border-border lg:border-t-0"
      >
        {pricingCopy.faq.map((item) => (
          <AccordionItem key={item.q} value={item.q}>
            <AccordionTrigger className="rounded-none px-4 hover:bg-card hover:no-underline data-[state=open]:bg-card">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="p-4">
              <FaqAnswer question={item.q} answer={item.a} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </MarketingSection>
  )
}
