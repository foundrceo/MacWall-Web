import { connection } from "next/server"

import {
  buildDefaultMarketingPricing,
  type MarketingPricing,
} from "@/lib/pricing/marketing-pricing"

/** Marketing prices are the same worldwide — no geo-specific offers. */
export async function resolveMarketingPricing(): Promise<MarketingPricing> {
  await connection()
  return buildDefaultMarketingPricing()
}
