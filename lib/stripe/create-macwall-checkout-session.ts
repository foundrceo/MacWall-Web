import "server-only"

import { generateMacWallLicenseKey } from "@/lib/license/generate-license-key"
import {
  licenseOfferFromSlug,
  licenseOfferPriceCents,
} from "@/lib/license/offers.shared"
import { getStripe } from "@/lib/stripe/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { queueCheckoutRecovery } from "@/lib/stripe/queue-checkout-recovery"
import { stripePriceIdForOffer } from "@/lib/license/stripe-price-map"

export type CreateMacWallCheckoutInput = {
  country: string | null
  offerSlug?: string | null
  /** Legacy query parameter retained for old links. */
  planSlug?: string | null
  /** Affonso referral cookie propagated to Stripe metadata for attribution. */
  affonsoReferral?: string
  /** DataFast visitor cookie — Stripe metadata for revenue attribution. */
  datafastVisitorId?: string
  /** DataFast session cookie — Stripe metadata for revenue attribution. */
  datafastSessionId?: string
  /** Host that initiated checkout — used for Stripe success/cancel redirects. */
  siteOrigin: string
}

export type CreateMacWallCheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string; status: number }

/**
 * Creates the Stripe Checkout Session and a pending license row.
 *
 * Stripe Prices: permanent $9.99, annual $4.99/yr, permanent_5 $14.99.
 * Adaptive Pricing localizes presentment currency on Checkout itself.
 */
export async function createMacWallCheckoutSession(
  input: CreateMacWallCheckoutInput
): Promise<CreateMacWallCheckoutResult> {
  try {
    const stripe = getStripe()
    const supabase = getSupabaseAdmin()
    const siteOrigin = input.siteOrigin.replace(/\/+$/, "")
    const offer = licenseOfferFromSlug(input.offerSlug ?? input.planSlug)
    const displayUnitAmount = licenseOfferPriceCents(offer, "default")
    const planSlug = offer.maxDevices === 5 ? "pro_plus" : "pro"

    const licenseKey = generateMacWallLicenseKey()

    const licenseRow: Record<string, unknown> = {
      license_key: licenseKey,
      source: "stripe",
      status: "pending",
      plan_slug: planSlug,
      max_devices: offer.maxDevices,
      billing_model: offer.billingModel,
    }

    let { error: insertError } = await supabase
      .from("macwall_licenses")
      .insert(licenseRow)

    if (insertError?.message?.includes("plan_slug")) {
      ;({ error: insertError } = await supabase
        .from("macwall_licenses")
        .insert({
          license_key: licenseKey,
          source: "stripe",
          status: "pending",
        }))
    }

    if (insertError) {
      console.error("[checkout] license insert failed", insertError.message)
      return {
        ok: false,
        error: "Could not prepare checkout.",
        status: 500,
      }
    }

    const encodedKey = encodeURIComponent(licenseKey)
    const metadata = {
      license_key: licenseKey,
      source: "macwall",
      // Always set so Affonso can attribute Stripe Checkout (empty = organic).
      affonso_referral: input.affonsoReferral?.trim() || "",
      // DataFast revenue attribution (empty when cookies missing = organic).
      datafast_visitor_id: input.datafastVisitorId?.trim() || "",
      datafast_session_id: input.datafastSessionId?.trim() || "",
      offer_slug: offer.slug,
      billing_model: offer.billingModel,
      plan_slug: planSlug,
      max_devices: String(offer.maxDevices),
      pricing_region: "default",
      unit_amount_usd: String(displayUnitAmount),
      visitor_country: input.country?.trim().toUpperCase() || "",
    }

    const stripePriceId = stripePriceIdForOffer(offer.slug)

    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: offer.billingModel === "annual" ? "subscription" : "payment",
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: `${siteOrigin}/activate?key=${encodedKey}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteOrigin}/pricing`,
      client_reference_id: licenseKey,
      // Collect email early so abandoned-checkout recovery can send.
      billing_address_collection: "required",
      allow_promotion_codes: true,
      // Stripe-hosted Checkout localizes presentment (INR/EUR/…) from the USD Price.
      adaptive_pricing: { enabled: true },
      metadata,
      ...(offer.billingModel === "annual"
        ? { subscription_data: { metadata } }
        : {
            customer_creation: "always",
            payment_intent_data: { metadata },
          }),
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

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

    const { error: updateError } = await supabase
      .from("macwall_licenses")
      .update({ stripe_checkout_session_id: session.id })
      .eq("license_key", licenseKey)

    if (updateError) {
      console.error("[checkout] session id update failed", updateError.message)
      await supabase
        .from("macwall_licenses")
        .delete()
        .eq("license_key", licenseKey)
      try {
        await stripe.checkout.sessions.expire(session.id)
      } catch {
        /* best-effort cleanup */
      }
      return {
        ok: false,
        error: "Could not prepare checkout.",
        status: 500,
      }
    }

    try {
      await queueCheckoutRecovery({
        checkoutSessionId: session.id,
        licenseKey,
        reason: "checkout_started",
      })
    } catch (queueError) {
      console.error(
        "[checkout] recovery queue failed",
        queueError instanceof Error ? queueError.message : "error"
      )
    }

    return { ok: true, url: session.url }
  } catch (error) {
    console.error(
      "[checkout]",
      error instanceof Error ? error.message : "Checkout session failed."
    )
    return {
      ok: false,
      error: "Could not start checkout.",
      status: 500,
    }
  }
}
