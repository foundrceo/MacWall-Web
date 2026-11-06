import {
  LICENSE_OFFERS,
  MULTI_MAC_OFFER_SLUGS,
  checkoutAddonAmount,
  licenseOfferCheckoutPath,
  licenseOfferPriceCents,
  type LicenseOfferSlug,
  type PricingRegion,
} from "@/lib/license/offers.shared"
import { isIndiaCountry } from "@/lib/geo/country"
import { macwall } from "@/lib/macwall-site"
import {
  activeSiteSale,
  applySaleCents,
  type SiteSale,
} from "@/lib/sale.shared"
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
  /** e.g. "$4.00": price divided by Macs, same currency as `price`. */
  perMacPrice: string
  /** When primary is local: "Set in USD: $19.99". When primary is USD: null. */
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
  /** e.g. "$4.33": Pro price divided by its Macs. */
  permanentPerMacPrice: string
  /** When primary is local: "Set in USD: $12.99". Otherwise null. */
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
  /**
   * Set while a sitewide sale runs: every price above is the sale price and
   * `regular` holds the same pricing at full price (for strikethroughs, and
   * for the client to fall back to once the sale ends).
   */
  sale: MarketingSale | null
}

export type MarketingSale = SiteSale & {
  regular: MarketingPricing
}

/** Global catalog USD amounts. */
const PRO_USD_CENTS = LICENSE_OFFERS.permanent.usdCents
const PRO_PLUS_USD_CENTS = LICENSE_OFFERS.permanent_5.usdCents
const ANNUAL_USD_CENTS = LICENSE_OFFERS.annual.usdCents

/** India catalog (USD, shown in INR at the live rate). */
const PRO_INDIA_USD_CENTS = LICENSE_OFFERS.permanent.indiaUsdCents
const PRO_PLUS_INDIA_USD_CENTS = LICENSE_OFFERS.permanent_5.indiaUsdCents

/** Shared buy-button labels: same on home, pricing, modal, and gallery. */
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

/**
 * Shown beside a local-currency price: the price is set in this USD amount,
 * and the local figure is only an estimate at today's rate. Adaptive Pricing
 * may charge the buyer in local currency at Stripe's rate, so never say
 * "charged in USD".
 */
function usdCatalogHint(usdCents: number): string {
  return `Set in USD: $${(usdCents / 100).toFixed(2)}`
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
  bundle: MarketingPriceBundle,
  now: number = Date.now()
): MarketingPricing {
  const regular = buildPricing(bundle, null)
  const region: PricingRegion = isIndiaCountry(bundle.country)
    ? "india"
    : "default"
  const sale = activeSiteSale(region, now)
  if (!sale) return regular
  return { ...buildPricing(bundle, sale), sale: { ...sale, regular } }
}

function buildPricing(
  bundle: MarketingPriceBundle,
  sale: SiteSale | null
): MarketingPricing {
  const { country, fx } = bundle
  // Sale prices are recomputed from USD cents, so the precomputed local
  // amounts (full price) only apply outside a sale.
  const permanentLocal = sale ? null : bundle.permanentLocal
  const proPlusLocal = sale ? null : bundle.proPlusLocal
  const off = (cents: number) =>
    sale ? applySaleCents(cents, sale.percentOff) : cents
  const india = isIndiaCountry(country)
  const region: PricingRegion = india ? "india" : "default"

  // Prices are set in USD (India at the India catalog price); Stripe Adaptive
  // Pricing may charge local currency. Show the local currency at the live FX rate when it is known.
  const proCents = licenseOfferPriceCents(LICENSE_OFFERS.permanent, region)
  const fxSource = bundle.permanentLocal
  const useLocal =
    Boolean(fx && fx.currency !== "usd") || Boolean(fxSource?.isLocalized)
  const activeFx: MarketingFxRate | null = !useLocal
    ? null
    : fx && fx.currency !== "usd"
      ? fx
      : fxSource?.isLocalized
        ? {
            currency: fxSource.currency,
            locale: fxSource.locale,
            usdPerUnit:
              fxSource.major > 0 ? proCents / 100 / fxSource.major : 0,
          }
        : null

  /** Display money for a USD catalog amount (local when FX is known). */
  const money = (usdCents: number): LocalizedMoney =>
    activeFx ? localMoneyFromFx(usdCents, activeFx) : usdMoney(usdCents)
  const hint = (usdCents: number): string | null =>
    activeFx ? usdCatalogHint(usdCents) : null
  const amount = (slug: LicenseOfferSlug): number =>
    off(licenseOfferPriceCents(LICENSE_OFFERS[slug], region))

  const permanentAmount = amount("permanent")
  const permanent =
    activeFx && permanentLocal?.isLocalized
      ? permanentLocal
      : money(permanentAmount)
  const annual = money(amount("annual"))

  const permanentPrice = permanent.formatted
  const permanentMacs = LICENSE_OFFERS.permanent.maxDevices
  const permanentLocalHint = hint(permanentAmount)
  const proPlusUpgradePrice = money(
    off(checkoutAddonAmount("upgradeProPlus", region))
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
    bannerText: sale
      ? `${sale.name}: ${sale.percentOff}% off ${macwall.name} Pro and Pro+, now ${permanentPrice} once. Ends ${sale.endsLabel}`
      : `${macwall.name} Pro is ${permanentPrice}, paid once. No subscription, free updates forever`,
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
    sale: null,
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
