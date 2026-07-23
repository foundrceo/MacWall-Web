/** License tiers — Pro (3 Macs) and Pro Max (5 Macs). */

export const LICENSE_PLAN_SLUGS = ["pro", "pro_max"] as const
export type LicensePlanSlug = (typeof LICENSE_PLAN_SLUGS)[number]

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
    strikePrice: "$9.99",
    description:
      "Full catalog, Lock Screen video, and lifetime updates on up to 3 personal Macs.",
    featureHighlight: "Best for most people",
    buyCta: "Buy Pro for $7.99",
  },
  pro_max: {
    slug: "pro_max",
    name: "Pro Max",
    badge: "5 Macs",
    maxDevices: 5,
    price: "$14.99",
    strikePrice: "$19.99",
    description:
      "Everything in Pro for up to five personal Macs you own.",
    featureHighlight: "Power users with more machines",
    buyCta: "Buy Pro Max for $14.99",
  },
}

export const DEFAULT_LICENSE_PLAN_SLUG: LicensePlanSlug = "pro"

export function isLicensePlanSlug(
  value: string | null | undefined
): value is LicensePlanSlug {
  if (!value) return false
  return (LICENSE_PLAN_SLUGS as readonly string[]).includes(value)
}

export function licensePlanFromSlug(
  slug: string | null | undefined
): LicensePlan {
  if (isLicensePlanSlug(slug)) return LICENSE_PLANS[slug]
  return LICENSE_PLANS[DEFAULT_LICENSE_PLAN_SLUG]
}

export function licensePlanCheckoutPath(slug: LicensePlanSlug): string {
  return `/api/checkout/create-session?plan=${slug}`
}

export function deviceLimitUserMessage(maxDevices: number): string {
  if (maxDevices <= 1) {
    return "This license is already in use on another Mac. Buy another license at macwall.app/pricing for your other machine."
  }
  return `This license is already active on ${maxDevices} Macs. Unlink a device in Settings → Devices on one of your linked Macs, or upgrade to Pro Max at macwall.app/pricing.`
}

export function macsLabel(count: number): string {
  return count === 1 ? "1 Mac" : `${count} Macs`
}