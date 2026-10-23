/**
 * Server-side `purchase_completed` (with `revenue` and `currency`) to PostHog,
 * sent by the Stripe license webhook next to the TikTok/X pixels.
 *
 * Whose event it is: the Mac that opened checkout. The app links checkout with
 * `visitor_id` (its install UUID, which is also its PostHog distinct_id), so
 * the purchase lands on the same person as `checkout_started` and
 * `license_activated` and the funnel checkout → paid → activated is one person.
 * A purchase made on the website without the app falls back to the buyer's
 * email (the app's trial email is also an `email` person property).
 *
 * Retries count once: the event uuid comes from the Checkout Session and the
 * timestamp from the Stripe event, so a redelivered webhook sends the exact same
 * event (PostHog dedupes on uuid + timestamp; a fresh `new Date()` on every
 * retry had made 3–6 copies of most purchases from 10-11 to 10-21).
 * GeoIP is off: the request comes from the server, not the buyer, and would
 * otherwise put the buyer's person in the server's country.
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

/**
 * The app's install id from checkout (`visitor_id` metadata): the same rule as
 * the site's `normalizeCheckoutVisitorId` (32–128 chars), and nothing that
 * could be an email. Anything else means "no app id".
 */
export function purchaseDistinctId(args: {
  visitorId?: string | null
  email: string
}): { distinctId: string; identity: "app_install" | "email" } {
  const visitorId = args.visitorId?.trim() ?? ""
  if (visitorId.length >= 32 && visitorId.length <= 128 && !visitorId.includes("@")) {
    return { distinctId: visitorId, identity: "app_install" }
  }
  return { distinctId: args.email.trim().toLowerCase(), identity: "email" }
}

/** The PostHog capture body for one purchase (pure, so it can be tested). */
export function buildPostHogPurchaseEvent(args: {
  email: string
  visitorId?: string | null
  uuid: string
  /** When the payment happened (the Stripe event's `created`), not when we send. */
  occurredAt: Date
  provider: "stripe"
  amount?: number | null
  currency?: string | null
  promoCode?: string | null
  plan?: string | null
  country?: string | null
}): { event: string; distinct_id: string; uuid: string; timestamp: string; properties: Record<string, unknown> } {
  const email = args.email.trim().toLowerCase()
  const { distinctId, identity } = purchaseDistinctId({ visitorId: args.visitorId, email })
  const occurredAt = Number.isFinite(args.occurredAt.getTime()) ? args.occurredAt : new Date()
  const properties: Record<string, unknown> = {
    provider: args.provider,
    identity,
    $geoip_disable: true,
    $set: { email, plan: "pro" },
    $set_once: { first_purchase_at: occurredAt.toISOString() },
  }
  if (typeof args.amount === "number" && Number.isFinite(args.amount)) {
    properties.revenue = args.amount
    properties.currency = (args.currency?.trim() || "USD").toUpperCase()
  }
  if (args.promoCode) properties.promo_code = args.promoCode
  if (args.plan) properties.plan = args.plan
  const country = args.country?.trim().toUpperCase() ?? ""
  if (/^[A-Z]{2}$/.test(country) && country !== "XX") {
    properties.country = country
    ;(properties.$set as Record<string, unknown>).purchase_country = country
  }
  return {
    event: "purchase_completed",
    distinct_id: distinctId,
    uuid: args.uuid,
    timestamp: occurredAt.toISOString(),
    properties,
  }
}

export async function sendPostHogPurchase(args: {
  email: string
  /** The app install that opened checkout (`session.metadata.visitor_id`). */
  visitorId?: string | null
  /** One per purchase, e.g. `stripe_<checkout session id>`; same seed = same event. */
  eventIdSeed: string
  occurredAt: Date
  provider: "stripe"
  /** Major units in `currency` (e.g. 441.5 for ₹441.50, 12.99 for $12.99). */
  amount?: number | null
  currency?: string | null
  promoCode?: string | null
  plan?: string | null
  country?: string | null
}): Promise<void> {
  const token = Deno.env.get("POSTHOG_PROJECT_TOKEN")?.trim() || POSTHOG_TOKEN_FALLBACK
  if (!token || !args.email.trim()) return
  try {
    const body = buildPostHogPurchaseEvent({
      ...args,
      uuid: await uuidFromSeed(args.eventIdSeed),
    })
    const res = await fetch(`${POSTHOG_HOST}/i/v0/e/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: token, ...body }),
    })
    if (!res.ok) console.error("[posthog] purchase_capture_failed", res.status)
  } catch (error) {
    console.error("[posthog] purchase_capture_exception", error instanceof Error ? error.message : "error")
  }
}
