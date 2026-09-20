"use client"

import { AFFONSO_REFERRAL_COOKIE } from "@/lib/macwall-affiliate"
import {
  DEFAULT_CHECKOUT_ERROR,
  type CheckoutSessionResult,
  parseCheckoutCreateError,
} from "@/lib/checkout/checkout-session-client"

type CachedCheckout = {
  url: string
  expiresAt: number
  /** Affonso referral present when this Stripe session was created. */
  affonsoReferral: string
  /** Lead email baked into the session (empty when unknown). */
  email: string
}

const cache = new Map<string, CachedCheckout>()
const inflight = new Map<string, Promise<CheckoutSessionResult>>()
/** After a failed create (e.g. 429), pause background retries. */
const failureCooldownUntil = new Map<string, number>()

/** Stripe Checkout Sessions stay open for hours; keep client cache shorter. */
const CACHE_TTL_MS = 20 * 60 * 1000
const FAILURE_COOLDOWN_MS = 65_000

const LEAD_EMAIL_COOKIE = "mw_lead_email"
const VISITOR_ID_COOKIE = "mw_visitor_id"

function offerKey(offer: string): string {
  return offer.trim() || "permanent"
}

function readCookie(name: string): string {
  if (typeof document === "undefined") return ""
  const prefix = `${name}=`
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
  if (!match) return ""
  try {
    return decodeURIComponent(match.slice(prefix.length)).trim()
  } catch {
    return match.slice(prefix.length).trim()
  }
}

/** Current Affonso click id from the first-party cookie (empty when absent). */
export function readAffonsoReferralCookie(): string {
  return readCookie(AFFONSO_REFERRAL_COOKIE)
}

export function readCheckoutLeadEmailCookie(): string {
  return readCookie(LEAD_EMAIL_COOKIE)
}

export function readCheckoutVisitorIdCookie(): string {
  return readCookie(VISITOR_ID_COOKIE)
}

export type CheckoutHrefParams = {
  offer: string
  email: string | null
  visitorId: string | null
  promo: string | null
  until: string | null
}

/**
 * Parse offer + optional lead identity from a checkout API href.
 * Email CTAs and the Mac app can append `email` / `visitor_id`.
 */
export function parseCheckoutHrefParams(href: string): CheckoutHrefParams | null {
  try {
    const url = new URL(href, "https://macwall.app")
    if (!url.pathname.includes("/api/checkout/")) return null
    const offer =
      url.searchParams.get("offer") ||
      url.searchParams.get("plan") ||
      "permanent"
    return {
      offer,
      email: url.searchParams.get("email"),
      visitorId:
        url.searchParams.get("visitor_id") ||
        url.searchParams.get("visitorId"),
      promo: url.searchParams.get("promo"),
      until: url.searchParams.get("until"),
    }
  } catch {
    return null
  }
}

/**
 * Cache key includes Affonso referral + lead email so a session created
 * without email is never reused after we learn who the buyer is.
 */
function cacheKey(offer: string, affonsoReferral: string, email: string): string {
  return `${offerKey(offer)}::${affonsoReferral}::${email}`
}

export function offerSlugFromCheckoutHref(href: string): string | null {
  return parseCheckoutHrefParams(href)?.offer ?? null
}

function resolveLeadEmail(explicit?: string | null): string {
  return (explicit?.trim() || readCheckoutLeadEmailCookie()).toLowerCase()
}

function resolveVisitorId(explicit?: string | null): string {
  return explicit?.trim() || readCheckoutVisitorIdCookie()
}

export function getPrefetchedCheckoutUrl(
  offer: string,
  email?: string | null
): string | null {
  const referral = readAffonsoReferralCookie()
  const leadEmail = resolveLeadEmail(email)
  const key = cacheKey(offer, referral, leadEmail)
  const hit = cache.get(key)
  if (!hit) return null
  if (hit.expiresAt <= Date.now()) {
    cache.delete(key)
    return null
  }
  if (hit.affonsoReferral !== referral || hit.email !== leadEmail) {
    cache.delete(key)
    return null
  }
  return hit.url
}

function isCoolingDown(key: string): boolean {
  const until = failureCooldownUntil.get(key)
  if (!until) return false
  if (until <= Date.now()) {
    failureCooldownUntil.delete(key)
    return false
  }
  return true
}

type PrefetchOptions = {
  /** User-initiated click — bypass background failure cooldown. */
  force?: boolean
  email?: string | null
  visitorId?: string | null
  promo?: string | null
  until?: string | null
}

/**
 * Create (or reuse) a Checkout Session URL so a click can redirect with no wait.
 *
 * Call only on real purchase intent (mousedown, focus, or touch on a checkout CTA).
 * Every call mints a Stripe session, a license key, a `pending` row in
 * `macwall_licenses`, and a recovery-queue row.
 */
