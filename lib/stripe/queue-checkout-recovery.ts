import "server-only"

import { getSupabaseAdmin } from "@/lib/supabase/admin"

/** Match stripe-license-email edge enqueue delay. */
const RECOVERY_DELAY_MINUTES = 5

export type QueueCheckoutRecoveryInput = {
  checkoutSessionId: string
  licenseKey: string
  customerEmail?: string | null
  paymentIntentId?: string | null
  reason?: string | null
}

/**
 * Schedule a payment recovery email ~5 minutes from now.
 * Skips if the session was already sent or cancelled.
 * Actual send is done by `process-checkout-recovery` cron.
 */
export async function queueCheckoutRecovery(
  input: QueueCheckoutRecoveryInput
): Promise<void> {
  const supabase = getSupabaseAdmin()
  const scheduledAt = new Date(
    Date.now() + RECOVERY_DELAY_MINUTES * 60 * 1000
  ).toISOString()

  const { data: existing } = await supabase
    .from("macwall_checkout_recovery_queue")
    .select("status")
    .eq("checkout_session_id", input.checkoutSessionId)
    .maybeSingle()

  if (existing?.status === "sent" || existing?.status === "cancelled") {
    return
  }

  const row = {
    checkout_session_id: input.checkoutSessionId,
    license_key: input.licenseKey,
    customer_email: input.customerEmail?.trim() || null,
    payment_intent_id: input.paymentIntentId?.trim() || null,
    reason: input.reason?.trim() || "checkout_started",
    scheduled_send_at: scheduledAt,
    status: "pending" as const,
    sent_at: null,
    skip_reason: null,
    updated_at: new Date().toISOString(),
  }

  if (existing) {
    await supabase
      .from("macwall_checkout_recovery_queue")
      .update(row)
      .eq("checkout_session_id", input.checkoutSessionId)
  } else {
    await supabase.from("macwall_checkout_recovery_queue").insert(row)
  }
}
