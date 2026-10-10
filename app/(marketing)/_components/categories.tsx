import Link from "next/link"
import type { CSSProperties } from "react"
import {
  Car05Icon,
  GameController03Icon,
  Leaf01Icon,
  Moon02Icon,
  SakuraIcon,
  SaturnIcon,
  Shapes01Icon,
  ZapIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { wallpapersGalleryPath } from "@/lib/public-catalog/urls"
import { categorySlugFromName } from "@/lib/seo/category-slugs"

/**
 * One instantly readable mark per category. "Others" is a catch-all, not
 * something anyone browses for. Avoid the △○✕□ set for Abstract: that is
 * the PlayStation button layout and reads as Gaming.
 */
const CATEGORIES: readonly { name: string; icon: IconSvgElement }[] = [
  { name: "Anime", icon: SakuraIcon },
  { name: "Nature", icon: Leaf01Icon },
  { name: "Cars", icon: Car05Icon },
  { name: "Gaming", icon: GameController03Icon },
  { name: "Space", icon: SaturnIcon },
  { name: "Heroes", icon: ZapIcon },
  { name: "Dark", icon: Moon02Icon },
  { name: "Abstract", icon: Shapes01Icon },
]

/**
 * Each half of the track must be wider than the widest viewport or a gap
 * opens before the loop restarts; two passes of eight clears ~2,300px.
 */
const PASSES_PER_HALF = 2

/** Categories as a logo strip: one row drifting endlessly, linking out. */
export function Categories() {
  const landing = macwallMarketingCopy.landing
  const half = Array.from({ length: PASSES_PER_HALF }, () => CATEGORIES).flat()

  return (
    <MarketingSection
      id="categories"
      aria-labelledby="categories-heading"
      className="py-12 md:py-16"
    >
      <h2
        id="categories-heading"
        className="text-center font-sans text-[13px] font-medium tracking-[0.12em] text-muted-foreground uppercase"
      >
        {landing.categoriesLabel}
      </h2>
      <div
        className="mw-marquee mt-8 md:mt-10"
        style={{ "--marquee-duration": "48s" } as CSSProperties}
      >
        <ul className="mw-marquee-track">
          {[...half, ...half].map((item, index) => {
            // Only the first pass is real; the rest are visual repeats.
            const repeat = index >= CATEGORIES.length
            return (
              <li
                key={`${item.name}-${index}`}
                aria-hidden={repeat || undefined}
              >
                <Link
                  href={wallpapersGalleryPath(categorySlugFromName(item.name))}
                  tabIndex={repeat ? -1 : undefined}
                  className="flex items-center gap-2.5 px-7 py-1 text-xl font-semibold tracking-tight whitespace-nowrap text-white/55 transition-colors outline-none hover:text-white focus-visible:text-white sm:px-9 sm:text-2xl"
                >
                  <HugeiconsIcon
                    icon={item.icon}
                    size={24}
                    strokeWidth={1.75}
                    className="size-5 sm:size-6"
                    aria-hidden
                  />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </MarketingSection>
  )
}
