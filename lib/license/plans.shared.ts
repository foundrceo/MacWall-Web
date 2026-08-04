/** License tiers — Pro (3 Macs) and Pro Plus (5 Macs). */

export const LICENSE_PLAN_SLUGS = ["pro", "pro_plus"] as const
export type LicensePlanSlug = (typeof LICENSE_PLAN_SLUGS)[number]

/** Legacy slug from early tier naming — treated as Pro Plus at runtime. */
export const LEGACY_PRO_PLUS_SLUG = "pro_max" as const

export type LicensePlan = {
  slug: LicensePlanSlug
  name: string
  badge: string
  maxDevices: number
  price: string
  strikePrice: string | null
  description: string
  featureHighlight: string
  buyCta: string
}

export const LICENSE_PLANS: Record<LicensePlanSlug, LicensePlan> = {
  pro: {
    slug: "pro",
    name: "Pro",
    badge: "3 Macs",
    maxDevices: 3,
    price: "$7.99",
    strikePrice: "$14.99",
    description:
      "Complete catalog, Lock Screen video, and lifetime updates on up to 3 personal Macs — elite craftsmanship.",
    featureHighlight: "Most effective for most clients",
    buyCta: "Invest in Pro for $7.99",
  },
  pro_plus: {
    slug: "pro_plus",
    name: "Pro+",
    badge: "5 Macs",
    maxDevices: 5,
    price: "$12.99",
    strikePrice: "$24.99",
    description:
      "Everything in Pro for up to five personal Macs you own — a tailored large-scale program.",
    featureHighlight: "Professionals with more machines",
    buyCta: "Invest in Pro+ for $12.99",
  },
}

export const DEFAULT_LICENSE_PLAN_SLUG: LicensePlanSlug = "pro"

export function isLicensePlanSlug(
  value: string | null | undefined
): value is LicensePlanSlug {
  if (!value) return false
  return (LICENSE_PLAN_SLUGS as readonly string[]).includes(value)
}

export function normalizePlanSlug(
  value: string | null | undefined
): LicensePlanSlug {
  if (value === LEGACY_PRO_PLUS_SLUG || value === "pro_plus") return "pro_plus"
  if (value === "pro") return "pro"
  return DEFAULT_LICENSE_PLAN_SLUG
}

export function licensePlanFromSlug(
  slug: string | null | undefined
): LicensePlan {
  return LICENSE_PLANS[normalizePlanSlug(slug)]
}

export function licensePlanCheckoutPath(
  slug: LicensePlanSlug,
  options?: { promo?: string | null }
): string {
  const params = new URLSearchParams({ plan: slug })
  const promo = options?.promo?.trim()
  if (promo) params.set("promo", promo)
  return `/api/checkout/create-session?${params.toString()}`
}

export function deviceLimitUserMessage(maxDevices: number): string {
  if (maxDevices <= 1) {
    return "This license is already in use on another Mac. Invest in another license at macwall.app/pricing for your other machine."
  }
  if (maxDevices >= 5) {
    return `This license is already active on ${maxDevices} Macs. Unlink a device in Settings → Devices on one of your linked Macs, then try again.`
  }
  return `This license is already active on ${maxDevices} Macs. Unlink a device in Settings → Devices on one of your linked Macs, or elevate to Pro Plus at macwall.app/pricing.`
}

export function macsLabel(count: number): string {
  return count === 1 ? "1 Mac" : `${count} Macs`
}