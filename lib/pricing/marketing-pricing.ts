import {
  LICENSE_OFFERS,
  licenseOfferCheckoutPath,
  type LicenseOfferSlug,
} from "@/lib/license/offers.shared"
import { isIndiaCountry } from "@/lib/geo/country"
import { macwall } from "@/lib/macwall-site"
import {
  formatMoney,
  type LocalizedMoney,
} from "@/lib/pricing/money"

export type MarketingMultiMacOffer = {
  slug: LicenseOfferSlug
  macs: 5
  price: string
  priceMajor: number
  strikePrice: string
  strikePriceMajor: number
  /** Non-US only: ≈ local · charged in INR */
  localPriceHint: string | null
  checkoutUrl: string
}

export type MarketingPricing = {
  country: string | null
  /** Always USD — catalog / Checkout integration currency. */
  currency: string
  locale: string
  isLocalized: boolean
  isIndia: boolean
  permanentPrice: string
  permanentPriceMajor: number
  permanentStrikePrice: string
  permanentStrikePriceMajor: number
  /** Non-US only: ≈ ₹… · charged in INR */
  permanentLocalHint: string | null
  annualPrice: string
  annualPriceMajor: number
  salePrice: string
  fullPrice: string
  suffix: string
  getProCta: string
  buyProCta: string
  buyProAria: string
  bannerHeadline: string
  bannerSubline: string
  bannerCta: string
  priceLine: string
  pricingHeroLead: string
  pricingPermanentDescription: string
  pricingAnnualDescription: string
  bottomCtaLabel: string
  checkoutUrl: string
  annualCheckoutUrl: string
  multiMacOffers: MarketingMultiMacOffer[]
}

/** USD list / strike anchors — local hint uses Stripe FX for non-US visitors. */
const PRO_USD_CENTS = LICENSE_OFFERS.permanent.usdCents
const PRO_STRIKE_USD_CENTS = 1499
const PRO_PLUS_USD_CENTS = LICENSE_OFFERS.permanent_5.usdCents
const PRO_PLUS_STRIKE_USD_CENTS = 2499
const ANNUAL_USD_CENTS = LICENSE_OFFERS.annual.usdCents

function usdMoney(cents: number, locale = "en-US"): LocalizedMoney {
  const major = cents / 100
  return {
    currency: "usd",
    locale,
    major,
    formatted: formatMoney(major, "usd", locale),
    isLocalized: false,
  }
}

function localHint(local: LocalizedMoney | null | undefined): string | null {
  if (!local?.isLocalized) return null
  return `≈ ${local.formatted} · charged in ${local.currency.toUpperCase()}`
}

export type MarketingPriceBundle = {
  country: string | null
  /** Optional Stripe FX local equivalents (null / USD → no hint). */
  permanentLocal: LocalizedMoney | null
  proPlusLocal: LocalizedMoney | null
}

export function buildMarketingPricingFromLocalized(
  bundle: MarketingPriceBundle
): MarketingPricing {
  const { country, permanentLocal, proPlusLocal } = bundle
  const permanent = usdMoney(PRO_USD_CENTS)
  const permanentStrike = usdMoney(PRO_STRIKE_USD_CENTS)
  const annual = usdMoney(ANNUAL_USD_CENTS)
  const proPlus = usdMoney(PRO_PLUS_USD_CENTS)
  const proPlusStrike = usdMoney(PRO_PLUS_STRIKE_USD_CENTS)

  const permanentPrice = permanent.formatted
  const permanentStrikePrice = permanentStrike.formatted
  const permanentLocalHint = localHint(permanentLocal)
  const proPlusLocalHint = localHint(proPlusLocal)

  return {
    country,
    currency: "usd",
    locale: "en-US",
    isLocalized: Boolean(permanentLocalHint),
    isIndia: isIndiaCountry(country),
    permanentPrice,
    permanentPriceMajor: permanent.major,
    permanentStrikePrice,
    permanentStrikePriceMajor: permanentStrike.major,
    permanentLocalHint,
    annualPrice: annual.formatted,
    annualPriceMajor: annual.major,
    salePrice: permanentPrice,
    fullPrice: permanentStrikePrice,
    suffix: "permanent",
    getProCta: "Get Pro",
    buyProCta: `Unlock Pro forever for ${permanentPrice}`,
    buyProAria: `Buy a permanent ${macwall.name} Pro license for ${permanentPrice}`,
    bannerHeadline: "Limited sale is live — buy before it ends",
    bannerSubline: "Limited sale is live — buy before it ends",
    bannerCta: "Buy now 🔥",
    priceLine: `Limited Pro ${permanentPrice} (was ${permanentStrikePrice}). No subscription.`,
    pricingHeroLead: `Claim Pro at the limited price — or earn 100% back with a Reel.`,
    pricingPermanentDescription: `Pay ${permanentPrice} once (was ${permanentStrikePrice}) and keep Pro forever, with updates included.`,
    pricingAnnualDescription: `Legacy annual plans are no longer offered for new purchases. Choose the permanent ${permanentPrice} license instead.`,
    bottomCtaLabel: "Get Pro",
    checkoutUrl: licenseOfferCheckoutPath("permanent"),
    annualCheckoutUrl: licenseOfferCheckoutPath("permanent"),
    multiMacOffers: [
      {
        slug: LICENSE_OFFERS.permanent_5.slug,
        macs: 5,
        price: proPlus.formatted,
        priceMajor: proPlus.major,
        strikePrice: proPlusStrike.formatted,
        strikePriceMajor: proPlusStrike.major,
        localPriceHint: proPlusLocalHint,
        checkoutUrl: licenseOfferCheckoutPath("permanent_5"),
      },
    ],
  }
}

/** Sync USD fallback for client context default before hydration. */
export function buildDefaultMarketingPricing(): MarketingPricing {
  return buildMarketingPricingFromLocalized({
    country: null,
    permanentLocal: null,
    proPlusLocal: null,
  })
}

export {
  PRO_USD_CENTS,
  PRO_STRIKE_USD_CENTS,
  PRO_PLUS_USD_CENTS,
  PRO_PLUS_STRIKE_USD_CENTS,
  ANNUAL_USD_CENTS,
}
