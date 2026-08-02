import {
  LICENSE_OFFERS,
  formatUsd,
  licenseOfferCheckoutPath,
  licenseOfferPriceCents,
  type LicenseOfferSlug,
  type PricingRegion,
} from "@/lib/license/offers.shared"
import { macwall } from "@/lib/macwall-site"

export type MarketingMultiMacOffer = {
  slug: LicenseOfferSlug
  macs: 5
  price: string
  strikePrice: string
  checkoutUrl: string
}

export type MarketingPricing = {
  region: PricingRegion
  currency: "usd"
  isIndia: boolean
  permanentPrice: string
  permanentStrikePrice: string
  annualPrice: string
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

const PRO_STRIKE = "$14.99"
const PRO_PLUS_STRIKE = "$24.99"

/** Only the 5-Mac bundle exists, and it's a flat $14.99 for everyone — no region discount. */
function buildMultiMacOffers(): MarketingMultiMacOffer[] {
  const offer = LICENSE_OFFERS.permanent_5
  return [
    {
      slug: offer.slug,
      macs: 5,
      price: formatUsd(offer.usdCents),
      strikePrice: PRO_PLUS_STRIKE,
      checkoutUrl: licenseOfferCheckoutPath(offer.slug),
    },
  ]
}

export function buildMarketingPricing(region: PricingRegion): MarketingPricing {
  const isIndia = region === "india"
  const permanentPrice = formatUsd(
    licenseOfferPriceCents(LICENSE_OFFERS.permanent, region)
  )
  const annualPrice = formatUsd(
    licenseOfferPriceCents(LICENSE_OFFERS.annual, region)
  )

  return {
    region,
    currency: "usd",
    isIndia,
    permanentPrice,
    permanentStrikePrice: PRO_STRIKE,
    annualPrice,
    salePrice: permanentPrice,
    fullPrice: PRO_STRIKE,
    suffix: "permanent",
    getProCta: "Get Pro",
    buyProCta: `Unlock Pro forever for ${permanentPrice}`,
    buyProAria: `Buy a permanent ${macwall.name} Pro license for ${permanentPrice}`,
    bannerHeadline: "Limited sale is live — buy before it ends",
    bannerSubline: "Limited sale is live — buy before it ends",
    bannerCta: "Buy now 🔥",
    priceLine: `Limited Pro ${permanentPrice} (was ${PRO_STRIKE}). No subscription.`,
    pricingHeroLead: `Claim Pro at the limited price — or earn 100% back with a Reel.`,
    pricingPermanentDescription: `Pay ${permanentPrice} once (was ${PRO_STRIKE}) and keep Pro forever, with updates included.`,
    pricingAnnualDescription: `Legacy annual plans are no longer offered for new purchases. Choose the permanent ${permanentPrice} license instead.`,
    bottomCtaLabel: "Get Pro",
    checkoutUrl: licenseOfferCheckoutPath("permanent"),
    annualCheckoutUrl: licenseOfferCheckoutPath("permanent"),
    multiMacOffers: buildMultiMacOffers(),
  }
}

export function buildDefaultMarketingPricing(): MarketingPricing {
  return buildMarketingPricing("default")
}

export function buildIndiaMarketingPricing(): MarketingPricing {
  return buildMarketingPricing("india")
}
