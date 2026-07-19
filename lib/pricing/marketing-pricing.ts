import { macwall, macwallProCheckoutURL } from "@/lib/macwall-site"
import { INDIA_PROMO_CODE, indiaPromo } from "@/lib/marketing-india-promo"

export type MarketingPricingRegion = "default" | "india"

export type MarketingPricing = {
  region: MarketingPricingRegion
  currency: "usd" | "inr"
  isIndia: boolean
  salePrice: string
  fullPrice: string | null
  suffix: string
  getProCta: string
  buyProCta: string
  buyProAria: string
  bannerHeadline: string
  priceLine: string
  pricingHeroLead: string
  pricingProDescription: string
  bottomCtaLabel: string
  promoCode: string | null
  checkoutUrl: string
  showIndiaOfferCard: boolean
}

export function buildDefaultMarketingPricing(): MarketingPricing {
  const salePrice = macwall.pro.price
  const fullPrice = macwall.pro.strikePrice

  return {
    region: "default",
    currency: "usd",
    isIndia: false,
    salePrice,
    fullPrice,
    suffix: macwall.pro.suffix,
    getProCta: `Get Pro — ${salePrice}`,
    buyProCta: `Buy Pro for ${salePrice}`,
    buyProAria: `Buy ${macwall.name} Pro for ${salePrice}`,
    bannerHeadline: "Limited-time launch pricing",
    priceLine: `${salePrice} one-time (was ${fullPrice}). No subscription, lifetime updates.`,
    pricingHeroLead: `${macwall.name} Pro is a one-time ${salePrice} license with lifetime updates. Buy once, use the full app, then make a Reel and get up to 100% refunded when your video hits the view targets.`,
    pricingProDescription: `One-time ${salePrice}. Full catalog, Lock Screen video, unlimited playlists, and lifetime updates on up to ${macwall.maxLicensedMacs} Macs, no subscription, ever.`,
    bottomCtaLabel: `Get Pro — ${salePrice}`,
    promoCode: null,
    checkoutUrl: macwallProCheckoutURL,
    showIndiaOfferCard: false,
  }
}

export function buildIndiaMarketingPricingFallback(): MarketingPricing {
  return {
    region: "india",
    currency: "inr",
    isIndia: true,
    salePrice: "50% off",
    fullPrice: null,
    suffix: "one-time",
    getProCta: indiaPromo.pricing.ctaFallback,
    buyProCta: indiaPromo.pricing.ctaFallback,
    buyProAria: indiaPromo.pricing.ctaAria,
    bannerHeadline: indiaPromo.banner.headline,
    priceLine: `Use ${INDIA_PROMO_CODE} at Stripe checkout for 50% off — 24-hour flash deal for India.`,
    pricingHeroLead: `${macwall.name} Pro is 50% off for India with code ${INDIA_PROMO_CODE}. Apply the code at Stripe checkout — one-time license with lifetime updates.`,
    pricingProDescription: `50% off with ${INDIA_PROMO_CODE}. Full catalog, Lock Screen video, and lifetime updates on up to ${macwall.maxLicensedMacs} Macs.`,
    bottomCtaLabel: indiaPromo.pricing.ctaFallback,
    promoCode: INDIA_PROMO_CODE,
    checkoutUrl: indiaPromo.checkoutUrl,
    showIndiaOfferCard: true,
  }
}

export function indiaBannerSubline(
  _pricing: MarketingPricing,
  code: string,
  countdown: string
): string {
  return indiaPromo.banner.subline(code, countdown)
}
