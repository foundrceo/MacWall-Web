import "server-only"

import {
  DEFAULT_LICENSE_PLAN_SLUG,
  LICENSE_PLANS,
  type LicensePlanSlug,
  deviceLimitUserMessage,
  isLicensePlanSlug,
  licensePlanFromSlug,
  macsLabel,
  normalizePlanSlug,
} from "@/lib/license/plans.shared"

export {
  DEFAULT_LICENSE_PLAN_SLUG,
  LICENSE_PLANS,
  type LicensePlanSlug,
  deviceLimitUserMessage,
  isLicensePlanSlug,
  licensePlanFromSlug,
  macsLabel,
  normalizePlanSlug,
}

const STRIPE_PRICE_ENV_BY_SLUG: Record<LicensePlanSlug, string> = {
  pro: "STRIPE_PRICE_ID_PRO",
  pro_plus: "STRIPE_PRICE_ID_PRO_PLUS",
}

const DEFAULT_STRIPE_PRICE_BY_SLUG: Record<LicensePlanSlug, string> = {
  pro: "price_1TlWD3IZgqo0QIlX5ZpOgLSn",
  pro_plus: "price_1TpUUZIZgqo0QIlXY2Ym4gub",
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