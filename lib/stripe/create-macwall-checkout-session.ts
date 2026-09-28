import "server-only"

import { after } from "next/server"

import { isIndiaCountry } from "@/lib/geo/country"
import { generateMacWallLicenseKey } from "@/lib/license/generate-license-key"
import {
  isIndiaDiscountEligible,
  licenseOfferChargeAmount,
  licenseOfferFromSlug,
  licenseOfferPriceCents,
} from "@/lib/license/offers.shared"
import { checkoutPricesForOffer } from "@/lib/license/stripe-price-map"
import {
  normalizeCheckoutVisitorId,
  resolveCheckoutCustomerEmail,
} from "@/lib/stripe/checkout-email"
import {
  CHECKOUT_INTEGRATION_ID,
  checkoutErrorMessage,
  resolvePromotionCodeId,
  type CreateCheckoutResult,
} from "@/lib/stripe/checkout-shared"
import { queueCheckoutRecovery } from "@/lib/stripe/queue-checkout-recovery"
import {
  normalizeConversionPromo,
  parseOfferUntil,
} from "@/lib/stripe/conversion-promos"
import { getStripe } from "@/lib/stripe/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export type CreateMacWallCheckoutInput = {
  country: string | null
  offerSlug?: string | null
  /** Legacy query parameter retained for old links. */
  planSlug?: string | null
  /** Affonso referral cookie propagated to Stripe metadata for attribution. */
  affonsoReferral?: string
  /** Host that initiated checkout — used for Stripe success/cancel redirects. */
  siteOrigin: string
  /** Optional Stripe Promotion Code (e.g. MAC10) — allowlisted only. */
  promoCode?: string | null
  /** Unix seconds / ms / ISO. Timed 20/30 codes fall back to MAC10 after this. */
  offerUntil?: string | null
  /**
   * Known lead email (trial, recovery CTA, app). Prefills Stripe and enables
   * abandoned-checkout recovery even if they never type on the form.
   */
  customerEmail?: string | null
  /** Mac app / trial visitor id — used to look up macwall_trial_leads.email. */
  visitorId?: string | null
  /**
   * "click" when the buyer asked for Checkout (link, button, email, app).
   * "prefetch" when the session was warmed on hover; the page reports the
   * real click later via /api/checkout/opened. Only opened sessions can
   * trigger recovery email.
   */
  intent?: "click" | "prefetch"
}

export type CreateMacWallCheckoutResult = CreateCheckoutResult

const CHECKOUT_SESSION_TTL_SECONDS = 60 * 60

/**
 * One-time Stripe Checkout Session for paid MacWall licenses.
 *
 * Omits `payment_method_types` so Dynamic Payment Methods apply.
 * Enables Adaptive Pricing so buyers pay in local currency.
 * Pro $12.99 / Pro+ $19.99 (India ₹499 / ₹799 in INR), each with a one-click
 * “more Macs” cross-sell (`optional_items`). The webhook counts Macs from
 * the paid line items, so an added add-on raises the license.
 */
