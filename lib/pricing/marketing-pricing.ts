import {
  INDIA_FIXED_INR_PER_USD,
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
  /** When primary is local: "Charged in USD: $19.99". When primary is USD: null. */
  localPriceHint: string | null
  /** Price before a coupon (India on Cashfree only); null when none applies. */
  fullPrice: string | null
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
  /** When primary is local: "Charged in USD: $12.99". Otherwise null. */
  permanentLocalHint: string | null
  /** Pro price before a coupon (India on Cashfree only); null when none applies. */
  permanentFullPrice: string | null
  /** Coupon from a ?promo= link, carried on every checkout URL. */
  promoCode: string | null
  /** Percent taken off the shown prices (0 unless India on Cashfree). */
  promoPercentOff: number
  /** Currency the card is actually charged in: INR for India on Cashfree. */
  chargeCurrency: "usd" | "inr"
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

/** India catalog (USD, shown in INR at the live rate). */
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

/**
 * Shown beside a local-currency price: the card is charged this USD amount,
 * and the local figure is only an estimate at today's rate.
 */
function usdCatalogHint(usdCents: number): string {
  return `Charged in USD: $${(usdCents / 100).toFixed(2)}`
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
  /** India on Cashfree: fixed ₹499 / ₹799 / ₹1,299, no USD hint. */
  fixedIndiaInr?: boolean
  /**
   * Coupon from a ?promo= link (already validated). Every checkout URL
   * carries it. Shown prices drop by `percentOff` only for India on
   * Cashfree, where the order is charged that amount; Whop applies codes on
   * its own checkout page.
   */
  promo?: { code: string; percentOff: number; until?: string | null } | null
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
  const { country, fixedIndiaInr } = bundle
  const india = isIndiaCountry(country)
  const region: PricingRegion = india ? "india" : "default"
  const fixedInr = india && Boolean(fixedIndiaInr)
  // Fixed rupee prices are a constant ₹100 per catalog dollar, so the rate
  // path below renders them exactly. Live FX inputs are ignored.
  const fx: MarketingFxRate | null | undefined = fixedInr
    ? { currency: "inr", locale: "en-IN", usdPerUnit: 1 / INDIA_FIXED_INR_PER_USD }
    : bundle.fx
  const permanentLocal = fixedInr ? null : bundle.permanentLocal
  const proPlusLocal = fixedInr ? null : bundle.proPlusLocal
  const promo = bundle.promo?.code ? bundle.promo : null
  const promoPercentOff = fixedInr ? Math.max(0, promo?.percentOff ?? 0) : 0

  /** Same rounding as the Cashfree order: whole rupees (₹499 → ₹449). */
  const discounted = (full: LocalizedMoney): LocalizedMoney => {
    if (promoPercentOff <= 0) return full
    const major = Math.max(1, Math.round((full.major * (100 - promoPercentOff)) / 100))
    return { ...full, major, formatted: formatMoney(major, full.currency, full.locale) }
  }
  const checkoutPath = (slug: LicenseOfferSlug): string => {
    const path = licenseOfferCheckoutPath(slug)
    if (!promo) return path
    const params = new URLSearchParams({ promo: promo.code })
    if (promo.until) params.set("until", promo.until)
    return `${path}&${params.toString()}`
  }

  // Everyone is charged in USD (India at the India catalog price). Show the
  // local currency at the live FX rate when it is known.
  const proCents = licenseOfferPriceCents(LICENSE_OFFERS.permanent, region)
  const useLocal =
    Boolean(fx && fx.currency !== "usd") ||
    Boolean(permanentLocal?.isLocalized)
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
                ? proCents / 100 / permanentLocal.major
                : 0,
          }
        : null

  /** Display money for a USD catalog amount (local when FX is known). */
  const money = (usdCents: number): LocalizedMoney =>
    activeFx ? localMoneyFromFx(usdCents, activeFx) : usdMoney(usdCents)
  const hint = (usdCents: number): string | null =>
    activeFx && !fixedInr ? usdCatalogHint(usdCents) : null
  const amount = (slug: LicenseOfferSlug): number =>
    licenseOfferPriceCents(LICENSE_OFFERS[slug], region)

  const permanentAmount = amount("permanent")
  const permanentList =
    activeFx && permanentLocal?.isLocalized
      ? permanentLocal
      : money(permanentAmount)
  const permanent = discounted(permanentList)
  const annual = money(amount("annual"))

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
      const list =
        activeFx && slug === "permanent_5" && proPlusLocal?.isLocalized
          ? proPlusLocal
          : money(saleAmount)
      const sale = discounted(list)
      return {
        slug: offer.slug,
        macs: offer.maxDevices,
        price: sale.formatted,
        priceMajor: sale.major,
        perMacPrice: perMac(sale, offer.maxDevices),
        localPriceHint: hint(saleAmount),
        fullPrice: promoPercentOff > 0 ? list.formatted : null,
        checkoutUrl: checkoutPath(slug),
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
    permanentFullPrice: promoPercentOff > 0 ? permanentList.formatted : null,
    promoCode: promo?.code ?? null,
    promoPercentOff,
    chargeCurrency: fixedInr ? "inr" : "usd",
    proPlusUpgradePrice,
    bannerText: `${macwall.name} Pro is ${permanentPrice}, paid once. No subscription, free updates forever`,
    annualPrice: annual.formatted,
    annualPriceMajor: annual.major,
    salePrice: permanentPrice,
    fullPrice: permanentList.formatted,
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
    checkoutUrl: checkoutPath("permanent"),
    annualCheckoutUrl: checkoutPath("permanent"),
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
