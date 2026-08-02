/**
 * One-off: backfill macwall_licenses.visitor_country from Stripe Checkout
 * session metadata / billing address for recent active licenses.
 *
 * Usage: node --env-file=.env scripts/backfill-license-visitor-country.mjs
 */
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripeKey = process.env.STRIPE_SECRET_KEY?.trim()
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

if (!stripeKey || !supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Missing STRIPE_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY"
  )
  process.exit(1)
}

const stripe = new Stripe(stripeKey)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

function normalizeCountry(value) {
  const code = typeof value === "string" ? value.trim().toUpperCase() : ""
  if (!code || !/^[A-Z]{2}$/.test(code) || code === "XX") return null
  return code
}

const { data: rows, error } = await supabase
  .from("macwall_licenses")
  .select("id, stripe_checkout_session_id")
  .eq("status", "active")
  .is("visitor_country", null)
  .not("stripe_checkout_session_id", "is", null)
  .gte("activated_at", new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
  .order("activated_at", { ascending: false })
  .limit(300)

if (error) {
  console.error("query failed", error.message)
  process.exit(1)
}

let updated = 0
let skipped = 0
let failed = 0

for (const row of rows ?? []) {
  const sessionId = row.stripe_checkout_session_id
  if (!sessionId) {
    skipped += 1
    continue
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const country = normalizeCountry(
      session.metadata?.visitor_country ||
        session.customer_details?.address?.country
    )

    if (!country) {
      skipped += 1
      continue
    }

    const { error: updateError } = await supabase
      .from("macwall_licenses")
      .update({ visitor_country: country })
      .eq("id", row.id)

    if (updateError) {
      console.error("update failed", row.id, updateError.message)
      failed += 1
      continue
    }

    updated += 1
    process.stdout.write(".")
  } catch (err) {
    failed += 1
    console.error(
      "\nsession failed",
      sessionId,
      err instanceof Error ? err.message : err
    )
  }
}

console.log(
  `\nDone. updated=${updated} skipped=${skipped} failed=${failed} total=${(rows ?? []).length}`
)
