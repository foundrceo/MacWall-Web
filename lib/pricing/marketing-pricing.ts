import { macwall, macwallProCheckoutURL } from "@/lib/macwall-site"
import { INDIA_PROMO_CODE, indiaPromo } from "@/lib/marketing-india-promo"
import type { WhopIndiaQuote } from "@/lib/pricing/whop-india-pricing"

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
    bottomCtaLabel: "View pricing",
    promoCode: null,
    checkoutUrl: macwallProCheckoutURL,
    showIndiaOfferCard: false,
  }
}

export function buildIndiaMarketingPricing(
  quote: WhopIndiaQuote
): MarketingPricing {
  const { saleDisplay, fullDisplay, promoCode } = quote

  return {
    region: "india",
    currency: "inr",
    isIndia: true,
    salePrice: saleDisplay,
    fullPrice: fullDisplay,
    suffix: "one-time",
    getProCta: `Get Pro — ${saleDisplay}`,
    buyProCta: `Get Pro for ${saleDisplay}`,
    buyProAria: `Buy ${macwall.name} Pro for ${saleDisplay} with code ${promoCode}`,
    bannerHeadline: `🇮🇳 India-only — ${saleDisplay} for MacWall Pro (50% OFF)`,
    priceLine: `${saleDisplay} one-time for India (was ${fullDisplay}). Use ${promoCode} at checkout — 24-hour flash deal.`,
    pricingHeroLead: `${macwall.name} Pro is ${saleDisplay} for India right now — 50% off the live Whop price with code ${promoCode}. One-time license, lifetime updates, full catalog, and a Reel can still earn 100% back.`,
    pricingProDescription: `${saleDisplay} one-time with code ${promoCode}. Full catalog, Lock Screen video, unlimited playlists, and lifetime updates on up to ${macwall.maxLicensedMacs} Macs.`,
    bottomCtaLabel: `Get Pro — ${saleDisplay}`,
    promoCode,
    checkoutUrl: macwallProCheckoutURL,
    showIndiaOfferCard: true,
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
    priceLine: `Use ${INDIA_PROMO_CODE} at checkout for 50% off — final INR price shown at Whop checkout. 24-hour flash deal for India.`,
    pricingHeroLead: `${macwall.name} Pro is 50% off for India with code ${INDIA_PROMO_CODE}. Apply the code at Whop checkout to see your live INR price — one-time license with lifetime updates.`,
    pricingProDescription: `50% off with ${INDIA_PROMO_CODE}. Final INR price at Whop checkout. Full catalog, Lock Screen video, and lifetime updates on up to ${macwall.maxLicensedMacs} Macs.`,
    bottomCtaLabel: indiaPromo.pricing.ctaFallback,
    promoCode: INDIA_PROMO_CODE,
    checkoutUrl: macwallProCheckoutURL,
    showIndiaOfferCard: true,
  }
}

export function indiaBannerSubline(
  pricing: MarketingPricing,
  code: string,
  countdown: string
): string {
  if (pricing.isIndia && pricing.salePrice !== "50% off") {
    return `${pricing.salePrice} with ${code} · ${countdown} left · Tap to claim →`
  }

  return indiaPromo.banner.subline(
    code,
    countdown,
    pricing.isIndia ? pricing.salePrice : undefined
  )
}
