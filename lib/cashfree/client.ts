/**
 * Browser side of India's Cashfree checkout. The buy button's checkout URL is
 * `/checkout/india?session=…&mode=…`; instead of navigating there, the
 * current page hands the session straight to Cashfree's hosted payment page.
 */

const CASHFREE_SDK_URL = "https://sdk.cashfree.com/js/v3/cashfree.js"

export type CashfreeMode = "sandbox" | "production"

type CashfreeInstance = {
  checkout: (options: {
    paymentSessionId: string
    redirectTarget: "_self"
  }) => Promise<{ error?: { message?: string } } | undefined>
}

declare global {
  interface Window {
    Cashfree?: (options: { mode: CashfreeMode }) => CashfreeInstance
  }
}

let sdkPromise: Promise<void> | null = null

/** Loads cashfree.js once; safe to call early so the click is instant. */
export function preloadCashfreeSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  if (window.Cashfree) return Promise.resolve()
  sdkPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script")
    script.src = CASHFREE_SDK_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      sdkPromise = null
      reject(new Error("cashfree_sdk_load_failed"))
    }
    document.head.appendChild(script)
  })
  return sdkPromise
}

/** The Cashfree session in a buy-button checkout URL, if it is one. */
export function cashfreeSessionFromUrl(
  url: string
): { session: string; mode: CashfreeMode } | null {
  try {
    const parsed = new URL(url, window.location.href)
    if (parsed.origin !== window.location.origin) return null
    if (parsed.pathname !== "/checkout/india") return null
    const session = parsed.searchParams.get("session")
    if (!session || !/^session_[\w-]+$/.test(session)) return null
    return {
      session,
      mode:
        parsed.searchParams.get("mode") === "production"
          ? "production"
          : "sandbox",
    }
  } catch {
    return null
  }
}

/**
 * Sends the browser to Cashfree's payment page for this session. Resolves
 * false if it could not open (SDK blocked, session rejected).
 */
export async function openCashfreeCheckout(
  session: string,
  mode: CashfreeMode
): Promise<boolean> {
  try {
    await preloadCashfreeSdk()
    if (!window.Cashfree) return false
    const result = await window.Cashfree({ mode }).checkout({
      paymentSessionId: session,
      redirectTarget: "_self",
    })
    return !result?.error
  } catch {
    return false
  }
}

export type CashfreeEmailStep = {
  offer: string
  promo: string | null
  until: string | null
}

/** Event the email dialog listens for; it calls preventDefault() to claim it. */
export const CASHFREE_EMAIL_STEP_EVENT = "macwall:cashfree-email-step"

/** The email step in a buy-button checkout URL (India, before an order exists). */
export function cashfreeEmailStepFromUrl(url: string): CashfreeEmailStep | null {
  try {
    const parsed = new URL(url, window.location.href)
    if (parsed.origin !== window.location.origin) return null
    if (parsed.pathname !== "/checkout/india") return null
    if (parsed.searchParams.has("session")) return null
    return {
      offer: parsed.searchParams.get("offer") || "permanent",
      promo: parsed.searchParams.get("promo"),
      until: parsed.searchParams.get("until"),
    }
  } catch {
    return null
  }
}

/** Asks the mounted email dialog to open; false when none is on the page. */
export function openCashfreeEmailStep(step: CashfreeEmailStep): boolean {
  const event = new CustomEvent<CashfreeEmailStep>(CASHFREE_EMAIL_STEP_EVENT, {
    detail: step,
    cancelable: true,
  })
  window.dispatchEvent(event)
  return event.defaultPrevented
}

export type StartCashfreeCheckoutResult =
  | { ok: true }
  | { ok: false; error: string }

/**
 * Creates the Cashfree order for the email the buyer typed and opens
 * Cashfree's payment page.
 */
export async function startCashfreeCheckout(
  step: CashfreeEmailStep,
  buyerEmail: string
): Promise<StartCashfreeCheckoutResult> {
  const fallback = "Couldn't start checkout. Please try again."
  try {
    void preloadCashfreeSdk().catch(() => {})
    const res = await fetch("/api/checkout/create-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        offer: step.offer,
        promo: step.promo ?? undefined,
        until: step.until ?? undefined,
        buyer_email: buyerEmail,
        intent: "click",
      }),
    })
    const data = (await res.json().catch(() => ({}))) as {
      url?: string
      error?: string
    }
    if (!res.ok || !data.url) return { ok: false, error: data.error || fallback }
    const cashfree = cashfreeSessionFromUrl(data.url)
    if (!cashfree) return { ok: false, error: fallback }
    const opened = await openCashfreeCheckout(cashfree.session, cashfree.mode)
    return opened ? { ok: true } : { ok: false, error: fallback }
  } catch {
    return { ok: false, error: fallback }
  }
}