export function prefetchCheckoutSession(
  offer: string,
  options: PrefetchOptions = {}
): Promise<CheckoutSessionResult> {
  const slug = offerKey(offer)
  const referralAtStart = readAffonsoReferralCookie()
  const email = resolveLeadEmail(options.email)
  const visitorId = resolveVisitorId(options.visitorId)
  const key = cacheKey(slug, referralAtStart, email)
  const existing = getPrefetchedCheckoutUrl(slug, email)
  if (existing) return Promise.resolve({ ok: true, url: existing })

  if (!options.force && isCoolingDown(key)) {
    return Promise.resolve({ ok: false, error: DEFAULT_CHECKOUT_ERROR })
  }

  const pending = inflight.get(key)
  if (pending) return pending

  if (options.force) {
    failureCooldownUntil.delete(key)
  }

  const request = (async (): Promise<CheckoutSessionResult> => {
    try {
      const body: Record<string, string> = { offer: slug }
      if (email) body.email = email
      if (visitorId) body.visitor_id = visitorId
      const promo = options.promo?.trim()
      if (promo) body.promo = promo
      const until = options.until?.trim()
      if (until) body.until = until

      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        const error = await parseCheckoutCreateError(response)
        failureCooldownUntil.set(key, Date.now() + FAILURE_COOLDOWN_MS)
        return { ok: false, error }
      }
      const data = (await response.json()) as { url?: string }
      const url = data.url?.trim()
      if (!url) {
        failureCooldownUntil.set(key, Date.now() + FAILURE_COOLDOWN_MS)
        return { ok: false, error: DEFAULT_CHECKOUT_ERROR }
      }

      const referralNow = readAffonsoReferralCookie()
      // Pixel set the cookie after this request left the browser — Stripe metadata
      // is empty. Do not cache under the new referral; callers must recreate.
      if (referralNow !== referralAtStart) {
        failureCooldownUntil.delete(key)
        return { ok: false, error: DEFAULT_CHECKOUT_ERROR }
      }

      failureCooldownUntil.delete(key)
      cache.set(key, {
        url,
        expiresAt: Date.now() + CACHE_TTL_MS,
        affonsoReferral: referralAtStart,
        email,
      })
      return { ok: true, url }
    } catch {
      failureCooldownUntil.set(key, Date.now() + FAILURE_COOLDOWN_MS)
      return { ok: false, error: DEFAULT_CHECKOUT_ERROR }
    } finally {
      inflight.delete(key)
    }
  })()

  inflight.set(key, request)
  return request
}

export function takePrefetchedCheckoutUrl(
  offer: string,
  email?: string | null
): string | null {
  const referral = readAffonsoReferralCookie()
  const leadEmail = resolveLeadEmail(email)
  const key = cacheKey(offer, referral, leadEmail)
  const url = getPrefetchedCheckoutUrl(offer, leadEmail)
  if (!url) return null
  // One-shot — avoid two tabs/clicks sharing the same session accidentally.
  cache.delete(key)
  return url
}

/**
 * On affiliate landings (`?atp=` / `affonso_id=`), wait briefly for the pixel
 * to set `affonso_referral` before warming Stripe — otherwise metadata is empty.
 */
export async function waitForAffonsoReferralIfLanding(
  timeoutMs = 2500
): Promise<string> {
  if (typeof window === "undefined") return ""
  const params = new URLSearchParams(window.location.search)
  const expectingReferral =
    params.has("atp") ||
    params.has("affonso_id") ||
    params.has("via") ||
    Boolean(readAffonsoReferralCookie())
  if (!expectingReferral) return ""

  const existing = readAffonsoReferralCookie()
  if (existing) return existing

  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 50)
    })
    const value = readAffonsoReferralCookie()
    if (value) return value
  }
  return readAffonsoReferralCookie()
}

/**
 * Resolve a Stripe Checkout URL for a CTA click.
 * Prefer cached/in-flight session; otherwise create one (forced).
 * Never use GET /api/checkout/create-session as a fallback (429 → /pricing error).
 */
export async function waitForPrefetchedCheckoutUrl(
  offer: string,
  options: Omit<PrefetchOptions, "force"> = {}
): Promise<CheckoutSessionResult> {
  await waitForAffonsoReferralIfLanding(1500)

  const email = resolveLeadEmail(options.email)
  const ready = takePrefetchedCheckoutUrl(offer, email)
  if (ready) return { ok: true, url: ready }

  const referral = readAffonsoReferralCookie()
  const key = cacheKey(offer, referral, email)
  const pending = inflight.get(key)
  if (pending) {
    const fromPending = await pending
    if (fromPending.ok) {
      if (readAffonsoReferralCookie() !== referral) {
        return createCheckoutUrlForClick(offer, options)
      }
      const url = takePrefetchedCheckoutUrl(offer, email) ?? fromPending.url
      return { ok: true, url }
    }
  }

  return createCheckoutUrlForClick(offer, options)
}

async function createCheckoutUrlForClick(
  offer: string,
  options: Omit<PrefetchOptions, "force"> = {}
): Promise<CheckoutSessionResult> {
  const created = await prefetchCheckoutSession(offer, {
    ...options,
    force: true,
  })
  if (created.ok) {
    const email = resolveLeadEmail(options.email)
    const url = takePrefetchedCheckoutUrl(offer, email) ?? created.url
    return { ok: true, url }
  }
  if (readAffonsoReferralCookie()) {
    const retry = await prefetchCheckoutSession(offer, {
      ...options,
      force: true,
    })
    if (retry.ok) {
      const email = resolveLeadEmail(options.email)
      const url = takePrefetchedCheckoutUrl(offer, email) ?? retry.url
      return { ok: true, url }
    }
    return retry
  }
  return created
}
