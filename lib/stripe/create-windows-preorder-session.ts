import "server-only"

import { isIndiaCountry } from "@/lib/geo/country"
import {
  CHECKOUT_INTEGRATION_ID,
  checkoutErrorMessage,
  type CreateCheckoutResult,
} from "@/lib/stripe/checkout-shared"
import { getStripe } from "@/lib/stripe/server"
import {
  WINDOWS_PREORDER_INDIA_USD_CENTS,
  WINDOWS_PREORDER_MAX_DEVICES,
  WINDOWS_PREORDER_PRODUCT,
  WINDOWS_PREORDER_USD_CENTS,
  windowsWaitlistPath,
  windowsWaitlistThanksPath,
} from "@/lib/windows/preorder.shared"

const CHECKOUT_SESSION_TTL_SECONDS = 60 * 60

/**
 * One-time Stripe Checkout for MacWall for Windows early access.
 *
 * Unlike Mac checkout, no license key or `macwall_licenses` row is created:
 * the webhook records the payment in `macwall_windows_waitlist` and emails a
 * "you're on the list" confirmation. The key is sent when Windows ships.
 */
export async function createWindowsPreorderSession(input: {
  country: string | null
  email: string
  siteOrigin: string
}): Promise<CreateCheckoutResult> {
  try {
    const stripe = getStripe()
    const siteOrigin = input.siteOrigin.replace(/\/+$/, "")
    const region = isIndiaCountry(input.country) ? "india" : "default"
    const unitAmount =
      region === "india"
        ? WINDOWS_PREORDER_INDIA_USD_CENTS
        : WINDOWS_PREORDER_USD_CENTS
    const metadata = {
      product: WINDOWS_PREORDER_PRODUCT,
      source: "macwall",
      pricing_region: region,
      unit_amount: String(unitAmount),
      currency: "usd",
      unit_amount_usd: String(unitAmount),
      max_devices: String(WINDOWS_PREORDER_MAX_DEVICES),
      visitor_country: input.country?.trim().toUpperCase() || "",
      customer_email: input.email,
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_SESSION_TTL_SECONDS,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: unitAmount,
            product_data: {
              name: "MacWall Pro: Windows Early Access",
              description: `One lifetime MacWall Pro license for Mac and Windows, up to ${WINDOWS_PREORDER_MAX_DEVICES} devices. Your key is emailed when the Windows app launches.`,
            },
          },
        },
      ],
      customer_email: input.email,
      success_url: `${siteOrigin}${windowsWaitlistThanksPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteOrigin}${windowsWaitlistPath}`,
      locale: "auto",
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      adaptive_pricing: { enabled: true },
      integration_identifier: CHECKOUT_INTEGRATION_ID,
      custom_text: {
        submit: {
          message:
            "This is a preorder. You'll get a confirmation email now and your MacWall Pro key (works on Mac and Windows) when the Windows app launches. Full refund any time before launch.",
        },
      },
      metadata,
      customer_creation: "always",
      payment_intent_data: {
        metadata,
        description: "MacWall for Windows early access (preorder)",
      },
    })

    if (!session.url) {
      return {
        ok: false,
        error: "Stripe did not return a checkout URL.",
        status: 502,
      }
    }
    return { ok: true, url: session.url, customerEmail: input.email }
  } catch (error) {
    console.error(
      "[windows-preorder]",
      error instanceof Error ? error.message : "Checkout session failed."
    )
    return { ok: false, error: checkoutErrorMessage(error), status: 500 }
  }
}