export async function createMacWallCheckoutSession(
  input: CreateMacWallCheckoutInput
): Promise<CreateMacWallCheckoutResult> {
  try {
    const stripe = getStripe()
    const siteOrigin = input.siteOrigin.replace(/\/+$/, "")
    const offer = licenseOfferFromSlug(input.offerSlug ?? input.planSlug)
    const region =
      isIndiaCountry(input.country) && isIndiaDiscountEligible(offer.slug)
        ? "india"
        : "default"
    const displayUnitAmount = licenseOfferPriceCents(offer, region)
    const charge = licenseOfferChargeAmount(offer, region)
    const planSlug = offer.maxDevices >= 5 ? "pro_plus" : "pro"
    const checkoutPrices = await checkoutPricesForOffer(
      stripe,
      offer.slug,
      region
    )

    const licenseKey = generateMacWallLicenseKey()
    const encodedKey = encodeURIComponent(licenseKey)
    const promoCode = normalizeConversionPromo(
      input.promoCode,
      parseOfferUntil(input.offerUntil)
    )
    const promotionCodeId = promoCode
      ? await resolvePromotionCodeId(stripe, promoCode)
      : null
    const customerEmail = await resolveCheckoutCustomerEmail({
      email: input.customerEmail,
      visitorId: input.visitorId,
    })
    const visitorId = normalizeCheckoutVisitorId(input.visitorId)
    const metadata = {
      license_key: licenseKey,
      source: "macwall",
      affonso_referral: input.affonsoReferral?.trim() || "",
      offer_slug: offer.slug,
      billing_model: offer.billingModel,
      plan_slug: planSlug,
      // Base license only — the webhook adds any cross-sell Macs it finds
      // in the paid line items.
      max_devices: String(offer.maxDevices),
      pricing_region: region,
      // Base license in the charged currency, plus its USD equivalent so
      // USD reporting can convert INR sessions (ratio covers add-ons/promos).
      unit_amount: String(charge.amount),
      currency: charge.currency,
      unit_amount_usd: String(displayUnitAmount),
      visitor_country: input.country?.trim().toUpperCase() || "",
      ...(promoCode ? { promo_code: promoCode } : {}),
      ...(promotionCodeId ? { stripe_promotion_code_id: promotionCodeId } : {}),
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      ...(visitorId ? { visitor_id: visitorId } : {}),
      checkout_intent: input.intent ?? "click",
    }

    // Critical path: Stripe only. Localhost measured ~1.1–1.2s for this hop.
    // Idempotency key is unique per license key so retries of the same intent
    // reuse the session; a new click mints a new key → new session (correct).
    // Stripe forbids pairing `discounts` with `allow_promotion_codes`.
    // Annual is retired (normalized to permanent) — always one-time payment mode.
    // customer_email prefills Checkout and is readable on abandon for recovery.
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        // Expire after 1 hour so abandonment (and recovery) is known quickly.
        expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_SESSION_TTL_SECONDS,
        line_items: checkoutPrices.lineItems.map((price) => ({
          price,
          quantity: 1,
        })),
        ...(checkoutPrices.optionalItems.length > 0
          ? {
              optional_items: checkoutPrices.optionalItems.map((price) => ({
                price,
                quantity: 1,
              })),
            }
          : {}),
        success_url: `${siteOrigin}/activate?key=${encodedKey}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteOrigin}/pricing`,
        client_reference_id: licenseKey,
        locale: "auto",
        billing_address_collection: "auto",
        ...(customerEmail ? { customer_email: customerEmail } : {}),
        ...(promotionCodeId
          ? { discounts: [{ promotion_code: promotionCodeId }] }
          : { allow_promotion_codes: true }),
        adaptive_pricing: { enabled: true },
        integration_identifier: CHECKOUT_INTEGRATION_ID,
        metadata,
        customer_creation: "always",
        payment_intent_data: { metadata },
      },
      {
        idempotencyKey: `mw_checkout_${offer.slug}_${region}_${licenseKey}${
          promotionCodeId ? `_promo_${promotionCodeId}` : ""
        }`,
      }
    )

    if (!session.url) {
      return {
        ok: false,
        error: "Stripe did not return a checkout URL.",
        status: 502,
      }
    }

    after(async () => {
      const supabase = getSupabaseAdmin()
      const visitorCountry = input.country?.trim().toUpperCase() || null
      const licenseRow: Record<string, unknown> = {
        license_key: licenseKey,
        source: "stripe",
        status: "pending",
        plan_slug: planSlug,
        max_devices: offer.maxDevices,
        billing_model: offer.billingModel,
        stripe_checkout_session_id: session.id,
        ...(customerEmail ? { customer_email: customerEmail } : {}),
        ...(visitorCountry && /^[A-Z]{2}$/.test(visitorCountry)
          ? { visitor_country: visitorCountry }
          : {}),
      }

      let { error: insertError } = await supabase
        .from("macwall_licenses")
        .insert(licenseRow)

      if (insertError?.message?.includes("visitor_country")) {
        const { visitor_country: _drop, ...withoutCountry } = licenseRow
        ;({ error: insertError } = await supabase
          .from("macwall_licenses")
          .insert(withoutCountry))
      }

      if (insertError?.message?.includes("plan_slug")) {
        ;({ error: insertError } = await supabase
          .from("macwall_licenses")
          .insert({
            license_key: licenseKey,
            source: "stripe",
            status: "pending",
            stripe_checkout_session_id: session.id,
          }))
      }

      if (insertError) {
        console.error("[checkout] license insert failed", insertError.message)
        return
      }

      try {
        await queueCheckoutRecovery({
          checkoutSessionId: session.id,
          licenseKey,
          customerEmail,
          reason: "checkout_started",
        })
      } catch (queueError) {
        console.error(
          "[checkout] recovery queue failed",
          queueError instanceof Error ? queueError.message : "error"
        )
      }
    })

    return { ok: true, url: session.url, customerEmail }
  } catch (error) {
    console.error(
      "[checkout]",
      error instanceof Error ? error.message : "Checkout session failed."
    )
    return {
      ok: false,
      error: checkoutErrorMessage(error),
      status: 500,
    }
  }
}
