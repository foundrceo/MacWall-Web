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

import {
  landingBlockPad,
  LandingSectionHeader,
} from "@/components/macwall-marketing/landing-section-header"
import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { cn } from "@/lib/utils"

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

/** Every feature at a glance: icon, name, one line. No media on purpose. */
export function Everything() {
  const everything = macwallMarketingCopy.home.everything

  return (
    <MarketingSection id="everything" aria-labelledby="everything-heading">
      <LandingSectionHeader
        id="everything-heading"
        title={everything.title}
        lead={everything.lead}
      />
      <ul className="grid grid-cols-1 divide-x divide-y divide-dashed divide-border border-t border-dashed border-border sm:grid-cols-2 lg:grid-cols-4">
        {everything.items.map((item) => {
          const Icon = ICONS[item.icon] ?? Compass
          return (
            <li
              key={item.title}
              className={cn(
                landingBlockPad,
                "flex min-w-0 flex-col gap-5 py-8 transition-colors hover:bg-card/80"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground">
                  <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                </span>
                {"shortcut" in item ? (
                  <kbd className="rounded-md border border-border px-2 py-0.5 font-sans text-xs text-muted-foreground">
                    {item.shortcut}
                  </kbd>
                ) : null}
              </div>
              <div>
                <h3 className="text-lg tracking-tight text-foreground">{item.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </MarketingSection>
  )
}
