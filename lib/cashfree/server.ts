import "server-only"

/**
 * Cashfree Payment Gateway (India only). REST, no SDK.
 *
 * Off unless CHECKOUT_INDIA_PROVIDER=cashfree and keys are set, so every
 * other environment keeps using the regular gateway for India too.
 * CASHFREE_ENV=production switches to the live API; anything else is sandbox.
 */
const API_VERSION = "2025-01-01"

export type CashfreeMode = "sandbox" | "production"

export class CashfreeApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = "CashfreeApiError"
  }
}

export function cashfreeMode(): CashfreeMode {
  return process.env.CASHFREE_ENV?.trim().toLowerCase() === "production"
    ? "production"
    : "sandbox"
}

function apiBase(): string {
  return cashfreeMode() === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg"
}

function credentials(): { appId: string; secret: string } {
  const appId = process.env.CASHFREE_APP_ID?.trim()
  const secret = process.env.CASHFREE_SECRET_KEY?.trim()
  if (!appId || !secret) {
    throw new CashfreeApiError("Cashfree keys are not configured.", 500)
  }
  return { appId, secret }
}

/** India checkout goes to Cashfree only when switched on and configured. */
export function isCashfreeIndiaEnabled(): boolean {
  return (
    process.env.CHECKOUT_INDIA_PROVIDER?.trim().toLowerCase() === "cashfree" &&
    Boolean(process.env.CASHFREE_APP_ID?.trim()) &&
    Boolean(process.env.CASHFREE_SECRET_KEY?.trim())
  )
}

async function cashfreeApi<T>(
  path: string,
  init: { method: "GET" | "POST"; body?: unknown; idempotencyKey?: string }
): Promise<T> {
  const { appId, secret } = credentials()
  const res = await fetch(`${apiBase()}${path}`, {
    method: init.method,
    headers: {
      "x-client-id": appId,
      "x-client-secret": secret,
      "x-api-version": API_VERSION,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.idempotencyKey
        ? { "x-idempotency-key": init.idempotencyKey }
        : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  })
  const data = (await res.json().catch(() => null)) as
    | (T & { message?: string; code?: string })
    | null
  if (!res.ok || !data) {
    throw new CashfreeApiError(
      data?.message || data?.code || `cashfree_${res.status}`,
      res.status
    )
  }
  return data
}

export type CashfreeOrderStatus = "ACTIVE" | "PAID" | "EXPIRED" | "TERMINATED"

export type CashfreeOrder = {
  cf_order_id: string | number
  order_id: string
  order_amount: number
  order_currency: string
  order_status: CashfreeOrderStatus
  payment_session_id?: string
  order_tags?: Record<string, string> | null
  customer_details?: {
    customer_id?: string
    customer_email?: string | null
    customer_phone?: string | null
  } | null
}

export type CreateCashfreeOrderInput = {
  orderId: string
  amountInr: number
  customer: { id: string; email: string | null; phone: string }
  returnUrl: string
  notifyUrl?: string
  note: string
  tags: Record<string, string>
}

export function createCashfreeOrder(
  input: CreateCashfreeOrderInput
): Promise<CashfreeOrder> {
  return cashfreeApi<CashfreeOrder>("/orders", {
    method: "POST",
    idempotencyKey: input.orderId,
    body: {
      order_id: input.orderId,
      order_amount: input.amountInr,
      order_currency: "INR",
      customer_details: {
        customer_id: input.customer.id,
        ...(input.customer.email
          ? { customer_email: input.customer.email }
          : {}),
        customer_phone: input.customer.phone,
      },
      order_meta: {
        return_url: input.returnUrl,
        ...(input.notifyUrl ? { notify_url: input.notifyUrl } : {}),
      },
      order_note: input.note,
      order_tags: input.tags,
    },
  })
}

export function getCashfreeOrder(orderId: string): Promise<CashfreeOrder> {
  return cashfreeApi<CashfreeOrder>(
    `/orders/${encodeURIComponent(orderId)}`,
    { method: "GET" }
  )
}
