export const DEFAULT_CHECKOUT_ERROR =
  "Could not start checkout. Please try again."

export type CheckoutSessionResult =
  | { ok: true; url: string }
  | { ok: false; error: string }

export function pricingPathWithCheckoutError(message: string): string {
  const trimmed = message.trim().slice(0, 120) || DEFAULT_CHECKOUT_ERROR
  return `/pricing?${new URLSearchParams({ checkout_error: trimmed }).toString()}`
}

export async function parseCheckoutCreateError(
  response: Response
): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string }
    const message = data.error?.trim()
    if (message) return message.slice(0, 120)
  } catch {
    // Response body was not JSON — fall through to status defaults.
  }

  if (response.status === 429) {
    return "Too many checkout attempts. Please wait a moment."
  }

  return DEFAULT_CHECKOUT_ERROR
}
