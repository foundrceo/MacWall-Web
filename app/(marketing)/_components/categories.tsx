import Link from "next/link"
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

import {
  LANDING_SECTION_END,
  MarketingSection,
} from "@/components/macwall-marketing/marketing-section"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { wallpapersGalleryPath } from "@/lib/public-catalog/urls"
import { categorySlugFromName } from "@/lib/seo/category-slugs"

import { HomeBrowseLinks } from "./home-link-bands"
import { MarqueeTrack } from "./marquee-track"

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
 * opens before the loop restarts; two passes of eight clears ~2,300px. The
 * server renders one pass; MarqueeTrack adds the rest after hydration.
 */
const PASSES_PER_HALF = 2

/**
 * Categories as a logo strip: one row drifting endlessly, linking out. Below
 * it, popular collections and wallpapers by Mac as plain link rows.
 */
export function Categories() {
  const landing = macwallMarketingCopy.landing

  return (
    <MarketingSection
      id="categories"
      aria-labelledby="categories-heading"
      sectionClassName={LANDING_SECTION_END}
    >
      <h2
        id="categories-heading"
        className="text-center font-sans text-[13px] font-medium tracking-[0.12em] text-muted-foreground uppercase"
      >
        {landing.categoriesLabel}
      </h2>
      <div className="mw-marquee mt-8 md:mt-10">
        <MarqueeTrack copies={PASSES_PER_HALF * 2 - 1} duration="48s">
          {CATEGORIES.map((item) => (
            <li key={item.name}>
              <Link
                href={wallpapersGalleryPath(categorySlugFromName(item.name))}
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
                <span className="sr-only"> wallpapers</span>
              </Link>
            </li>
          ))}
        </MarqueeTrack>
      </div>
      <HomeBrowseLinks className="mt-12 md:mt-14" />
    </MarketingSection>
  )
}
