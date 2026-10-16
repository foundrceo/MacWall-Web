import { LICENSE_OFFERS } from "@/lib/license/offers.shared"

/** Waitlist landing page. Windows visitors to /download/latest land here. */
export const windowsWaitlistPath = "/windows" as const

/** Stripe success redirect target (`?session_id=`). */
export const windowsWaitlistThanksPath = "/windows/thanks" as const

/** POST { email } → { url } (Stripe Checkout). */
export const windowsPreorderApiPath = "/api/windows/preorder" as const

/** Checkout + PaymentIntent metadata `product` value the webhook branches on. */
export const WINDOWS_PREORDER_PRODUCT = "windows_preorder" as const

/**
 * Early access costs the same as Mac Pro, so the price already shown by
 * `useMarketingPricing().permanentPrice` (local currency, India discount)
 * is the price charged here.
 */
export const WINDOWS_PREORDER_USD_CENTS = LICENSE_OFFERS.permanent.usdCents
export const WINDOWS_PREORDER_INDIA_USD_CENTS =
  LICENSE_OFFERS.permanent.indiaUsdCents

/** PCs covered by the key emailed at launch. */
export const WINDOWS_PREORDER_MAX_DEVICES = LICENSE_OFFERS.permanent.maxDevices
