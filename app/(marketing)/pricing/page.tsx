import MacWallMarketingPricingPage from "@/components/macwall-marketing/marketing-pricing"
import { macwall } from "@/lib/macwall-site"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: `Pricing — ${macwall.name}`,
  description: `Pro pricing for ${macwall.name}: one-time license, free tier, and what you unlock on macOS.`,
  alternates: { canonical: `${macwall.website}/pricing` },
}

export default function PricingPage() {
  return <MacWallMarketingPricingPage />
}
