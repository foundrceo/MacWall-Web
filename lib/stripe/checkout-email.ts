import "server-only"

import { getSupabaseAdmin } from "@/lib/supabase/admin"

/** First-party cookie so later pricing CTAs can reuse a known lead email. */
export const CHECKOUT_LEAD_EMAIL_COOKIE = "mw_lead_email"
export const CHECKOUT_VISITOR_ID_COOKIE = "mw_visitor_id"

const EMAIL_RE =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/i

/**
 * Normalize a checkout email for Stripe + recovery.
 * Returns null when missing or invalid (never blocks checkout).
 */
export function normalizeCheckoutEmail(
  raw: string | null | undefined
): string | null {
  const email = raw?.trim().toLowerCase() ?? ""
  if (email.length < 5 || email.length > 254) return null
  if (!EMAIL_RE.test(email)) return null
  return email
}

/** App / trial visitor ids are at least 32 chars (see macwall_trial_leads). */
export function normalizeCheckoutVisitorId(
  raw: string | null | undefined
): string | null {
  const id = raw?.trim() ?? ""
  if (id.length < 32 || id.length > 128) return null
  return id
}

/**
 * Prefer an explicit email; otherwise look up the trial lead for this visitor.
 */
export async function resolveCheckoutCustomerEmail(input: {
  email?: string | null
  visitorId?: string | null
}): Promise<string | null> {
  const fromParam = normalizeCheckoutEmail(input.email)
  if (fromParam) return fromParam

  const visitorId = normalizeCheckoutVisitorId(input.visitorId)
  if (!visitorId) return null

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from("macwall_trial_leads")
      .select("email")
      .eq("visitor_id", visitorId)
      .maybeSingle()

    if (error) {
      console.warn("[checkout] trial lead lookup", error.message)
      return null
    }

    return normalizeCheckoutEmail(data?.email)
  } catch (error) {
    console.warn(
      "[checkout] trial lead lookup failed",
      error instanceof Error ? error.message : "error"
    )
    return null
  }
}
