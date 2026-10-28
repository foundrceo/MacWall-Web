"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion, type Transition } from "motion/react"
import { Accordion as AccordionPrimitive } from "radix-ui"

import {
  MarketingReelFaqRefundCopy,
  MarketingRichText,
} from "@/components/macwall-marketing/marketing-primitives"
import { macwallPricingCopy as pricingCopy } from "@/lib/macwall-pricing-copy"
import { macwall, mailtoSupport } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

type MarketingFaqItem = Readonly<{ q: string; a: string }>

type MarketingFaqSectionProps = Readonly<{
  className?: string
  defaultOpenQuestion?: string | null
  /** Questions to show; the pricing FAQ when omitted. */
  items?: readonly MarketingFaqItem[]
}>

/** transitions.dev motion tokens: 250 ms, smooth-out, 2 px blur (as on PostMesh). */
const EASE = [0.22, 1, 0.36, 1] as const
const OPEN: Transition = { duration: 0.25, ease: EASE }

/** `#how-do-i-move-my-license` style anchor for a question. */
function faqAnchor(question: string) {
  return question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

function FaqAnswer({ item }: Readonly<{ item: MarketingFaqItem }>) {
  if (item.q === "How does the Reel refund work?") {
    return <MarketingReelFaqRefundCopy className="text-ink-2" />
  }
  return (
    <MarketingRichText as="span" className="text-ink-2">
      {item.a}
    </MarketingRichText>
  )
}

/**
 * "Good questions." in PostMesh's layout: the heading and a contact line on
 * the left (sticky on desktop), the questions on the right with hairlines
 * between them and a + that turns into −. One answer opens at a time; a
 * `#question-anchor` in the URL opens that one. Answers always stay in the
 * HTML (search engines read them, matching the FAQ JSON-LD) and are `inert`
 * while closed.
 */
export default function MarketingFaqSection({
  className,
  defaultOpenQuestion = null,
  items = pricingCopy.faq,
}: MarketingFaqSectionProps) {
  const [open, setOpen] = useState<string>(defaultOpenQuestion ?? "")
  const reduce = useReducedMotion()
  const transition = reduce ? { duration: 0 } : OPEN

  useEffect(() => {
    function openFromHash() {
      const id = decodeURIComponent(window.location.hash.slice(1))
      const match = items.find((item) => faqAnchor(item.q) === id)
      if (match) setOpen(match.q)
    }
    openFromHash()
    window.addEventListener("hashchange", openFromHash)
    return () => window.removeEventListener("hashchange", openFromHash)
  }, [items])

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className={cn(
        "w-full min-w-0 scroll-mt-14 pt-20 pb-20 lg:scroll-mt-16 lg:pt-[110px] lg:pb-24",
        className
      )}
    >
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-[1200px] items-start gap-8 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-16">
          <div className="min-w-0 lg:sticky lg:top-28">
            <h2
              id="faq-title"
              className="font-display text-[36px] leading-[44px] font-normal tracking-tight text-ink sm:text-[48px] sm:leading-[58px]"
            >
              Good questions.
            </h2>
            <p className="mt-4 text-[15px] leading-[22px] text-ink-2">
              Something else? Write to{" "}
              <a
                href={mailtoSupport}
                className="text-ink underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                {macwall.supportEmail}
              </a>
              .
            </p>
          </div>
          <div className="min-w-0">
            <AccordionPrimitive.Root
              type="single"
              collapsible
              value={open}
              onValueChange={setOpen}
              className="flex flex-col"
            >
              {items.map((item, i) => {
                const isOpen = open === item.q
                return (
                  <AccordionPrimitive.Item
                    key={item.q}
                    id={faqAnchor(item.q)}
                    value={item.q}
                    className={cn(
                      "scroll-mt-20",
                      i > 0 && "border-t border-hairline"
                    )}
                  >
                    <AccordionPrimitive.Header className="flex">
                      <AccordionPrimitive.Trigger
                        className={cn(
                          "group/faq flex min-h-16 w-full items-center justify-between gap-4 py-3 text-left",
                          "text-[16px] leading-6 font-medium text-ink sm:text-[18px] sm:leading-[26px]",
                          "outline-none focus-visible:underline focus-visible:decoration-white/40 focus-visible:underline-offset-4"
                        )}
                      >
                        <span className="min-w-0">{item.q}</span>
                        <span
                          aria-hidden
                          className="relative grid size-8 shrink-0 place-items-center rounded-full bg-surface-1 text-ink-2 transition-colors duration-150 group-hover/faq:bg-surface-2 group-hover/faq:text-ink"
                        >
                          {/* A plus whose upright bar turns flat: + becomes −. */}
                          <span className="absolute h-[1.5px] w-3.5 rounded-full bg-current" />
                          <motion.span
                            className="absolute h-3.5 w-[1.5px] rounded-full bg-current"
                            initial={false}
                            animate={{ rotate: isOpen ? 90 : 0 }}
                            transition={transition}
                          />
                        </span>
                      </AccordionPrimitive.Trigger>
                    </AccordionPrimitive.Header>
                    <AccordionPrimitive.Content forceMount asChild>
                      <motion.div
                        inert={!isOpen}
                        initial={false}
                        animate={
                          isOpen
                            ? { height: "auto", opacity: 1 }
                            : { height: 0, opacity: 0 }
                        }
                        transition={transition}
                        className="overflow-hidden"
                      >
                        <motion.div
                          initial={false}
                          animate={
                            isOpen
                              ? { y: 0, filter: "blur(0px)" }
                              : { y: -4, filter: "blur(2px)" }
                          }
                          transition={transition}
                          className="pr-12 pb-[22px] text-[15px] leading-6 text-ink-2 sm:pr-16"
                        >
                          <FaqAnswer item={item} />
                        </motion.div>
                      </motion.div>
                    </AccordionPrimitive.Content>
                  </AccordionPrimitive.Item>
                )
              })}
            </AccordionPrimitive.Root>
          </div>
        </div>
      </div>
    </section>
  )
}
