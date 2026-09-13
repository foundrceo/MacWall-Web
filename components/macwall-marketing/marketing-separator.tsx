import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import { cn } from "@/lib/utils"

/** Hatch strip inside the dashed column, with plus-cross corners. */
export function MarketingSeparator({ className }: Readonly<{ className?: string }>) {
  return (
    <MarketingSection>
      <div className={cn("h-8 bg-dashed", className)} aria-hidden />
    </MarketingSection>
  )
}
