"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { useId, useState } from "react"

import { FaqChevronIcon } from "@/components/macwall-marketing/FaqChevronIcon"
import {
  MarketingReelFaqRefundCopy,
  MarketingRichText,
} from "@/components/macwall-marketing/marketing-primitives"
import { macwallPricingCopy as pricingCopy } from "@/lib/macwall-pricing-copy"
import { cn } from "@/lib/utils"

const answerClassName =
  "pb-5 text-[15px] leading-[1.55] text-foreground/70 sm:text-[16px]"

const faqEase = [0.22, 1, 0.36, 1] as const

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
    : { duration: 0.28, ease: faqEase }

  return (
    <div className="border-b border-border/70 last:border-b-0">
      <button
        id={buttonId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className={cn(
          "flex min-h-11 w-full cursor-pointer items-center justify-between gap-4 rounded-sm py-4 text-left text-[15px] font-normal transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:gap-4 sm:py-5 sm:text-[16px]",
          isOpen ? "text-foreground" : "text-foreground/90",
        )}
      >
        <span className="min-w-0 pr-2 leading-snug">{question}</span>
        <motion.span
          className="shrink-0"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={transition}
          aria-hidden
        >
          <FaqChevronIcon
            className={cn(
              "size-[18px] text-foreground/35 transition-colors duration-200",
              isOpen && "text-foreground/65",
            )}
          />
        </motion.span>
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
  /** Optional extra classes for one-off page tweaks. */
  className?: string
}>

export default function MarketingFaqSection({
  className,
}: MarketingFaqSectionProps) {
  const reduceMotion = useReducedMotion()
  const [openQuestion, setOpenQuestion] = useState<string | null>(null)

  return (
    <section className={cn("marketing-section-elevated bg-surface-elevated", className)}>
      <div className="marketing-container">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[13px] font-medium text-marketing-muted sm:text-[14px]">
            Questions
          </p>
          <h2 className="mt-3 text-[clamp(1.75rem,4vw,2.25rem)] leading-[1.15] font-normal tracking-[-0.02em] text-foreground">
            {pricingCopy.faqTitle}
          </h2>
          <div className="mt-10 border-t border-border/70 text-left md:mt-12">
            {pricingCopy.faq.map((item) => (
              <FaqItem
                key={item.q}
                question={item.q}
                answer={item.a}
                isOpen={openQuestion === item.q}
                reduceMotion={reduceMotion}
                onToggle={() =>
                  setOpenQuestion((current) =>
                    current === item.q ? null : item.q,
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
