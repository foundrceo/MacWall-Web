import {
  Compass,
  FolderHeart,
  Image as ImageIcon,
  LifeBuoy,
  Monitor,
  MousePointerClick,
  PanelTop,
  Search,
  Share2,
  Shuffle,
  Upload,
  Volume2,
  type LucideIcon,
} from "lucide-react"

import { LandingSectionHeader } from "@/components/macwall-marketing/landing-section-header"
import {
  LANDING_CARD,
  LANDING_SECTION_END,
  MarketingSection,
} from "@/components/macwall-marketing/marketing-section"
import { cn } from "@/lib/utils"
import { FeatureCard } from "@/components/ui/grid-feature-cards"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"

const ICONS: Record<string, LucideIcon> = {
  explore: Compass,
  set: MousePointerClick,
  search: Search,
  menubar: PanelTop,
  displays: Monitor,
  shuffle: Shuffle,
  sound: Volume2,
  stills: ImageIcon,
  library: FolderHeart,
  upload: Upload,
  share: Share2,
  help: LifeBuoy,
}

/** Every feature at a glance: efferd's grid with Aceternity's hover. */
export function Everything() {
  const everything = macwallMarketingCopy.home.everything

  return (
    <MarketingSection
      id="everything"
      aria-labelledby="everything-heading"
      sectionClassName={LANDING_SECTION_END}
    >
      <LandingSectionHeader
        id="everything-heading"
        title={everything.title}
        lead={everything.lead}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {everything.items.map((item, index) => (
          <FeatureCard
            key={item.title}
            className={cn(LANDING_CARD, "p-6")}
            glow={index >= everything.items.length - 4 ? "down" : "up"}
            feature={{
              title: item.title,
              icon: ICONS[item.icon] ?? Compass,
              description: item.body,
            }}
          >
            {"shortcut" in item ? (
              <kbd className="absolute top-6 right-6 rounded-md bg-surface-3 px-1.5 py-0.5 font-sans text-[11px] text-muted-foreground">
                {item.shortcut}
              </kbd>
            ) : null}
          </FeatureCard>
        ))}
      </div>
    </MarketingSection>
  )
}
