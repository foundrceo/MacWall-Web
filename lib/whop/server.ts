import "server-only"

/** Overridable for local tests against a mock Whop API. */
function whopApiBase(): string {
  const base = process.env.WHOP_API_BASE?.trim() || "https://api.whop.com/api/v1"
  return base.replace(/\/+$/, "")
}

/** MacWall's Whop business. Never FoundrList. */
export const WHOP_MACWALL_ACCOUNT_ID =
  process.env.WHOP_ACCOUNT_ID?.trim() || "biz_igjHj25vmVcNW8"

export class WhopApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
    this.name = "WhopApiError"
  }
}

/** Whether server-side Whop calls can be made at all. */
export function isWhopApiConfigured(): boolean {
  return Boolean(process.env.WHOP_API_KEY?.trim())
}

/** Hosted checkout for a plan; works without an API key (no metadata). */
export function whopPlanCheckoutUrl(planId: string): string {
  return `https://whop.com/checkout/${encodeURIComponent(planId)}`
}

function whopApiKey(): string {
  const key = process.env.WHOP_API_KEY?.trim()
  if (!key) throw new WhopApiError("WHOP_API_KEY is not configured.", 500)
  return key
}

/** Minimal JSON client for Whop's REST API (v1). */
export async function whopApi<T>(
  path: string,
  init: { method?: "GET" | "POST"; body?: unknown; idempotencyKey?: string } = {}
): Promise<T> {
  const res = await fetch(`${whopApiBase()}${path}`, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${whopApiKey()}`,
      "Content-Type": "application/json",
      ...(init.idempotencyKey ? { "Idempotency-Key": init.idempotencyKey } : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  })
  const data: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    const message =
      (data as { error?: { message?: string } } | null)?.error?.message ||
      `Whop API ${res.status}`
    throw new WhopApiError(message, res.status)
  }
  return data as T
}

export type WhopCheckoutConfiguration = {
  id: string
  purchase_url: string
}

export async function createWhopCheckoutConfiguration(args: {
  planId: string
  metadata: Record<string, string>
  redirectUrl: string
  idempotencyKey: string
}): Promise<WhopCheckoutConfiguration> {
  return whopApi<WhopCheckoutConfiguration>("/checkout_configurations", {
    method: "POST",
    idempotencyKey: args.idempotencyKey,
    body: {
      account_id: WHOP_MACWALL_ACCOUNT_ID,
      plan_id: args.planId,
      metadata: args.metadata,
      redirect_url: args.redirectUrl,
    },
  })
}
