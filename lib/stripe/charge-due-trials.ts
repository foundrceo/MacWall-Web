import "server-only"

import { isIndiaCountry } from "@/lib/geo/country"
import { LICENSE_OFFERS, licenseOfferPriceCents } from "@/lib/license/offers.shared"
import { stripePriceIdForOffer } from "@/lib/license/stripe-price-map"
import { getStripe } from "@/lib/stripe/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

const TRIAL_BATCH = 25

type DueTrialRow = {
  id: string
  license_key: string
  stripe_customer_id: string | null
  stripe_payment_method_id: string | null
  visitor_country: string | null
}

export async function chargeDueMacWallTrials(): Promise<{
  scanned: number
  charged: number
  failed: number
  skipped: number
}> {
  const supabase = getSupabaseAdmin()
  const stripe = getStripe()
  const nowIso = new Date().toISOString()

  const { data, error } = await supabase
    .from("macwall_licenses")
    .select(
      "id, license_key, stripe_customer_id, stripe_payment_method_id, visitor_country"
    )
    .eq("status", "trial")
    .lte("trial_ends_at", nowIso)
    .is("stripe_payment_intent_id", null)
    .not("stripe_customer_id", "is", null)
    .not("stripe_payment_method_id", "is", null)
    .limit(TRIAL_BATCH)

  if (error) {
    throw new Error(error.message)
  }

  const rows = (data ?? []) as DueTrialRow[]
  let charged = 0
  let failed = 0
  let skipped = 0

  for (const row of rows) {
    const customerId = row.stripe_customer_id?.trim() ?? ""
    const paymentMethodId = row.stripe_payment_method_id?.trim() ?? ""
    if (!customerId.startsWith("cus_") || !paymentMethodId.startsWith("pm_")) {
      skipped += 1
      continue
    }

    const region = isIndiaCountry(row.visitor_country) ? "india" : "default"
    const offer = LICENSE_OFFERS.permanent
    const amount = licenseOfferPriceCents(offer, region)
    const priceId = stripePriceIdForOffer(offer.slug, region)

    try {
      const intent = await stripe.paymentIntents.create(
        {
          amount,
          currency: "usd",
          customer: customerId,
          payment_method: paymentMethodId,
          off_session: true,
          confirm: true,
          description: "MacWall Pro — 24-hour trial",
          metadata: {
            license_key: row.license_key,
            trial_charge: "1",
            offer_slug: "permanent",
            plan_slug: "pro",
            billing_model: "permanent",
            pricing_region: region,
            stripe_price_id: priceId,
          },
        },
        { idempotencyKey: `mw_trial_charge_${row.id}` }
      )

      const patch: Record<string, unknown> = {
        stripe_payment_intent_id: intent.id,
      }
      if (intent.status === "succeeded") {
        patch.status = "active"
        patch.activated_at = new Date().toISOString()
        patch.billing_model = "permanent"
        patch.plan_slug = "pro"
        charged += 1
      } else {
        failed += 1
      }

      await supabase
        .from("macwall_licenses")
        .update(patch)
        .eq("id", row.id)
        .is("stripe_payment_intent_id", null)
    } catch (chargeError) {
      failed += 1
      const message =
        chargeError instanceof Error ? chargeError.message : "charge_failed"
      console.error("[charge-trial]", row.license_key, message)

      const maybeIntentId = extractPaymentIntentId(chargeError)
      const patch: Record<string, unknown> = { status: "past_due" }
      if (maybeIntentId) {
        patch.stripe_payment_intent_id = maybeIntentId
      }
      await supabase.from("macwall_licenses").update(patch).eq("id", row.id)
    }
  }

  return { scanned: rows.length, charged, failed, skipped }
}

function extractPaymentIntentId(error: unknown): string | null {
  if (typeof error !== "object" || error === null) return null
  const record = error as {
    payment_intent?: { id?: string }
    raw?: { payment_intent?: { id?: string } }
  }
  const id =
    record.payment_intent?.id ?? record.raw?.payment_intent?.id ?? null
  return typeof id === "string" && id.startsWith("pi_") ? id : null
}
