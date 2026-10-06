import { Play } from "lucide-react"

import { DeferredVideo } from "@/components/macwall-marketing/deferred-video"
import {
  marketingMediaSlots,
  type MarketingMediaSlot as Slot,
  type MarketingMediaSlotId,
} from "@/lib/marketing-media-slots"

/**
 * A recording on the home page. Until its file exists the frame stays empty,
 * with a dashed border and the name of what goes there.
 */
export function MarketingMediaSlot({ id }: Readonly<{ id: MarketingMediaSlotId }>) {
  const slot: Slot = marketingMediaSlots[id]

  if (slot.src) {
    return <DeferredVideo src={slot.src} poster={slot.poster} label={slot.label} />
  }

  return (
    <div
      role="img"
      aria-label={`${slot.label} (recording coming soon)`}
      className="absolute inset-3 flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border px-6 text-center"
    >
      <span className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground">
        <Play className="size-3.5" aria-hidden />
      </span>
      <span className="text-sm tracking-tight text-foreground">{slot.label}</span>
      <span className="max-w-xs text-xs leading-relaxed text-muted-foreground">
        {slot.note}
      </span>
    </div>
  )
}
