export const LICENSE_OFFER_SLUGS = [
  "permanent",
  "annual",
  "permanent_5",
] as const

export type LicenseOfferSlug = (typeof LICENSE_OFFER_SLUGS)[number]
export type LicenseBillingModel = "permanent" | "annual"
export type PricingRegion = "default" | "india"

export type LicenseOffer = {
  slug: LicenseOfferSlug
  name: string
  billingModel: LicenseBillingModel
  maxDevices: 3 | 5
  usdCents: number
  /** Display-only: actual India charge is usdCents with the INDIA coupon applied at checkout. */
  indiaUsdCents: number
}

export const LICENSE_OFFERS: Record<LicenseOfferSlug, LicenseOffer> = {
  permanent: {
    slug: "permanent",
    name: "Permanent license",
    billingModel: "permanent",
    maxDevices: 3,
    usdCents: 999,
    indiaUsdCents: 799,
  },
  annual: {
    slug: "annual",
    name: "Annual plan",
    billingModel: "annual",
    maxDevices: 3,
    usdCents: 499,
    indiaUsdCents: 399,
  },
  permanent_5: {
    slug: "permanent_5",
    name: "5-Mac permanent license",
    billingModel: "permanent",
    maxDevices: 5,
    // Fixed price for everyone — no India discount on the 5-Mac bundle.
    usdCents: 1499,
    indiaUsdCents: 1499,
  },
}

export const DEFAULT_LICENSE_OFFER_SLUG: LicenseOfferSlug = "permanent"
export const MULTI_MAC_OFFER_SLUGS = [
  "permanent_5",
] as const satisfies readonly LicenseOfferSlug[]

/** Offers eligible for the automatic INDIA coupon (5-Mac bundle is excluded — fixed price for everyone). */
export const INDIA_DISCOUNT_ELIGIBLE_OFFER_SLUGS = [
  "permanent",
  "annual",
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
