import "server-only"

import { generateMacWallLicenseKey } from "@/lib/license/generate-license-key"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { getCashfreeOrder } from "@/lib/cashfree/server"

const LICENSE_KEY = /^MW-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/
const ALLOWED_MAX_DEVICES = new Set([1, 2, 3, 5, 10, 15, 20])
const ORDER_ID = /^mw_[a-z0-9]{24}$/

export function isMacWallCashfreeOrderId(value: string | null | undefined) {
  return ORDER_ID.test(value ?? "")
}

export type FulfilCashfreeResult =
  | {
      paid: true
      licenseKey: string
      amountInr: number
      email: string | null
      newlyActivated: boolean
    }
  | { paid: false; orderStatus: string }

/**
 * Re-reads the order from Cashfree (never trusts the browser or a webhook
 * body) and, once PAID, activates the MacWall license that rode along in the
 * order tags. Safe to call any number of times: the return redirect and the
 * webhook both land here.
 */
export async function fulfilCashfreeOrder(
  orderId: string
): Promise<FulfilCashfreeResult> {
  const order = await getCashfreeOrder(orderId)
  if (order.order_status !== "PAID") {
    return { paid: false, orderStatus: order.order_status }
  }

  const supabase = getSupabaseAdmin()
  const tags = order.order_tags ?? {}
  // Only trust the order's email when the buyer typed it (see email_source).
  const email =
    tags.email_source === "buyer"
      ? order.customer_details?.customer_email?.trim().toLowerCase() || null
      : null

  const { data: existing } = await supabase
    .from("macwall_licenses")
    .select("license_key, status")
    .eq("cashfree_order_id", orderId)
    .maybeSingle()

  const tagKey = tags.license_key?.trim().toUpperCase()
  const licenseKey =
    (existing?.license_key as string | undefined) ??
    (tagKey && LICENSE_KEY.test(tagKey) ? tagKey : generateMacWallLicenseKey())

  if (existing?.status === "active") {
    return {
      paid: true,
      licenseKey,
      amountInr: order.order_amount,
      email,
      newlyActivated: false,
    }
  }

  const tagDevices = Number(tags.max_devices)
  const maxDevices = ALLOWED_MAX_DEVICES.has(tagDevices) ? tagDevices : 3
  const fields = {
    status: "active",
    cashfree_order_id: orderId,
    activated_at: new Date().toISOString(),
    plan_slug: maxDevices >= 5 ? "pro_plus" : "pro",
    max_devices: maxDevices,
    billing_model: "permanent",
    visitor_country: "IN",
    ...(email ? { customer_email: email } : {}),
  }

  const { data: updated, error } = await supabase
    .from("macwall_licenses")
    .update(fields)
    .eq("license_key", licenseKey)
    .neq("status", "active")
    .select("id")
  if (error) throw new Error(`license_update: ${error.message}`)

  let newlyActivated = Boolean(updated && updated.length > 0)
  if (!newlyActivated) {
    // No pending row (insert failed or pruned) — create the active license.
    const { error: insertError } = await supabase
      .from("macwall_licenses")
      .insert({ license_key: licenseKey, source: "cashfree", ...fields })
    if (insertError && insertError.code !== "23505") {
      throw new Error(`license_insert: ${insertError.message}`)
    }
    newlyActivated = !insertError
  }

  return {
    paid: true,
    licenseKey,
    amountInr: order.order_amount,
    email,
    newlyActivated,
  }
}
