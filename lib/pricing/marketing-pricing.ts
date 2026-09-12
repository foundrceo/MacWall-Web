import {
  LICENSE_OFFERS,
  MULTI_MAC_OFFER_SLUGS,
  indiaDiscountPercentOff,
  licenseOfferCheckoutPath,
  licenseOfferPriceCents,
  type LicenseOfferSlug,
} from "@/lib/license/offers.shared"
import { isIndiaCountry } from "@/lib/geo/country"
import { macwall } from "@/lib/macwall-site"
import {
  convertUsdCentsWithRate,
  formatMoney,
  type LocalizedMoney,
} from "@/lib/pricing/money"

export type MarketingMultiMacOffer = {
  slug: LicenseOfferSlug
  macs: number
  price: string
  priceMajor: number
  strikePrice: string
  strikePriceMajor: number
  /** e.g. "50% off" — matches sale vs cutted price */
  offLabel: string
  /** When primary is local: "$7.99 USD". When primary is USD: null. */
  localPriceHint: string | null
  checkoutUrl: string
  currency: string
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
  /** When primary is local: "$7.99 USD". Otherwise null. */
  permanentLocalHint: string | null
  /**
   * Banner strip prices — local presentment when FX is available;
   * otherwise catalog USD (India $3.99 / strike $14.99).
   */
  bannerSalePrice: string
  bannerStrikePrice: string
  annualPrice: string
  annualPriceMajor: number
  salePrice: string
  fullPrice: string
  suffix: string
  getProCta: string
  getProPlusCta: string
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
const PRO_STRIKE_USD_CENTS = LICENSE_OFFERS.permanent.strikeUsdCents
const PRO_PLUS_USD_CENTS = LICENSE_OFFERS.permanent_5.usdCents
const PRO_PLUS_STRIKE_USD_CENTS = LICENSE_OFFERS.permanent_5.strikeUsdCents
const ANNUAL_USD_CENTS = LICENSE_OFFERS.annual.usdCents

/** Shared buy-button labels — same on home, pricing, modal, and gallery. */
export const MARKETING_GET_PRO_CTA = "Get Pro"
export const MARKETING_GET_PRO_PLUS_CTA = "Get Pro+"

/** India catalog Prices ($3.99 Pro · $6.99 Pro+ 5-Mac). */
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

/** Secondary line under a local primary price (catalog USD). */
function usdCatalogHint(usdCents: number, locale = "en-US"): string {
  return `${formatMoney(usdCents / 100, "usd", locale)} USD`
}

export type MarketingFxRate = {
  currency: string
  locale: string
  usdPerUnit: number
}

export type MarketingPriceBundle = {
  country: string | null
  /** Optional Stripe FX local equivalents (null / USD → no hint). */
  permanentLocal: LocalizedMoney | null
  /** @deprecated Prefer `fx` + per-pack conversion. Kept for Pro+ 5-Mac callers. */
  proPlusLocal: LocalizedMoney | null
  /** When set, every multi-Mac pack uses this rate for local primary prices. */
  fx?: MarketingFxRate | null
}

function localMoneyFromFx(
  usdCents: number,
  fx: MarketingFxRate
): LocalizedMoney {
  const major = convertUsdCentsWithRate(usdCents, fx.currency, fx.usdPerUnit)
  return {
    currency: fx.currency,
    locale: fx.locale,
    major,
    formatted: formatMoney(major, fx.currency, fx.locale),
    isLocalized: true,
  }
}

export function buildMarketingPricingFromLocalized(
  bundle: MarketingPriceBundle
): MarketingPricing {
  const { country, permanentLocal, proPlusLocal, fx } = bundle
  const india = isIndiaCountry(country)
  const region = india ? "india" : "default"

  const permanentSaleCents = india ? PRO_INDIA_USD_CENTS : PRO_USD_CENTS
  const useLocal =
    Boolean(fx && fx.currency !== "usd") ||
    Boolean(permanentLocal?.isLocalized)
  const activeFx: MarketingFxRate | null =
    fx && fx.currency !== "usd"
      ? fx
      : permanentLocal?.isLocalized
        ? {
            currency: permanentLocal.currency,
            locale: permanentLocal.locale,
            usdPerUnit:
              permanentLocal.major > 0
                ? permanentSaleCents / 100 / permanentLocal.major
                : 0,
          }
        : null

  const permanentUsd = usdMoney(permanentSaleCents)
  const permanentStrikeUsd = usdMoney(PRO_STRIKE_USD_CENTS)
  const permanent =
    useLocal && activeFx
      ? (permanentLocal?.isLocalized
          ? permanentLocal
          : localMoneyFromFx(permanentSaleCents, activeFx))
      : permanentUsd
  const permanentStrike =
    useLocal && activeFx
      ? localMoneyFromFx(PRO_STRIKE_USD_CENTS, activeFx)
      : permanentStrikeUsd
  const annual = usdMoney(
    india ? LICENSE_OFFERS.annual.indiaUsdCents : ANNUAL_USD_CENTS
  )

  const permanentPrice = permanent.formatted
  const permanentStrikePrice = permanentStrike.formatted
  const permanentLocalHint = useLocal
    ? usdCatalogHint(permanentSaleCents)
    : null
  const permanentOffLabel = offLabel(PRO_STRIKE_USD_CENTS, permanentSaleCents)

  const bannerSalePrice = permanentPrice
  const bannerStrikePrice = permanentStrikePrice

  const multiMacOffers: MarketingMultiMacOffer[] = MULTI_MAC_OFFER_SLUGS.map(
    (slug) => {
      const offer = LICENSE_OFFERS[slug]
      const saleCents = licenseOfferPriceCents(offer, region)
      const sale =
        useLocal && activeFx
          ? slug === "permanent_5" && proPlusLocal?.isLocalized
            ? proPlusLocal
            : localMoneyFromFx(saleCents, activeFx)
          : usdMoney(saleCents)
      const strike =
        useLocal && activeFx
          ? localMoneyFromFx(offer.strikeUsdCents, activeFx)
          : usdMoney(offer.strikeUsdCents)
      return {
        slug: offer.slug,
        macs: offer.maxDevices,
        price: sale.formatted,
        priceMajor: sale.major,
        strikePrice: strike.formatted,
        strikePriceMajor: strike.major,
        offLabel: offLabel(offer.strikeUsdCents, saleCents),
        localPriceHint: useLocal ? usdCatalogHint(saleCents) : null,
        checkoutUrl: licenseOfferCheckoutPath(slug),
        currency: sale.currency,
      }
    }
  )

  const displayCurrency = permanent.currency
  const displayLocale = permanent.locale

  return {
    country,
    currency: displayCurrency,
    locale: displayLocale,
    isLocalized: useLocal,
    isIndia: india,
    permanentPrice,
    permanentPriceMajor: permanent.major,
    permanentStrikePrice,
    permanentStrikePriceMajor: permanentStrike.major,
    permanentOffLabel,
    permanentLocalHint,
    bannerSalePrice,
    bannerStrikePrice,
    annualPrice: annual.formatted,
    annualPriceMajor: annual.major,
    salePrice: permanentPrice,
    fullPrice: permanentStrikePrice,
    suffix: "permanent",
    getProCta: MARKETING_GET_PRO_CTA,
    getProPlusCta: MARKETING_GET_PRO_PLUS_CTA,
    buyProCta: MARKETING_GET_PRO_CTA,
    buyProAria: `Get ${macwall.name} Pro`,
    bannerHeadline: "Pay once, keep Pro forever",
    bannerSubline: "One-time license, lifetime updates",
    bannerCta: "See pricing",
    priceLine: india
      ? `Pro is ${permanentPrice} in India (${permanentOffLabel} off ${permanentStrikePrice}). Pay once, no subscription.`
      : `Pro is ${permanentPrice} right now (normally ${permanentStrikePrice}). Pay once, no subscription.`,
    pricingHeroLead: india
      ? `Pro is ${permanentPrice} in India today, or post a Reel and get your money back.`
      : `Pro is ${permanentPrice} today, or post a Reel and get your money back.`,
    pricingPermanentDescription: india
      ? `Pay ${permanentPrice} once (${permanentOffLabel} off ${permanentStrikePrice}) and keep Pro forever, updates included.`
      : `Pay ${permanentPrice} once (normally ${permanentStrikePrice}) and keep Pro forever, updates included.`,
    pricingAnnualDescription: `The annual plan is retired for new purchases. Get the ${permanentPrice} lifetime license instead.`,
    bottomCtaLabel: MARKETING_GET_PRO_CTA,
    checkoutUrl: licenseOfferCheckoutPath("permanent"),
    annualCheckoutUrl: licenseOfferCheckoutPath("permanent"),
    multiMacOffers,
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
