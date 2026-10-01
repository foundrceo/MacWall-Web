import "server-only"

import { after } from "next/server"

import { isIndiaCountry } from "@/lib/geo/country"
import { generateMacWallLicenseKey } from "@/lib/license/generate-license-key"
import {
  isIndiaDiscountEligible,
  licenseOfferFromSlug,
  licenseOfferPriceCents,
} from "@/lib/license/offers.shared"
import type {
  CreateMacWallCheckoutInput,
  CreateMacWallCheckoutResult,
} from "@/lib/stripe/create-macwall-checkout-session"
import {
  normalizeCheckoutVisitorId,
  resolveCheckoutCustomerEmail,
} from "@/lib/stripe/checkout-email"
import {
  normalizeConversionPromo,
  parseOfferUntil,
} from "@/lib/stripe/conversion-promos"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { whopPlanIdForOffer } from "@/lib/whop/plan-map"
import { createWhopCheckoutConfiguration } from "@/lib/whop/server"

/**
 * One-time Whop checkout for a paid MacWall license.
 *
 * Same contract as the Stripe flow: the license key is minted here, travels
 * in the checkout metadata (Whop copies it onto the payment), and a pending
 * `macwall_licenses` row waits for the `whop-license-email` webhook to
 * activate it and email the key.
 */
export async function createMacWallWhopCheckout(
  input: CreateMacWallCheckoutInput
): Promise<CreateMacWallCheckoutResult> {
  try {
    const siteOrigin = input.siteOrigin.replace(/\/+$/, "")
    const offer = licenseOfferFromSlug(input.offerSlug ?? input.planSlug)
    const region =
      isIndiaCountry(input.country) && isIndiaDiscountEligible(offer.slug)
        ? "india"
        : "default"
    const unitAmount = licenseOfferPriceCents(offer, region)
    const planSlug = offer.maxDevices >= 5 ? "pro_plus" : "pro"
    const planId = whopPlanIdForOffer(offer.slug, region)

    const licenseKey = generateMacWallLicenseKey()
    const promoCode = normalizeConversionPromo(
      input.promoCode,
      parseOfferUntil(input.offerUntil)
    )
    const customerEmail = await resolveCheckoutCustomerEmail({
      email: input.customerEmail,
      visitorId: input.visitorId,
    })
    const visitorId = normalizeCheckoutVisitorId(input.visitorId)
    const visitorCountry = input.country?.trim().toUpperCase() || ""

    const metadata: Record<string, string> = {
      license_key: licenseKey,
      source: "macwall",
      affonso_referral: input.affonsoReferral?.trim() || "",
      offer_slug: offer.slug,
      billing_model: offer.billingModel,
      plan_slug: planSlug,
      max_devices: String(offer.maxDevices),
      pricing_region: region,
      unit_amount_usd: String(unitAmount),
      visitor_country: visitorCountry,
      checkout_intent: input.intent ?? "click",
      ...(promoCode ? { promo_code: promoCode } : {}),
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      ...(visitorId ? { visitor_id: visitorId } : {}),
    }

    const checkout = await createWhopCheckoutConfiguration({
      planId,
      metadata,
      redirectUrl: `${siteOrigin}/activate?key=${encodeURIComponent(licenseKey)}&provider=whop`,
      idempotencyKey: `mw_whop_checkout_${licenseKey}`,
    })

    const url = new URL(checkout.purchase_url)
    if (promoCode) url.searchParams.set("promoCode", promoCode)
    if (customerEmail) url.searchParams.set("email", customerEmail)

    after(async () => {
      const { error } = await getSupabaseAdmin()
        .from("macwall_licenses")
        .insert({
          license_key: licenseKey,
          source: "whop",
          status: "pending",
          plan_slug: planSlug,
          max_devices: offer.maxDevices,
          billing_model: offer.billingModel,
          whop_checkout_id: checkout.id,
          ...(customerEmail ? { customer_email: customerEmail } : {}),
          ...(/^[A-Z]{2}$/.test(visitorCountry)
            ? { visitor_country: visitorCountry }
            : {}),
        })
      if (error) {
        console.error("[checkout/whop] license insert failed", error.message)
      }
    })

    return { ok: true, url: url.toString(), customerEmail }
  } catch (error) {
    console.error(
      "[checkout/whop]",
      error instanceof Error ? error.message : "Checkout failed."
    )
    return {
      ok: false,
      error:
        "Checkout is temporarily unavailable. Please try again shortly or email support@macwall.app.",
      status: 502,
    }
  }
}
