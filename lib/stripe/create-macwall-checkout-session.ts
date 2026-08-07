import "server-only"

import { after } from "next/server"

import { isIndiaCountry } from "@/lib/geo/country"
import { generateMacWallLicenseKey } from "@/lib/license/generate-license-key"
import {
  isIndiaDiscountEligible,
  licenseOfferFromSlug,
  licenseOfferPriceCents,
} from "@/lib/license/offers.shared"
import { stripePriceIdForOffer } from "@/lib/license/stripe-price-map"
import { getStripe } from "@/lib/stripe/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { queueCheckoutRecovery } from "@/lib/stripe/queue-checkout-recovery"

/** Allowlisted app/web promo codes that may auto-apply at Checkout. */
const ALLOWLISTED_PROMOTION_CODES = new Set(["MAC10", "WALL10"])

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
  /** Optional Stripe Promotion Code (e.g. MAC10) — allowlisted only. */
  promoCode?: string | null
}

export type CreateMacWallCheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string; status: number }

/**
 * Stable Dashboard label for this web Checkout surface.
 * Stripe best practice: include an 8-letter suffix for flow comparison.
 */
const CHECKOUT_INTEGRATION_ID = "macwall_web_checkout_kxqmvrnp"

function normalizePromoCode(raw: string | null | undefined): string | null {
  const code = raw?.trim().toUpperCase() || ""
  if (!code || !ALLOWLISTED_PROMOTION_CODES.has(code)) return null
  return code
}

async function resolvePromotionCodeId(
  stripe: ReturnType<typeof getStripe>,
  code: string
): Promise<string | null> {
  try {
    const listed = await stripe.promotionCodes.list({
      code,
      active: true,
      limit: 1,
    })
    return listed.data[0]?.id ?? null
  } catch (error) {
    console.error(
      "[checkout] promotion code lookup failed",
      error instanceof Error ? error.message : "error"
    )
    return null
  }
}

/**
 * Creates the Stripe Checkout Session ASAP, then persists the pending license
 * after the response (user still has to enter payment details on Stripe).
 *
 * Omits `payment_method_types` so Dynamic Payment Methods apply.
 * India → $3.99 / $6.99 Prices. Everyone else → $7.99 / $12.99.
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
    const planSlug = offer.maxDevices >= 5 ? "pro_plus" : "pro"
    const stripePriceId = stripePriceIdForOffer(offer.slug, region)

    const licenseKey = generateMacWallLicenseKey()
    const encodedKey = encodeURIComponent(licenseKey)
    const promoCode = normalizePromoCode(input.promoCode)
    const promotionCodeId = promoCode
      ? await resolvePromotionCodeId(stripe, promoCode)
      : null
    const metadata = {
      license_key: licenseKey,
      source: "macwall",
      affonso_referral: input.affonsoReferral?.trim() || "",
      datafast_visitor_id: input.datafastVisitorId?.trim() || "",
      datafast_session_id: input.datafastSessionId?.trim() || "",
      offer_slug: offer.slug,
      billing_model: offer.billingModel,
      plan_slug: planSlug,
      max_devices: String(offer.maxDevices),
      pricing_region: region,
      unit_amount_usd: String(displayUnitAmount),
      visitor_country: input.country?.trim().toUpperCase() || "",
      ...(promoCode ? { promo_code: promoCode } : {}),
      ...(promotionCodeId ? { stripe_promotion_code_id: promotionCodeId } : {}),
    }

    // Critical path: Stripe only. Localhost measured ~1.1–1.2s for this hop.
    // Idempotency key is unique per license key so retries of the same intent
    // reuse the session; a new click mints a new key → new session (correct).
    // Stripe forbids pairing `discounts` with `allow_promotion_codes`.
    const session = await stripe.checkout.sessions.create(
      {
        mode: offer.billingModel === "annual" ? "subscription" : "payment",
        line_items: [{ price: stripePriceId, quantity: 1 }],
        success_url: `${siteOrigin}/activate?key=${encodedKey}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteOrigin}/pricing`,
        client_reference_id: licenseKey,
        // `auto` is faster at Checkout than always requiring a full address.
        billing_address_collection: "auto",
        ...(promotionCodeId
          ? { discounts: [{ promotion_code: promotionCodeId }] }
          : { allow_promotion_codes: true }),
        adaptive_pricing: { enabled: true },
        integration_identifier: CHECKOUT_INTEGRATION_ID,
        metadata,
        ...(offer.billingModel === "annual"
          ? { subscription_data: { metadata } }
          : {
              customer_creation: "always",
              payment_intent_data: { metadata },
            }),
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

    // Persist license + recovery after we already have a redirect URL.
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
          reason: "checkout_started",
        })
      } catch (queueError) {
        console.error(
          "[checkout] recovery queue failed",
          queueError instanceof Error ? queueError.message : "error"
        )
      }
    })

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
