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
  /**
   * Banner strip prices — India uses local INR for sale + strike when FX
   * is available; otherwise catalog USD (India $3.99 / strike $14.99).
   */
  bannerSalePrice: string
  bannerStrikePrice: string
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
const PRO_STRIKE_USD_CENTS = LICENSE_OFFERS.permanent.strikeUsdCents
const PRO_PLUS_USD_CENTS = LICENSE_OFFERS.permanent_5.usdCents
const PRO_PLUS_STRIKE_USD_CENTS = LICENSE_OFFERS.permanent_5.strikeUsdCents
const ANNUAL_USD_CENTS = LICENSE_OFFERS.annual.usdCents

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

function localHint(local: LocalizedMoney | null | undefined): string | null {
  if (!local?.isLocalized) return null
  return `≈ ${local.formatted} · charged in ${local.currency.toUpperCase()}`
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
  /** When set, every multi-Mac pack gets an ≈ local · charged in CUR hint. */
  fx?: MarketingFxRate | null
}

function localHintForUsdCents(
  usdCents: number,
  fx: MarketingFxRate | null | undefined
): string | null {
  const formatted = formatLocalUsdCents(usdCents, fx)
  if (!formatted || !fx) return null
  return `≈ ${formatted} · charged in ${fx.currency.toUpperCase()}`
}

function formatLocalUsdCents(
  usdCents: number,
  fx: MarketingFxRate | null | undefined
): string | null {
  if (!fx || fx.currency === "usd") return null
  const major = convertUsdCentsWithRate(usdCents, fx.currency, fx.usdPerUnit)
  return formatMoney(major, fx.currency, fx.locale)
}

export function buildMarketingPricingFromLocalized(
  bundle: MarketingPriceBundle
): MarketingPricing {
  const { country, permanentLocal, proPlusLocal, fx } = bundle
  const india = isIndiaCountry(country)
  const region = india ? "india" : "default"

  const permanentSaleCents = india ? PRO_INDIA_USD_CENTS : PRO_USD_CENTS
  const permanent = usdMoney(permanentSaleCents)
  const permanentStrike = usdMoney(PRO_STRIKE_USD_CENTS)
  const annual = usdMoney(
    india ? LICENSE_OFFERS.annual.indiaUsdCents : ANNUAL_USD_CENTS
  )

  const permanentPrice = permanent.formatted
  const permanentStrikePrice = permanentStrike.formatted
  const permanentLocalHint = localHint(permanentLocal)
  const permanentOffLabel = offLabel(PRO_STRIKE_USD_CENTS, permanentSaleCents)

  // Banner: India shows local INR for sale + cutted strike when FX is available.
  const indiaFx = india ? fx : null
  const bannerSalePrice =
    (india && permanentLocal?.isLocalized ? permanentLocal.formatted : null) ??
    formatLocalUsdCents(permanentSaleCents, indiaFx) ??
    permanentPrice
  const bannerStrikePrice =
    formatLocalUsdCents(PRO_STRIKE_USD_CENTS, indiaFx) ?? permanentStrikePrice

  const multiMacOffers: MarketingMultiMacOffer[] = MULTI_MAC_OFFER_SLUGS.map(
    (slug) => {
      const offer = LICENSE_OFFERS[slug]
      const saleCents = licenseOfferPriceCents(offer, region)
      const sale = usdMoney(saleCents)
      const strike = usdMoney(offer.strikeUsdCents)
      const packLocalHint =
        localHintForUsdCents(saleCents, fx) ??
        (slug === "permanent_5" ? localHint(proPlusLocal) : null)
      return {
        slug: offer.slug,
        macs: offer.maxDevices,
        price: sale.formatted,
        priceMajor: sale.major,
        strikePrice: strike.formatted,
        strikePriceMajor: strike.major,
        offLabel: offLabel(offer.strikeUsdCents, saleCents),
        localPriceHint: packLocalHint,
        checkoutUrl: licenseOfferCheckoutPath(slug),
      }
    }
  )

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
    bannerSalePrice,
    bannerStrikePrice,
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
