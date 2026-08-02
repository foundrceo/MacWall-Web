export const LICENSE_OFFER_SLUGS = [
  "permanent",
  "annual",
  "permanent_5",
] as const

export type LicenseOfferSlug = (typeof LICENSE_OFFER_SLUGS)[number]
export type LicenseBillingModel = "permanent" | "annual"
export type PricingRegion = "default" | "india"

/** Stripe coupon auto-applied for India Checkout (catalog Prices + all PM). */
export const INDIA_CHECKOUT_COUPON_ID = "INDIA50"

export type LicenseOffer = {
  slug: LicenseOfferSlug
  name: string
  billingModel: LicenseBillingModel
  maxDevices: 3 | 5
  usdCents: number
  /**
   * India display amount after INDIA50 (50% off catalog).
   * Matches Stripe half-cent rounding: $9.99→$4.99, $14.99→$7.49.
   */
  indiaUsdCents: number
}

/** Percent off vs catalog USD (rounded). INDIA50 = 50%. */
export function indiaDiscountPercentOff(
  usdCents: number,
  indiaUsdCents: number
): number {
  if (usdCents <= 0) return 0
  return Math.round((1 - indiaUsdCents / usdCents) * 100)
}

export const LICENSE_OFFERS: Record<LicenseOfferSlug, LicenseOffer> = {
  permanent: {
    slug: "permanent",
    name: "Permanent license",
    billingModel: "permanent",
    maxDevices: 3,
    usdCents: 999,
    indiaUsdCents: 499, // $4.99 — INDIA50 on $9.99
  },
  annual: {
    slug: "annual",
    name: "Annual plan",
    billingModel: "annual",
    maxDevices: 3,
    usdCents: 499,
    indiaUsdCents: 249, // $2.49 — INDIA50 on $4.99
  },
  permanent_5: {
    slug: "permanent_5",
    name: "5-Mac permanent license",
    billingModel: "permanent",
    maxDevices: 5,
    usdCents: 1499,
    indiaUsdCents: 749, // $7.49 — INDIA50 on $14.99
  },
}

export const DEFAULT_LICENSE_OFFER_SLUG: LicenseOfferSlug = "permanent"
export const MULTI_MAC_OFFER_SLUGS = [
  "permanent_5",
] as const satisfies readonly LicenseOfferSlug[]

/** Paid offers that auto-get INDIA50 at Checkout. */
export const INDIA_DISCOUNT_ELIGIBLE_OFFER_SLUGS = [
  "permanent",
  "annual",
  "permanent_5",
] as const satisfies readonly LicenseOfferSlug[]

export function isIndiaDiscountEligible(slug: LicenseOfferSlug): boolean {
  return (INDIA_DISCOUNT_ELIGIBLE_OFFER_SLUGS as readonly string[]).includes(
    slug
  )
}

export function isLicenseOfferSlug(
  value: string | null | undefined
): value is LicenseOfferSlug {
  if (!value) return false
  return (LICENSE_OFFER_SLUGS as readonly string[]).includes(value)
}

export function normalizeLicenseOfferSlug(
  value: string | null | undefined
): LicenseOfferSlug {
  // Annual is retired — old ?offer=annual links become permanent one-time.
  if (value === "annual") return "permanent"

  if (isLicenseOfferSlug(value)) return value

  // Preserve old shared checkout links while moving off Pro / Pro Plus.
  if (value === "pro_plus" || value === "pro_max") return "permanent_5"
  return DEFAULT_LICENSE_OFFER_SLUG
}

export function licenseOfferFromSlug(
  slug: string | null | undefined
): LicenseOffer {
  return LICENSE_OFFERS[normalizeLicenseOfferSlug(slug)]
}

export function licenseOfferPriceCents(
  offer: LicenseOffer,
  region: PricingRegion
): number {
  return region === "india" ? offer.indiaUsdCents : offer.usdCents
}

export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function licenseOfferCheckoutPath(slug: LicenseOfferSlug): string {
  return `/api/checkout/create-session?${new URLSearchParams({ offer: slug }).toString()}`
}
