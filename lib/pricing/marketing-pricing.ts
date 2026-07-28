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
  checkoutUrl: string
}

export type MarketingBannerPrice = {
  label: string
  price: string
  strike: string
}

export type MarketingPricing = {
  region: PricingRegion
  currency: "usd"
  isIndia: boolean
  permanentPrice: string
  annualPrice: string
  salePrice: string
  fullPrice: null
  suffix: string
  getProCta: string
  buyProCta: string
  buyProAria: string
  bannerHeadline: string
  bannerSubline: string
  bannerPrices: MarketingBannerPrice[]
  priceLine: string
  pricingHeroLead: string
  pricingPermanentDescription: string
  pricingAnnualDescription: string
  bottomCtaLabel: string
  checkoutUrl: string
  annualCheckoutUrl: string
  multiMacOffers: MarketingMultiMacOffer[]
}

/** Only the 5-Mac bundle exists, and it's a flat $14.99 for everyone — no region discount. */
function buildMultiMacOffers(): MarketingMultiMacOffer[] {
  const offer = LICENSE_OFFERS.permanent_5
  return [
    {
      slug: offer.slug,
      macs: 5,
      price: formatUsd(offer.usdCents),
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
    annualPrice,
    salePrice: permanentPrice,
    fullPrice: null,
    suffix: "permanent",
    getProCta: "Get Pro",
    buyProCta: `Buy permanently for ${permanentPrice}`,
    buyProAria: `Buy a permanent ${macwall.name} Pro license for ${permanentPrice}`,
    bannerHeadline: "Limited-time launch pricing",
    bannerSubline: `Pro ${annualPrice}/yr · Forever ${permanentPrice}`,
    bannerPrices: [
      {
        label: "Pro",
        price: `${annualPrice}/yr`,
        strike: "$9.99",
      },
      {
        label: "Forever",
        price: permanentPrice,
        strike: "$14.99",
      },
    ],
    priceLine: `${permanentPrice} permanent or ${annualPrice} billed annually.`,
    pricingHeroLead: `Choose a permanent ${permanentPrice} license or pay ${annualPrice} annually. Both unlock the full ${macwall.name} Pro experience on up to 3 Macs, and a 5-Mac permanent license is available below.`,
    pricingPermanentDescription: `Pay ${permanentPrice} once and keep Pro on up to 3 Macs permanently, with updates included.`,
    pricingAnnualDescription: `${annualPrice} per year for the full Pro experience on up to 3 Macs. Renews annually until canceled.`,
    bottomCtaLabel: "Get Pro",
    checkoutUrl: licenseOfferCheckoutPath("permanent"),
    annualCheckoutUrl: licenseOfferCheckoutPath("annual"),
    multiMacOffers: buildMultiMacOffers(),
  }
}

export function buildDefaultMarketingPricing(): MarketingPricing {
  return buildMarketingPricing("default")
}

export function buildIndiaMarketingPricing(): MarketingPricing {
  return buildMarketingPricing("india")
}
