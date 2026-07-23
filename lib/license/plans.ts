import "server-only"

import {
  DEFAULT_LICENSE_PLAN_SLUG,
  LICENSE_PLANS,
  type LicensePlanSlug,
  deviceLimitUserMessage,
  isLicensePlanSlug,
  licensePlanFromSlug,
  macsLabel,
} from "@/lib/license/plans.shared"

export {
  DEFAULT_LICENSE_PLAN_SLUG,
  LICENSE_PLANS,
  type LicensePlanSlug,
  deviceLimitUserMessage,
  isLicensePlanSlug,
  licensePlanFromSlug,
  macsLabel,
}

const STRIPE_PRICE_ENV_BY_SLUG: Record<LicensePlanSlug, string> = {
  pro: "STRIPE_PRICE_ID_PRO",
  pro_max: "STRIPE_PRICE_ID_PRO_MAX",
}

const DEFAULT_STRIPE_PRICE_BY_SLUG: Record<LicensePlanSlug, string> = {
  pro: "price_1TlWD3IZgqo0QIlX5ZpOgLSn",
  pro_max: "price_1TpUUZIZgqo0QIlXY2Ym4gub",
}

export function getStripePriceIdForPlan(slug: LicensePlanSlug): string {
  const envKey = STRIPE_PRICE_ENV_BY_SLUG[slug]
  const fromEnv = process.env[envKey]?.trim()
  if (fromEnv) return fromEnv
  if (slug === "pro") {
    const legacy = process.env.STRIPE_PRICE_ID_USD?.trim()
    if (legacy) return legacy
  }
  return DEFAULT_STRIPE_PRICE_BY_SLUG[slug]
}