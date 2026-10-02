import "server-only"

import { createHash, randomUUID } from "node:crypto"

import { after } from "next/server"

import { generateMacWallLicenseKey } from "@/lib/license/generate-license-key"
import {
  indiaFixedInr,
  licenseOfferFromSlug,
  licenseOfferPriceCents,
} from "@/lib/license/offers.shared"
import type {
  CreateMacWallCheckoutInput,
  CreateMacWallCheckoutResult,
} from "@/lib/stripe/create-macwall-checkout-session"
import {
  conversionPromoPercentOff,
  normalizeConversionPromo,
  parseOfferUntil,
} from "@/lib/stripe/conversion-promos"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { cashfreeMode, createCashfreeOrder } from "@/lib/cashfree/server"

/**
 * Cashfree requires a phone on every order. We don't ask buyers for one, so
 * orders carry this placeholder.
 */
const PLACEHOLDER_PHONE = "9999999999"

/**
 * India checkout on Cashfree, started straight from the pricing cards.
 *
 * Fixed rupee prices (₹499 / ₹799 / ₹1,299), not a live conversion. Cashfree
 * has no coupon field, so app/email codes (?promo=) are taken off the order
 * amount here, rounded to whole rupees (MAC10: ₹499 → ₹449).
 *
 * `buyerEmail` must be the email the buyer typed in the email step: it is
 * where the license key is sent. Never pass a guessed lead email.
 *
 * The returned URL carries the payment session; buy buttons open Cashfree
 * from the current page (lib/cashfree/client.ts) and never navigate to it.
 */
/**
 * Where an India buy click goes before the buyer has typed an email: the
 * email step. Buy buttons show it as a dialog on the current page; links
 * from the app or emails open it as /checkout/india. No order is created.
 */
export function cashfreeEmailStepUrl(
  input: CreateMacWallCheckoutInput
): CreateMacWallCheckoutResult {
  const offer = licenseOfferFromSlug(input.offerSlug ?? input.planSlug)
  const url = new URL("/checkout/india", input.siteOrigin)
  url.searchParams.set("offer", offer.slug)
  if (input.promoCode?.trim()) url.searchParams.set("promo", input.promoCode.trim())
  if (input.offerUntil?.trim()) url.searchParams.set("until", input.offerUntil.trim())
  return { ok: true, url: url.toString(), customerEmail: null }
}

export async function createMacWallCashfreeCheckout(
  input: CreateMacWallCheckoutInput,
  buyerEmail: string
): Promise<CreateMacWallCheckoutResult> {
  try {
    const siteOrigin = input.siteOrigin.replace(/\/+$/, "")
    const offer = licenseOfferFromSlug(input.offerSlug ?? input.planSlug)
    const usdCents = licenseOfferPriceCents(offer, "india")
    const listInr = indiaFixedInr(usdCents)
    const promoCode = normalizeConversionPromo(
      input.promoCode,
      parseOfferUntil(input.offerUntil)
    )
    const percentOff = conversionPromoPercentOff(promoCode)
    const amountInr = Math.max(1, Math.round((listInr * (100 - percentOff)) / 100))
    const planSlug = offer.maxDevices >= 5 ? "pro_plus" : "pro"
    const licenseKey = generateMacWallLicenseKey()
    const orderId = `mw_${randomUUID().replace(/-/g, "").slice(0, 24)}`
    const email = buyerEmail
    const customerId = `mw_${createHash("sha256")
      .update(email)
      .digest("hex")
      .slice(0, 32)}`

    const returnUrl = `${siteOrigin}/api/checkout/cashfree/return?order_id=${orderId}`
    // Payments and refunds are confirmed by the cashfree-license-email
    // Supabase function, which also emails the key (same as Whop).
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    const notifyUrl = supabaseUrl?.startsWith("https://")
      ? `${supabaseUrl}/functions/v1/cashfree-license-email`
      : undefined

    const order = await createCashfreeOrder({
      orderId,
      amountInr,
      customer: { id: customerId, email, phone: PLACEHOLDER_PHONE },
      returnUrl,
      notifyUrl,
      note: `MacWall ${offer.name}`,
      tags: {
        license_key: licenseKey,
        offer_slug: offer.slug,
        plan_slug: planSlug,
        max_devices: String(offer.maxDevices),
        visitor_country: (input.country ?? "").toUpperCase(),
        checkout_intent: input.intent ?? "click",
        list_amount_inr: String(listInr),
        // Marks the customer email as typed by the buyer. Orders without it
        // (made before 2026-10-02's fix) may carry a guessed email and are
        // never emailed the key.
        email_source: "buyer",
        ...(percentOff > 0 && promoCode ? { promo_code: promoCode } : {}),
        affonso_referral: input.affonsoReferral?.trim().slice(0, 100) || "",
      },
    })
    if (!order.payment_session_id) {
      throw new Error("order has no payment_session_id")
    }

    // Off the critical path, like Whop: the return route and the webhook
    // both create the license if this row never lands.
    after(async () => {
      const { error } = await getSupabaseAdmin().from("macwall_licenses").insert({
        license_key: licenseKey,
        source: "cashfree",
        status: "pending",
        plan_slug: planSlug,
        max_devices: offer.maxDevices,
        billing_model: offer.billingModel,
        cashfree_order_id: orderId,
        visitor_country: "IN",
        customer_email: email,
      })
      if (error) {
        console.error("[checkout/cashfree] license insert failed", error.message)
      }
    })

    const url = new URL("/checkout/india", siteOrigin)
    url.searchParams.set("session", order.payment_session_id)
    url.searchParams.set("mode", cashfreeMode())
    return { ok: true, url: url.toString(), customerEmail: email }
  } catch (error) {
    console.error(
      "[checkout/cashfree]",
      error instanceof Error ? error.message : "order failed"
    )
    return {
      ok: false,
      error:
        "Checkout is temporarily unavailable. Please try again shortly or email support@macwall.app.",
      status: 502,
    }
  }
}
