import { CategoryCloud } from "@/components/macwall-marketing/category-cloud"
import { MarketingSection } from "@/components/macwall-marketing/marketing-section"

export function Proof() {
  return (
    <MarketingSection className="relative flex flex-col items-center justify-between gap-8 p-6 py-8 sm:flex-row sm:gap-16 md:py-10">
      <p className="text-muted-foreground sm:max-w-xs">
        Browse by category:
      </p>
      <CategoryCloud />
    </MarketingSection>
  )
}
