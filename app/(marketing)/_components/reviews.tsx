"use client"

import { AppleIcon, LaptopIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import { useSyncExternalStore } from "react"

import { LandingSectionHeader } from "@/components/macwall-marketing/landing-section-header"
import {
  LANDING_SECTION_END,
  MarketingSection,
} from "@/components/macwall-marketing/marketing-section"
import { InfiniteSlider } from "@/components/ui/infinite-slider"
import {
  macwallPricingCopy as p,
  type PricingReview,
} from "@/lib/macwall-pricing-copy"
import { cn } from "@/lib/utils"

function macIconForContext(context: string): IconSvgElement {
  return context.startsWith("MacBook") ? LaptopIcon : AppleIcon
}

/** One column on phones, two on tablets, three from lg up. */
const MEDIA = { two: "(min-width: 768px)", three: "(min-width: 1024px)" }
function subscribeColumns(onChange: () => void) {
  const queries = Object.values(MEDIA).map((q) => window.matchMedia(q))
  queries.forEach((q) => q.addEventListener("change", onChange))
  return () => queries.forEach((q) => q.removeEventListener("change", onChange))
}
function columnCount() {
  if (window.matchMedia(MEDIA.three).matches) return 3
  if (window.matchMedia(MEDIA.two).matches) return 2
  return 1
}

/**
 * Deals reviews round-robin so each column gets a mix, and tops short columns
 * up from the rest so every loop is taller than its window (no empty gap).
 */
const MIN_PER_COLUMN = 4
function toColumns(items: readonly PricingReview[], count: number) {
  const perColumn = Math.max(MIN_PER_COLUMN, Math.ceil(items.length / count))
  return Array.from({ length: count }, (_, column) =>
    Array.from(
      { length: count === 1 ? items.length : perColumn },
      (_, k) => items[(column + k * count) % items.length]
    )
  )
}

/** Each column drifts at its own pace; hover slows it down to read. */
const SPEEDS = [30, 46, 36]

function ReviewCard({ item }: Readonly<{ item: PricingReview }>) {
  return (
    // Every card is the same height (room for a three-line quote), with the
    // name pinned to the bottom, so the columns read as an even grid.
    <figure className="flex min-h-[192px] w-full flex-col justify-between gap-6 rounded-[28px] bg-surface-1 p-6 squircle">
      <blockquote className="text-[16px] leading-6 text-pretty text-ink">
        {item.quote}
      </blockquote>
      <figcaption className="flex items-center gap-3">
        {item.avatarSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.avatarSrc}
            alt=""
            width={36}
            height={36}
            loading="lazy"
            decoding="async"
            className="size-9 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex size-9 items-center justify-center rounded-full bg-surface-3 text-[14px] text-ink"
          >
            {item.name.slice(0, 1)}
          </span>
        )}
        <span className="min-w-0">
          <cite className="block text-[15px] leading-5 font-medium text-ink not-italic">
            {item.name}
          </cite>
          <span className="flex items-center gap-1.5 text-[13px] leading-5 text-ink-3">
            <HugeiconsIcon
              icon={macIconForContext(item.context)}
              size={14}
              strokeWidth={1.5}
              aria-hidden
            />
            {item.context}
          </span>
        </span>
      </figcaption>
    </figure>
  )
}

/**
 * The reviews section: real quotes from MacWall's support chats in columns of
 * cards that drift upward at different speeds, faded at the top and bottom.
 */
export function Reviews({ className }: Readonly<{ className?: string }>) {
  const { title, subtitle, items } = p.reviews
  const count = useSyncExternalStore(subscribeColumns, columnCount, () => 3)
  const columns = toColumns(items, count)

  return (
    <MarketingSection
      className={className}
      sectionClassName={LANDING_SECTION_END}
      aria-labelledby="reviews-heading"
    >
      <LandingSectionHeader
        id="reviews-heading"
        title={title}
        lead={subtitle}
      />

      <div
        className={cn(
          "grid h-[560px] gap-4 overflow-hidden sm:h-[640px]",
          "mask-[linear-gradient(to_bottom,transparent,black_12%,black_92%,transparent)]",
          count === 3 ? "grid-cols-3" : count === 2 ? "grid-cols-2" : ""
        )}
      >
        {columns.map((column, i) => (
          <InfiniteSlider
            key={`${count}-${i}`}
            direction="vertical"
            gap={16}
            speed={SPEEDS[i]}
            speedOnHover={SPEEDS[i] / 3}
            reverse={i === 1}
          >
            {column.map((item, k) => (
              <ReviewCard key={`${item.name}-${k}`} item={item} />
            ))}
          </InfiniteSlider>
        ))}
      </div>
    </MarketingSection>
  )
}
