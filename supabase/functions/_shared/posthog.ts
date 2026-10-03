/**
 * Server-side purchase event to PostHog (US cloud), sent by the license
 * webhooks (Stripe, Whop, Cashfree) next to the TikTok/X pixels. Powers
 * PostHog revenue analytics: `revenue` + `currency` on `purchase_completed`.
 *
 * The person is keyed by the buyer's email, with `email` set on it, so it
 * lines up with the app's person (which carries the trial email). A stable
 * event uuid from the payment id means webhook retries count once.
 * Never throws: analytics must not break license delivery.
 */

// Public project token (write-only ingestion key; also shipped in the app and site).
const POSTHOG_TOKEN_FALLBACK = "phc_rFwFsuj8gyhuhf9kKMGyqmxZ2YxUNifBe65j99o7JrtH"
const POSTHOG_HOST = "https://us.i.posthog.com"

async function uuidFromSeed(seed: string): Promise<string> {
  const digest = new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(seed))
  ).slice(0, 16)
  digest[6] = (digest[6] & 0x0f) | 0x50 // version 5 style
  digest[8] = (digest[8] & 0x3f) | 0x80 // RFC 4122 variant
  const hex = Array.from(digest).map((b) => b.toString(16).padStart(2, "0")).join("")
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export async function sendPostHogPurchase(args: {
  email: string
  /** Payment id seed, e.g. `whop_<paymentId>`; same seed = same event. */
  eventIdSeed: string
  provider: "stripe" | "whop" | "cashfree"
  /** Major units in `currency` (e.g. 441.5 for ₹441.50, 12.99 for $12.99). */
  amount?: number | null
  currency?: string | null
  promoCode?: string | null
  plan?: string | null
  country?: string | null
}): Promise<void> {
  const token = Deno.env.get("POSTHOG_PROJECT_TOKEN")?.trim() || POSTHOG_TOKEN_FALLBACK
  const email = args.email.trim().toLowerCase()
  if (!token || !email) return
  const properties: Record<string, unknown> = {
    provider: args.provider,
    $set: { email, plan: "pro" },
    $set_once: { first_purchase_at: new Date().toISOString() },
  }
  if (typeof args.amount === "number" && Number.isFinite(args.amount)) {
    properties.revenue = args.amount
    properties.currency = (args.currency?.trim() || "USD").toUpperCase()
  }
  if (args.promoCode) properties.promo_code = args.promoCode
  if (args.plan) properties.plan = args.plan
  if (args.country) properties.country = args.country
  try {
    const res = await fetch(`${POSTHOG_HOST}/i/v0/e/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: token,
        event: "purchase_completed",
        distinct_id: email,
        uuid: await uuidFromSeed(args.eventIdSeed),
        timestamp: new Date().toISOString(),
        properties,
      }),
    })
    if (!res.ok) console.error("[posthog] purchase_capture_failed", res.status)
  } catch (error) {
    console.error("[posthog] purchase_capture_exception", error instanceof Error ? error.message : "error")
  }
}
