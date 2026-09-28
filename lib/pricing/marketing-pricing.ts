import {
  LICENSE_OFFERS,
  MULTI_MAC_OFFER_SLUGS,
  checkoutAddonAmount,
  licenseOfferChargeAmount,
  licenseOfferCheckoutPath,
  type LicenseOfferSlug,
  type PricingRegion,
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
  /** e.g. "$4.00" — price divided by Macs, same currency as `price`. */
  perMacPrice: string
  /** When primary is local: "$19.99 USD". When primary is USD: null. */
  localPriceHint: string | null
  checkoutUrl: string
  currency: string
}

export type MarketingPricing = {
  country: string | null
  /** Display currency (local presentment when FX is available). */
  currency: string
  locale: string
  isLocalized: boolean
  isIndia: boolean
  /** Macs covered by Pro. */
  permanentMacs: number
  permanentPrice: string
  permanentPriceMajor: number
  /** e.g. "$4.33" — Pro price divided by its Macs. */
  permanentPerMacPrice: string
  /** When primary is local: "$12.99 USD". Otherwise null. */
  permanentLocalHint: string | null
  /** Pro → Pro+ add-on offered at Checkout (Pro+ price minus Pro price). */
  proPlusUpgradePrice: string
  /** Top announcement strip copy. */
  bannerText: string
  annualPrice: string
  annualPriceMajor: number
  salePrice: string
  fullPrice: string
  suffix: string
  getProCta: string
  getProPlusCta: string
  buyProCta: string
  buyProAria: string
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
const PRO_PLUS_USD_CENTS = LICENSE_OFFERS.permanent_5.usdCents
const ANNUAL_USD_CENTS = LICENSE_OFFERS.annual.usdCents

/** India catalog USD equivalents (India is charged ₹499 / ₹799 in INR). */
const PRO_INDIA_USD_CENTS = LICENSE_OFFERS.permanent.indiaUsdCents
const PRO_PLUS_INDIA_USD_CENTS = LICENSE_OFFERS.permanent_5.indiaUsdCents

/** Shared buy-button labels — same on home, pricing, modal, and gallery. */
export const MARKETING_GET_PRO_CTA = "Get Pro"
export const MARKETING_GET_PRO_PLUS_CTA = "Get Pro+"

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

/** India catalog money — whole rupees, e.g. "₹499". */
function inrMoney(paise: number): LocalizedMoney {
  const major = paise / 100
  return {
    currency: "inr",
    locale: "en-IN",
    major,
    formatted: formatMoney(major, "inr", "en-IN"),
    isLocalized: true,
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

function perMac(money: LocalizedMoney, macs: number): string {
  return formatMoney(money.major / macs, money.currency, money.locale)
}

export function buildMarketingPricingFromLocalized(
  bundle: MarketingPriceBundle
): MarketingPricing {
  const { country, permanentLocal, proPlusLocal, fx } = bundle
  const india = isIndiaCountry(country)
  const region: PricingRegion = india ? "india" : "default"

  // India is charged in INR (₹…99 catalog prices) — never FX-converted.
  // Everyone else is charged in USD; show a local estimate when FX is known.
  const useLocal =
    !india &&
    (Boolean(fx && fx.currency !== "usd") ||
      Boolean(permanentLocal?.isLocalized))
  const activeFx: MarketingFxRate | null = !useLocal
    ? null
    : fx && fx.currency !== "usd"
      ? fx
      : permanentLocal?.isLocalized
        ? {
            currency: permanentLocal.currency,
            locale: permanentLocal.locale,
            usdPerUnit:
              permanentLocal.major > 0
                ? PRO_USD_CENTS / 100 / permanentLocal.major
                : 0,
          }
        : null

  /** Display money for an amount in this region's catalog currency. */
  const money = (minor: number): LocalizedMoney =>
    india
      ? inrMoney(minor)
      : activeFx
        ? localMoneyFromFx(minor, activeFx)
        : usdMoney(minor)
  const hint = (minor: number): string | null =>
    activeFx ? usdCatalogHint(minor) : null
  const amount = (slug: LicenseOfferSlug): number =>
    licenseOfferChargeAmount(LICENSE_OFFERS[slug], region).amount

  const permanentAmount = amount("permanent")
  const permanent =
    activeFx && permanentLocal?.isLocalized
      ? permanentLocal
      : money(permanentAmount)
  const annual = india
    ? inrMoney(LICENSE_OFFERS.annual.indiaInrPaise)
    : usdMoney(ANNUAL_USD_CENTS)

  const permanentPrice = permanent.formatted
  const permanentMacs = LICENSE_OFFERS.permanent.maxDevices
  const permanentLocalHint = hint(permanentAmount)
  const proPlusUpgradePrice = money(
    checkoutAddonAmount("upgradeProPlus", region)
  ).formatted

  const multiMacOffers: MarketingMultiMacOffer[] = MULTI_MAC_OFFER_SLUGS.map(
    (slug) => {
      const offer = LICENSE_OFFERS[slug]
      const saleAmount = amount(slug)
      const sale =
        activeFx && slug === "permanent_5" && proPlusLocal?.isLocalized
          ? proPlusLocal
          : money(saleAmount)
      return {
        slug: offer.slug,
        macs: offer.maxDevices,
        price: sale.formatted,
        priceMajor: sale.major,
        perMacPrice: perMac(sale, offer.maxDevices),
        localPriceHint: hint(saleAmount),
        checkoutUrl: licenseOfferCheckoutPath(slug),
        currency: sale.currency,
      }
    }
  )

  return {
    country,
    currency: permanent.currency,
    locale: permanent.locale,
    isLocalized: useLocal,
    isIndia: india,
    permanentMacs,
    permanentPrice,
    permanentPriceMajor: permanent.major,
    permanentPerMacPrice: perMac(permanent, permanentMacs),
    permanentLocalHint,
    proPlusUpgradePrice,
    bannerText: `${macwall.name} Pro is ${permanentPrice}, paid once. No subscription, free updates forever`,
    annualPrice: annual.formatted,
    annualPriceMajor: annual.major,
    salePrice: permanentPrice,
    fullPrice: permanentPrice,
    suffix: "permanent",
    getProCta: MARKETING_GET_PRO_CTA,
    getProPlusCta: MARKETING_GET_PRO_PLUS_CTA,
    buyProCta: MARKETING_GET_PRO_CTA,
    buyProAria: `Get ${macwall.name} Pro`,
    bannerCta: "See pricing",
    priceLine: `Pro is ${permanentPrice}, paid once. No subscription.`,
    pricingHeroLead: `Pro is ${permanentPrice}, paid once, or post a Reel and get your money back.`,
    pricingPermanentDescription: `Pay ${permanentPrice} once and keep Pro forever, updates included.`,
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
  PRO_PLUS_USD_CENTS,
  PRO_INDIA_USD_CENTS,
  PRO_PLUS_INDIA_USD_CENTS,
  ANNUAL_USD_CENTS,
}
