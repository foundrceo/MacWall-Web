"use client"

import { Minus, Plus } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useId, useState } from "react"

import {
  MarketingReelFaqRefundCopy,
  MarketingRichText,
} from "@/components/macwall-marketing/marketing-primitives"
import {
  landingBody,
  landingH2,
  landingLead,
  landingSectionY,
} from "@/components/macwall-marketing/landing-type"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { macwallPricingCopy as pricingCopy } from "@/lib/macwall-pricing-copy"
import { mailtoSupport } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

function FaqAnswer({
  question,
  answer,
}: Readonly<{ question: string; answer: string }>) {
  if (question === "How does the Reel refund work?") {
    return <MarketingReelFaqRefundCopy className={cn("pb-5", landingBody)} />
  }

  return (
    <MarketingRichText as="p" className={cn("max-w-xl pb-5", landingBody)}>
      {answer}
    </MarketingRichText>
  )
}

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
  reduceMotion,
}: Readonly<{
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  reduceMotion: boolean | null
}>) {
  const buttonId = useId()
  const panelId = useId()
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const }

  return (
    <div className="not-last:border-b not-last:border-landing-rule">
      <button
        id={buttonId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-6 py-5 text-left text-[16px] leading-6 font-normal text-white outline-none"
      >
        <span className="min-w-0">{question}</span>
        <span className="relative size-4 shrink-0 text-landing-muted" aria-hidden>
          {isOpen ? (
            <Minus className="absolute inset-0 size-4" />
          ) : (
            <Plus className="absolute inset-0 size-4" />
          )}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={transition}
            className="overflow-hidden"
          >
            <FaqAnswer question={question} answer={answer} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
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
  const reduceMotion = useReducedMotion()
  const landing = macwallMarketingCopy.landing
  const [openQuestion, setOpenQuestion] = useState<string | null>(
    defaultOpenQuestion
  )

  return (
    <section id="faq" className={cn(landingSectionY, className)}>
      <div className="marketing-container">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-16">
          <div className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-24">
            <h2 className={landingH2}>{pricingCopy.faqTitle}</h2>
            <p className={landingLead}>{landing.faqLead}</p>
            <a
              href={mailtoSupport}
              className="w-fit text-[16px] leading-6 text-landing-muted transition-colors hover:text-white"
            >
              {landing.contactUs}
            </a>
          </div>
          <div className="min-w-0">
            {pricingCopy.faq.map((item) => (
              <FaqItem
                key={item.q}
                question={item.q}
                answer={item.a}
                isOpen={openQuestion === item.q}
                reduceMotion={reduceMotion}
                onToggle={() =>
                  setOpenQuestion((current) =>
                    current === item.q ? null : item.q
                  )
                }
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
