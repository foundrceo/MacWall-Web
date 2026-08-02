import {
  LICENSE_OFFERS,
  indiaDiscountPercentOff,
  licenseOfferCheckoutPath,
  type LicenseOfferSlug,
} from "@/lib/license/offers.shared"
import { isIndiaCountry } from "@/lib/geo/country"
import { macwall } from "@/lib/macwall-site"
import { formatMoney, type LocalizedMoney } from "@/lib/pricing/money"

export type MarketingMultiMacOffer = {
  slug: LicenseOfferSlug
  macs: 5
  price: string
  priceMajor: number
  strikePrice: string
  strikePriceMajor: number
  /** e.g. "40% off" — matches sale vs cutted price */
  offLabel: string
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
  /** e.g. "33% off" — matches sale vs cutted price */
  permanentOffLabel: string
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

/** Global catalog USD amounts. */
const PRO_USD_CENTS = LICENSE_OFFERS.permanent.usdCents
const PRO_STRIKE_USD_CENTS = 1499
const PRO_PLUS_USD_CENTS = LICENSE_OFFERS.permanent_5.usdCents
const PRO_PLUS_STRIKE_USD_CENTS = 2499
const ANNUAL_USD_CENTS = LICENSE_OFFERS.annual.usdCents

/** India catalog Prices ($3.99 Pro · $6.99 Pro+). */
const PRO_INDIA_USD_CENTS = LICENSE_OFFERS.permanent.indiaUsdCents
const PRO_PLUS_INDIA_USD_CENTS = LICENSE_OFFERS.permanent_5.indiaUsdCents

function offLabel(strikeCents: number, saleCents: number): string {
  return `${indiaDiscountPercentOff(strikeCents, saleCents)}% off`
}

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
  const india = isIndiaCountry(country)

  // India: $3.99 / $6.99 sale; same higher cutted “was” prices as everyone else.
  const permanentSaleCents = india ? PRO_INDIA_USD_CENTS : PRO_USD_CENTS
  const proPlusSaleCents = india ? PRO_PLUS_INDIA_USD_CENTS : PRO_PLUS_USD_CENTS
  const permanent = usdMoney(permanentSaleCents)
  const permanentStrike = usdMoney(PRO_STRIKE_USD_CENTS)
  const annual = usdMoney(
    india ? LICENSE_OFFERS.annual.indiaUsdCents : ANNUAL_USD_CENTS
  )
  const proPlus = usdMoney(proPlusSaleCents)
  const proPlusStrike = usdMoney(PRO_PLUS_STRIKE_USD_CENTS)

  const permanentPrice = permanent.formatted
  const permanentStrikePrice = permanentStrike.formatted
  const permanentLocalHint = localHint(permanentLocal)
  const proPlusLocalHint = localHint(proPlusLocal)
  const permanentOffLabel = offLabel(PRO_STRIKE_USD_CENTS, permanentSaleCents)
  const proPlusOffLabel = offLabel(PRO_PLUS_STRIKE_USD_CENTS, proPlusSaleCents)

  return {
    country,
    currency: "usd",
    locale: "en-US",
    isLocalized: Boolean(permanentLocalHint),
    isIndia: india,
    permanentPrice,
    permanentPriceMajor: permanent.major,
    permanentStrikePrice,
    permanentStrikePriceMajor: permanentStrike.major,
    permanentOffLabel,
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
    priceLine: india
      ? `India Pro ${permanentPrice} (${permanentOffLabel} ${permanentStrikePrice}). No subscription.`
      : `Limited Pro ${permanentPrice} (was ${permanentStrikePrice}). No subscription.`,
    pricingHeroLead: india
      ? `Claim Pro at the India price — or earn 100% back with a Reel.`
      : `Claim Pro at the limited price — or earn 100% back with a Reel.`,
    pricingPermanentDescription: india
      ? `Pay ${permanentPrice} once (${permanentOffLabel} ${permanentStrikePrice}) and keep Pro forever, with updates included.`
      : `Pay ${permanentPrice} once (was ${permanentStrikePrice}) and keep Pro forever, with updates included.`,
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
        offLabel: proPlusOffLabel,
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
  PRO_INDIA_USD_CENTS,
  PRO_PLUS_INDIA_USD_CENTS,
  ANNUAL_USD_CENTS,
}
