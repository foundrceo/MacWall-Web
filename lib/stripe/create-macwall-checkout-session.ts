import "server-only"

import { after } from "next/server"

import { isIndiaCountry } from "@/lib/geo/country"
import { generateMacWallLicenseKey } from "@/lib/license/generate-license-key"
import {
  formatUsd,
  isIndiaDiscountEligible,
  licenseOfferFromSlug,
  licenseOfferPriceCents,
  LICENSE_OFFERS,
} from "@/lib/license/offers.shared"
import { stripePriceIdForOffer } from "@/lib/license/stripe-price-map"
import { getStripe } from "@/lib/stripe/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { queueCheckoutRecovery } from "@/lib/stripe/queue-checkout-recovery"
import {
  normalizeConversionPromo,
  parseOfferUntil,
} from "@/lib/stripe/conversion-promos"

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
  /** Existing MW- key for `complete_trial` Checkout (saved Customer, no email field). */
  licenseKey?: string | null
}

export type CreateMacWallCheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string; status: number }

/**
 * Stable Dashboard label for this web Checkout surface.
 * Stripe best practice: include an 8-letter suffix for flow comparison.
 */
const CHECKOUT_INTEGRATION_ID = "macwall_web_checkout_kxqmvrnp"

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

function checkoutErrorMessage(error: unknown): string {
  const message =
    error instanceof Error ? error.message : "Checkout session failed."

  if (/expired api key/i.test(message)) {
    return "Checkout is temporarily unavailable. Please try again shortly or email support@macwall.app."
  }
  if (/invalid api key/i.test(message)) {
    return "Checkout is temporarily unavailable. Please try again shortly or email support@macwall.app."
  }
  if (/no such price/i.test(message)) {
    return "This pricing option is unavailable right now. Please refresh and try again."
  }

  return "Could not start checkout. Please try again."
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
  const special = (input.offerSlug ?? input.planSlug ?? "").trim().toLowerCase()
  if (special === "trial") {
    return createTrialSetupCheckoutSession(input)
  }
  if (special === "complete_trial") {
    return createCompleteTrialCheckoutSession(input)
  }

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
    const promoCode = normalizeConversionPromo(
      input.promoCode,
      parseOfferUntil(input.offerUntil)
    )
    const promotionCodeId = promoCode
      ? await resolvePromotionCodeId(stripe, promoCode)
      : null
    const metadata = {
      license_key: licenseKey,
      source: "macwall",
      affonso_referral: input.affonsoReferral?.trim() || "",
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
      error: checkoutErrorMessage(error),
      status: 500,
    }
  }
}

function trialPricingRegion(country: string | null): "india" | "default" {
  return isIndiaCountry(country) ? "india" : "default"
}

function trialCheckoutMetadata(
  input: CreateMacWallCheckoutInput,
  licenseKey: string,
  region: "india" | "default"
): Record<string, string> {
  const offer = LICENSE_OFFERS.permanent
  const displayUnitAmount = licenseOfferPriceCents(offer, region)
  return {
    license_key: licenseKey,
    source: "macwall",
    affonso_referral: input.affonsoReferral?.trim() || "",
    offer_slug: "trial",
    billing_model: "permanent",
    plan_slug: "pro",
    max_devices: "3",
    pricing_region: region,
    unit_amount_usd: String(displayUnitAmount),
    visitor_country: input.country?.trim().toUpperCase() || "",
  }
}

