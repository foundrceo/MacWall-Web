export const LICENSE_OFFER_SLUGS = [
  "permanent",
  "annual",
  "permanent_5",
  "permanent_10",
  "permanent_15",
  "permanent_20",
] as const

export type LicenseOfferSlug = (typeof LICENSE_OFFER_SLUGS)[number]
export type LicenseBillingModel = "permanent" | "annual"
export type PricingRegion = "default" | "india"

export type LicenseOffer = {
  slug: LicenseOfferSlug
  name: string
  billingModel: LicenseBillingModel
  maxDevices: number
  usdCents: number
  /** India catalog Price amount (separate Stripe Prices, no coupon). */
  indiaUsdCents: number
  /** Marketing strike / “was” price (USD cents). */
  strikeUsdCents: number
}

/** Percent off vs catalog USD (rounded). */
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
    usdCents: 799, // $7.99 global
    indiaUsdCents: 399, // $3.99 India
    strikeUsdCents: 1499,
  },
  annual: {
    slug: "annual",
    name: "Annual plan",
    billingModel: "annual",
    maxDevices: 3,
    usdCents: 499,
    indiaUsdCents: 199,
    strikeUsdCents: 499,
  },
  permanent_5: {
    slug: "permanent_5",
    name: "5-Mac permanent license",
    billingModel: "permanent",
    maxDevices: 5,
    usdCents: 1299, // $12.99
    indiaUsdCents: 699, // $6.99
    strikeUsdCents: 2499,
  },
  /** Volume packs — discount steps up ~+2pts vs 5-Mac after each tier. */
  permanent_10: {
    slug: "permanent_10",
    name: "10-Mac permanent license",
    billingModel: "permanent",
    maxDevices: 10,
    usdCents: 2499, // $24.99 (~50% off)
    indiaUsdCents: 1299, // $12.99
    strikeUsdCents: 4999,
  },
  permanent_15: {
    slug: "permanent_15",
    name: "15-Mac permanent license",
    billingModel: "permanent",
    maxDevices: 15,
    usdCents: 3399, // $33.99 (~55% off)
    indiaUsdCents: 1799, // $17.99
    strikeUsdCents: 7499,
  },
  permanent_20: {
    slug: "permanent_20",
    name: "20-Mac permanent license",
    billingModel: "permanent",
    maxDevices: 20,
    usdCents: 3999, // $39.99 (~60% off)
    indiaUsdCents: 2199, // $21.99
    strikeUsdCents: 9999,
  },
}

export const DEFAULT_LICENSE_OFFER_SLUG: LicenseOfferSlug = "permanent"
export const MULTI_MAC_OFFER_SLUGS = [
  "permanent_5",
  "permanent_10",
  "permanent_15",
  "permanent_20",
] as const satisfies readonly LicenseOfferSlug[]

export const INDIA_DISCOUNT_ELIGIBLE_OFFER_SLUGS = [
  "permanent",
  "annual",
  "permanent_5",
  "permanent_10",
  "permanent_15",
  "permanent_20",
] as const satisfies readonly LicenseOfferSlug[]

export function isIndiaDiscountEligible(slug: LicenseOfferSlug): boolean {
  return (INDIA_DISCOUNT_ELIGIBLE_OFFER_SLUGS as readonly string[]).includes(
    slug
  )
}

export function isMultiMacOfferSlug(
  value: string | null | undefined
): value is (typeof MULTI_MAC_OFFER_SLUGS)[number] {
  return (MULTI_MAC_OFFER_SLUGS as readonly string[]).includes(value ?? "")
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
