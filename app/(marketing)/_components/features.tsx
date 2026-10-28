import type { ReactNode } from "react"
import { SparklesIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import LockScreenFeatureVideo from "@/components/macwall-marketing/LockScreenFeatureVideo"
import { DeferredVideo } from "@/components/macwall-marketing/deferred-video"
import {
  landingBlockPad,
  LandingSectionHeader,
} from "@/components/macwall-marketing/landing-section-header"
import { MarketingMediaSlot } from "@/components/macwall-marketing/marketing-media-slot"
import {
  LANDING_SECTION_END,
  MarketingSection,
} from "@/components/macwall-marketing/marketing-section"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { MARKETING_BEND_VIDEO_MP4_URL } from "@/lib/marketing-assets-urls"
import { cn } from "@/lib/utils"

/**
 * - bento: zig-zag grid; the two exclusives take the wide tiles.
 * - rows: alternating media/text rows, Apple style.
 */
export type FeaturesVariant = "bento" | "rows"

type FeatureCopy = Readonly<{ eyebrow: string; title: string; body: string }>

type FeatureItem = {
  key: "music" | "lock" | "bend"
  /** In-page anchor (hero badge, nav); only set once per page. */
  anchor?: string
  copy: FeatureCopy
  exclusive: boolean
  media: () => ReactNode
}

function ExclusiveBadge({ label }: Readonly<{ label: string }>) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-black">
      <HugeiconsIcon
        icon={SparklesIcon}
        size={11}
        strokeWidth={2.25}
        aria-hidden
      />
      {label}
    </span>
  )
}

function buildItems(withAnchors: boolean): FeatureItem[] {
  const s = macwallMarketingCopy.home.showcase
  return [
    {
      key: "music",
      anchor: withAnchors ? "music-sync" : undefined,
      copy: s.music,
      exclusive: true,
      media: () => <MarketingMediaSlot id="musicSync" />,
    },
    {
      key: "lock",
      copy: s.lockScreen,
      exclusive: false,
      media: () => (
        <LockScreenFeatureVideo
          ariaLabel={s.lockScreen.title}
          className="h-full min-h-0 w-full"
        />
      ),
    },
    {
      key: "bend",
      anchor: withAnchors ? "bend" : undefined,
      copy: s.bend,
      exclusive: true,
      media: () => (
        <DeferredVideo
          src={MARKETING_BEND_VIDEO_MP4_URL}
          poster="/hero/bend-poster.avif"
          label={s.bend.title}
        />
      ),
    },
  ]
}

function pick(items: FeatureItem[], key: FeatureItem["key"]) {
  return items.find((item) => item.key === key)!
}

function TileText({
  item,
  exclusiveLabel,
  size = "md",
  onMedia,
}: Readonly<{
  item: FeatureItem
  exclusiveLabel: string
  size?: "md" | "lg"
  /** Text sits over video: brighter body copy. */
  onMedia?: boolean
}>) {
  return (
    <>
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "text-[13px]",
            onMedia ? "text-white/70" : "text-ink-3"
          )}
        >
          {item.copy.eyebrow}
        </span>
        {item.exclusive ? <ExclusiveBadge label={exclusiveLabel} /> : null}
      </div>
      <h3
        className={cn(
          "mt-2 font-display font-normal tracking-tight text-ink",
          size === "lg" ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"
        )}
      >
        {item.copy.title}
      </h3>
      <p
        className={cn(
          "mt-3 max-w-lg text-[15px] leading-[22px]",
          onMedia ? "text-white/75" : "text-ink-2"
        )}
      >
        {item.copy.body}
      </p>
    </>
  )
}

const TILE =
  "squircle flex min-w-0 flex-col overflow-hidden rounded-[28px] bg-surface-1"

/* A · Bento */

function Bento({
  items,
  label,
}: Readonly<{ items: FeatureItem[]; label: string }>) {
  const order: [FeatureItem["key"], string][] = [
    ["music", "lg:col-span-3"],
    ["lock", "lg:col-span-2"],
    ["bend", "lg:col-span-5"],
  ]
  return (
    <ul
      className={cn(
        landingBlockPad,
        "grid grid-cols-1 gap-4 pb-12 md:pb-16 lg:grid-cols-5 lg:gap-5"
      )}
    >
      {order.map(([key, span]) => {
        const item = pick(items, key)
        return (
          <li key={key} id={item.anchor} className={cn(TILE, span)}>
            <div className="relative h-60 overflow-hidden bg-black sm:h-72 lg:h-80">
              {item.media()}
            </div>
            <div className="p-6">
              <TileText item={item} exclusiveLabel={label} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/* E · Rows */

/**
 * One feature per row, media and text trading sides. Every frame is 16:10 so
 * rows match in height; text sits on its column's left edge, so left-hand
 * rows line up with the section heading, and fills its column, so the gap to
 * the media is equal on both sides.
 */
function Rows({
  items,
  label,
}: Readonly<{ items: FeatureItem[]; label: string }>) {
  const order: FeatureItem["key"][] = ["music", "bend", "lock"]
  return (
    <ul className={cn(landingBlockPad, "flex flex-col gap-14 md:gap-20")}>
      {order.map((key, index) => {
        const item = pick(items, key)
        const flip = index % 2 === 1
        return (
          <li
            key={key}
            id={item.anchor}
            className={cn(
              "grid grid-cols-1 items-center gap-6 md:gap-8 lg:gap-16",
              // Media 7 parts, text 5: the text fills its column, so the
              // gap to the media is the same 64px whichever side it is on.
              flip
                ? "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
                : "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"
            )}
          >
            <div
              className={cn(
                "relative aspect-[16/10] overflow-hidden rounded-[28px] bg-surface-1 squircle",
                flip && "lg:order-2"
              )}
            >
              {item.media()}
            </div>
            <div className={cn("max-w-lg lg:max-w-none", flip && "lg:order-1")}>
              <TileText item={item} exclusiveLabel={label} size="lg" />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function Features({
  variant = "bento",
  anchors = true,
}: Readonly<{
  variant?: FeaturesVariant
  /** Set the in-page anchors (#features, #music-sync, #bend). Once per page. */
  anchors?: boolean
}>) {
  const showcase = macwallMarketingCopy.home.showcase
  const items = buildItems(anchors)
  const Layout = { bento: Bento, rows: Rows }[variant]

  return (
    <MarketingSection
      id={anchors ? "features" : undefined}
      aria-labelledby={`features-heading-${variant}`}
      sectionClassName={LANDING_SECTION_END}
    >
      <LandingSectionHeader
        id={`features-heading-${variant}`}
        title={showcase.title}
        lead={showcase.lead}
      />
      <Layout items={items} label={showcase.exclusive} />
    </MarketingSection>
  )
}