async function persistTrialLicenseRow(args: {
  licenseKey: string
  sessionId: string
  country: string | null
  customerId?: string | null
}): Promise<void> {
  const supabase = getSupabaseAdmin()
  const visitorCountry = args.country?.trim().toUpperCase() || null
  const licenseRow: Record<string, unknown> = {
    license_key: args.licenseKey,
    source: "stripe",
    status: "trial",
    plan_slug: "pro",
    max_devices: 3,
    billing_model: "permanent",
    stripe_checkout_session_id: args.sessionId,
    ...(args.customerId ? { stripe_customer_id: args.customerId } : {}),
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

  if (insertError?.message?.includes("stripe_customer_id")) {
    const { stripe_customer_id: _c, ...withoutCustomer } = licenseRow
    ;({ error: insertError } = await supabase
      .from("macwall_licenses")
      .insert(withoutCustomer))
  }

  if (insertError?.message?.includes("status")) {
    ;({ error: insertError } = await supabase.from("macwall_licenses").insert({
      license_key: args.licenseKey,
      source: "stripe",
      status: "pending",
      plan_slug: "pro",
      max_devices: 3,
      billing_model: "permanent",
      stripe_checkout_session_id: args.sessionId,
    }))
  }

  if (insertError) {
    console.error("[checkout] trial license insert failed", insertError.message)
  }
}

/**
 * Card-on-file 24h trial — Checkout setup mode, charge later at list Pro price.
 */
async function createTrialSetupCheckoutSession(
  input: CreateMacWallCheckoutInput
): Promise<CreateMacWallCheckoutResult> {
  try {
    const stripe = getStripe()
    const siteOrigin = input.siteOrigin.replace(/\/+$/, "")
    const region = trialPricingRegion(input.country)
    const offer = LICENSE_OFFERS.permanent
    const displayUnitAmount = licenseOfferPriceCents(offer, region)
    const priceLabel = formatUsd(displayUnitAmount)
    const licenseKey = generateMacWallLicenseKey()
    const encodedKey = encodeURIComponent(licenseKey)
    const metadata = trialCheckoutMetadata(input, licenseKey, region)

    const customer = await stripe.customers.create(
      {
        metadata: {
          license_key: licenseKey,
          source: "macwall_trial",
        },
      },
      { idempotencyKey: `mw_trial_customer_${licenseKey}` }
    )

    const session = await stripe.checkout.sessions.create(
      {
        mode: "setup",
        customer: customer.id,
        customer_update: { name: "auto", address: "auto" },
        payment_method_types: ["card"],
        success_url: `${siteOrigin}/activate?key=${encodedKey}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteOrigin}/pricing`,
        client_reference_id: licenseKey,
        billing_address_collection: "auto",
        integration_identifier: CHECKOUT_INTEGRATION_ID,
        metadata,
        setup_intent_data: { metadata },
        custom_text: {
          submit: {
            message: `Start your 24-hour Pro trial. We'll charge ${priceLabel} in 24 hours for lifetime MacWall Pro.`,
          },
        },
      },
      { idempotencyKey: `mw_trial_setup_${region}_${licenseKey}` }
    )

    if (!session.url) {
      return {
        ok: false,
        error: "Stripe did not return a checkout URL.",
        status: 502,
      }
    }

    after(async () => {
      await persistTrialLicenseRow({
        licenseKey,
        sessionId: session.id,
        country: input.country,
        customerId: customer.id,
      })
    })

    return { ok: true, url: session.url }
  } catch (error) {
    console.error(
      "[checkout] trial",
      error instanceof Error ? error.message : "Trial checkout failed."
    )
    return {
      ok: false,
      error: checkoutErrorMessage(error),
      status: 500,
    }
  }
}

/**
 * Failed off-session charge — pay on the same Stripe Customer (email already on file).
 */
async function createCompleteTrialCheckoutSession(
  input: CreateMacWallCheckoutInput
): Promise<CreateMacWallCheckoutResult> {
  const rawKey = input.licenseKey?.replace(/\s+/g, "") ?? ""
  if (!rawKey || rawKey.length < 8) {
    return {
      ok: false,
      error: "Open Complete payment from the MacWall app after your trial.",
      status: 400,
    }
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data: license, error } = await supabase
      .from("macwall_licenses")
      .select(
        "license_key, status, stripe_customer_id, visitor_country, plan_slug"
      )
      .eq("license_key", rawKey)
      .maybeSingle()

    if (error || !license) {
      return {
        ok: false,
        error: "That trial license was not found.",
        status: 404,
      }
    }

    const customerId =
      typeof license.stripe_customer_id === "string"
        ? license.stripe_customer_id
        : ""
    if (!customerId.startsWith("cus_")) {
      return {
        ok: false,
        error: "This trial has no saved card. Start checkout from the app again.",
        status: 409,
      }
    }

    const status = String(license.status ?? "")
    if (status !== "trial" && status !== "past_due") {
      return {
        ok: false,
        error: "This license does not need a trial payment.",
        status: 409,
      }
    }

    const stripe = getStripe()
    const siteOrigin = input.siteOrigin.replace(/\/+$/, "")
    const country =
      input.country ||
      (typeof license.visitor_country === "string"
        ? license.visitor_country
        : null)
    const region = trialPricingRegion(country)
    const offer = LICENSE_OFFERS.permanent
    const stripePriceId = stripePriceIdForOffer(offer.slug, region)
    const displayUnitAmount = licenseOfferPriceCents(offer, region)
    const encodedKey = encodeURIComponent(license.license_key)
    const metadata = {
      license_key: license.license_key,
      source: "macwall",
      offer_slug: "complete_trial",
      billing_model: "permanent",
      plan_slug: "pro",
      max_devices: "3",
      pricing_region: region,
      unit_amount_usd: String(displayUnitAmount),
      visitor_country: country?.trim().toUpperCase() || "",
      trial_charge: "complete",
    }

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer: customerId,
        line_items: [{ price: stripePriceId, quantity: 1 }],
        success_url: `${siteOrigin}/activate?key=${encodedKey}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteOrigin}/pricing`,
        client_reference_id: license.license_key,
        billing_address_collection: "auto",
        adaptive_pricing: { enabled: true },
        integration_identifier: CHECKOUT_INTEGRATION_ID,
        metadata,
        payment_intent_data: { metadata },
      },
      { idempotencyKey: `mw_complete_trial_${license.license_key}_${region}` }
    )

    if (!session.url) {
      return {
        ok: false,
        error: "Stripe did not return a checkout URL.",
        status: 502,
      }
    }

    return { ok: true, url: session.url }
  } catch (error) {
    console.error(
      "[checkout] complete_trial",
      error instanceof Error ? error.message : "Complete-trial checkout failed."
    )
    return {
      ok: false,
      error: checkoutErrorMessage(error),
      status: 500,
    }
  }
}
