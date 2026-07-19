import "server-only"

import { generateMacWallLicenseKey } from "@/lib/license/generate-license-key"
import { getStripe, getStripePriceIdUsd } from "@/lib/stripe/server"
import {
  indiaCheckoutDiscount,
  shouldApplyIndiaPromo,
} from "@/lib/stripe/india-promo"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export type CreateMacWallCheckoutInput = {
  country: string | null
  requestedPromo?: string | null
  /** Host that initiated checkout — used for Stripe success/cancel redirects. */
  siteOrigin: string
}

export type CreateMacWallCheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string; status: number }

/**
 * Creates a Stripe Checkout Session for MacWall Pro and a pending license row.
 * INDIA50 is applied only for visitors resolved as India (geo / cookie / dev override).
 */
export async function createMacWallCheckoutSession(
  input: CreateMacWallCheckoutInput
): Promise<CreateMacWallCheckoutResult> {
  try {
    const stripe = getStripe()
    const supabase = getSupabaseAdmin()
    const siteOrigin = input.siteOrigin.replace(/\/+$/, "")
    const applyIndiaPromo = shouldApplyIndiaPromo(input)

    const licenseKey = generateMacWallLicenseKey()

    const { error: insertError } = await supabase
      .from("macwall_licenses")
      .insert({
        license_key: licenseKey,
        source: "stripe",
        status: "pending",
      })

    if (insertError) {
      console.error("[checkout] license insert failed", insertError.message)
      return {
        ok: false,
        error: "Could not prepare checkout.",
        status: 500,
      }
    }

    const encodedKey = encodeURIComponent(licenseKey)

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: getStripePriceIdUsd(), quantity: 1 }],
      success_url: `${siteOrigin}/activate?key=${encodedKey}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteOrigin}/pricing`,
      metadata: {
        license_key: licenseKey,
        source: "macwall",
        ...(applyIndiaPromo ? { promo: "INDIA50", country: "IN" } : {}),
      },
      ...(applyIndiaPromo
        ? { discounts: [indiaCheckoutDiscount()] }
        : { allow_promotion_codes: true }),
    })

    if (!session.url) {
      await supabase
        .from("macwall_licenses")
        .delete()
        .eq("license_key", licenseKey)
      return {
        ok: false,
        error: "Stripe did not return a checkout URL.",
        status: 502,
      }
    }

    await supabase
      .from("macwall_licenses")
      .update({ stripe_checkout_session_id: session.id })
      .eq("license_key", licenseKey)

    return { ok: true, url: session.url }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Checkout session failed."
    console.error("[checkout]", message)
    return { ok: false, error: message, status: 500 }
  }
}
