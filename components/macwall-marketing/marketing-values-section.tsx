"use client"

import { HardDrive, ShieldBan, Tag } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  MarketingContainer,
  MarketingSection,
} from "@/components/macwall-marketing/marketing-primitives"
import { macwallExactCopy } from "@/lib/macwall-marketing-copy"
import { cn } from "@/lib/utils"

type ValuesAccent = (typeof macwallExactCopy.values.cards)[number]["accent"]

const accentClass: Record<ValuesAccent, string> = {
  violet: "MacWallValuesAccentViolet",
  orange: "MacWallValuesAccentOrange",
  teal: "MacWallValuesAccentTeal",
}

const accentIcon = {
  violet: HardDrive,
  orange: ShieldBan,
  teal: Tag,
} as const

function ValuesCardIcon({ accent }: Readonly<{ accent: ValuesAccent }>) {
  const Icon = accentIcon[accent]
  return (
    <Icon className="MacWallValuesCardIconSvg" strokeWidth={1.75} aria-hidden />
  )
}

function ChevronIcon({ direction }: Readonly<{ direction: "left" | "right" }>) {
  if (direction === "left") {
    return (
      <svg viewBox="0 0 36 36" className="MacWallValuesPaddleIcon" aria-hidden>
        <path
          fill="currentColor"
          d="m20 25c-.3838 0-.7676-.1465-1.0605-.4395l-5.5-5.5c-.5859-.5854-.5859-1.5356 0-2.1211l5.5-5.5c.5859-.5859 1.5352-.5859 2.1211 0 .5859.5854.5859 1.5356 0 2.1211l-4.4395 4.4395 4.4395 4.4395c.5859.5854.5859 1.5356 0 2.1211-.293.293-.6768.4395-1.0605.4395z"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 36 36" className="MacWallValuesPaddleIcon" aria-hidden>
      <path
        fill="currentColor"
        d="m22.5597 16.9375-5.5076-5.5c-.5854-.5854-1.5323-.5825-2.1157.0039-.5835.5869-.5815 1.5366.0039 2.1211l4.4438 4.4375-4.4438 4.4375c-.5854.5845-.5874 1.5342-.0039 2.1211.2922.2944.676.4414 1.0598.4414.3818 0 .7637-.1455 1.0559-.4375l5.5076-5.5c.2815-.2812.4403-.6636.4403-1.0625s-.1588-.7812-.4403-1.0625z"
      />
    </svg>
  )
}

export default function MacWallMarketingValuesSection() {
  const val = macwallExactCopy.values
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const syncPaddles = useCallback(() => {
    const node = scrollRef.current
    if (!node) return
    const maxScroll = node.scrollWidth - node.clientWidth
    setCanScrollPrev(node.scrollLeft > 4)
    setCanScrollNext(node.scrollLeft < maxScroll - 4)
  }, [])

  const scrollByPage = useCallback((direction: -1 | 1) => {
    const node = scrollRef.current
    if (!node) return
    const cardSet = node.querySelector<HTMLElement>(".MacWallValuesCardSet")
    const firstItem = node.querySelector<HTMLElement>(".MacWallValuesCardItem")
    if (!firstItem) return
    const gap = cardSet
      ? Number.parseFloat(getComputedStyle(cardSet).columnGap || "0") || 16
      : 16
    node.scrollBy({
      left: direction * (firstItem.offsetWidth + gap),
      behavior: "smooth",
    })
  }, [])

  useEffect(() => {
    syncPaddles()
    const node = scrollRef.current
    if (!node) return
    const observer = new ResizeObserver(syncPaddles)
    observer.observe(node)
    return () => observer.disconnect()
  }, [syncPaddles])

  return (
    <MarketingSection muted className="MacWallMarketingSectionPrePageEnd">
      <MarketingContainer wide className="MacWallValuesHeader">
        <h2
          id="values-section-header"
          className="MacWallValuesTitle font-semibold text-[#1d1d1f]"
        >
          {val.title}
        </h2>
        <p className="MacWallValuesLead text-[#86868b]">{val.lead}</p>
      </MarketingContainer>

      <div className="MacWallValuesGallery relative">
        <div
          ref={scrollRef}
          className="MacWallValuesScroll"
          onScroll={syncPaddles}
        >
          <ul
            className="MacWallValuesCardSet"
            role="list"
            aria-labelledby="values-section-header"
          >
            {val.cards.map((card) => (
              <li
                key={card.title}
                className="MacWallValuesCardItem"
                role="listitem"
              >
                <div className="MacWallValuesCard">
                  <div className="MacWallValuesCardContent">
                    <div
                      className={cn(
                        "MacWallValuesCardIcon",
                        accentClass[card.accent]
                      )}
                    >
                      <ValuesCardIcon accent={card.accent} />
                    </div>
                    <div className="MacWallValuesCardCopy">
                      <h3 className="MacWallValuesCardHeadline">
                        <strong className={accentClass[card.accent]}>
                          {card.title}
                        </strong>
                      </h3>
                      <p className="MacWallValuesCardBody">{card.body}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="MacWallValuesPaddleNav">
          <button
            type="button"
            className="MacWallValuesPaddle MacWallValuesPaddlePrev"
            aria-label="Previous values card"
            disabled={!canScrollPrev}
            onClick={() => scrollByPage(-1)}
          >
            <ChevronIcon direction="left" />
          </button>
          <button
            type="button"
            className="MacWallValuesPaddle MacWallValuesPaddleNext"
            aria-label="Next values card"
            disabled={!canScrollNext}
            onClick={() => scrollByPage(1)}
          >
            <ChevronIcon direction="right" />
          </button>
        </div>
      </div>
    </MarketingSection>
  )
}
