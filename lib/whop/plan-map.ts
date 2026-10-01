import "server-only"

import type {
  LicenseOfferSlug,
  PricingRegion,
} from "@/lib/license/offers.shared"

/**
 * Whop catalog (2026-10), product "MacWall Pro" (prod_IaiyXNe2zAql9) in the
 * MacWall business. One one-time plan per pack and region; each plan's
 * metadata carries `offer_slug`, `max_devices` and `pricing_region`.
 *
 *   Pack              Global (USD)                    India (USD, hidden)
 *   Pro · 3 Macs      plan_usKwVg6qqu3Xd   $12.99     plan_zcQVqY47Kyes6   $4.99
 *   Pro+ · 5 Macs     plan_pcrr5GziIG8Y5   $19.99     plan_s8pA6GNn2zcgp   $7.99
 *   Pro+ · 10 Macs    plan_yAjmP1nZiMBzV   $34.99     plan_57rkMB7VgtQWu  $12.99
 *
 * Whop has no Checkout cross-sells, so the 10-Mac pack is its own plan.
 * Every ID can be overridden with an env var (see .env.example).
 */
type Pack = "pro" | "proPlus" | "pro10"

function envPlan(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback
}

const PLANS: Record<PricingRegion, Record<Pack, string>> = {
  default: {
    pro: envPlan("WHOP_PLAN_PRO_GLOBAL", "plan_usKwVg6qqu3Xd"),
    proPlus: envPlan("WHOP_PLAN_PRO_PLUS_GLOBAL", "plan_pcrr5GziIG8Y5"),
    pro10: envPlan("WHOP_PLAN_PRO_10_GLOBAL", "plan_yAjmP1nZiMBzV"),
  },
  india: {
    pro: envPlan("WHOP_PLAN_PRO_INDIA", "plan_zcQVqY47Kyes6"),
    proPlus: envPlan("WHOP_PLAN_PRO_PLUS_INDIA", "plan_s8pA6GNn2zcgp"),
    pro10: envPlan("WHOP_PLAN_PRO_10_INDIA", "plan_57rkMB7VgtQWu"),
  },
}

function packForOffer(offerSlug: LicenseOfferSlug): Pack {
  switch (offerSlug) {
    case "permanent_5":
      return "proPlus"
    case "permanent_10":
    case "permanent_15":
    case "permanent_20":
      return "pro10"
    default:
      return "pro"
  }
}

export function whopPlanIdForOffer(
  offerSlug: LicenseOfferSlug,
  region: PricingRegion
): string {
  return PLANS[region][packForOffer(offerSlug)]
}
