"use client"

import { getAnalyticsSessionId } from "@/lib/analytics/client"
import {
  macwallProProperties,
  TIKTOK_CLICK_ID_COOKIE,
  TIKTOK_CLICK_ID_MAX_AGE_SEC,
  tiktokPurchaseEventId,
  type TikTokContent,
  type TikTokTrackEvent,
} from "@/lib/analytics/tiktok-shared"
import { adPixelState } from "@/lib/consent/consent-client"

/**
 * The base snippet (`TikTokPixel`) turns `window.ttq` into an array with
 * queueing methods. Until it runs we push the same `[method, ...args]`
 * entries onto a plain array, which the snippet keeps and the SDK replays,
 * so events fired on first render are not lost.
 */
type TikTokQueue = unknown[] & {
  track?: (...args: unknown[]) => void
  identify?: (...args: unknown[]) => void
}

declare global {
  interface Window {
    ttq?: TikTokQueue
  }
}

export type TikTokIdentifyInput = {
  email?: string
  phone_number?: string
  external_id?: string
}

const TTCLID_STORAGE_KEY = "macwall_ttclid"

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "")
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

/** Same rule as `AdPixelsGate`: no pixel and no Events API relay without it. */
function tiktokAllowed(): boolean {
  return typeof window !== "undefined" && adPixelState() === "allowed"
}

function callTikTok(method: "track" | "identify", ...args: unknown[]): void {
  const ttq = (window.ttq ??= [] as unknown as TikTokQueue)
  const fn = ttq[method]
  if (typeof fn === "function") fn.apply(ttq, args)
  else ttq.push([method, ...args])
}

function createEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
  return match?.[1] ? decodeURIComponent(match[1]) : undefined
}

function readStoredTtclid(): string | undefined {
  try {
    return (
      window.sessionStorage.getItem(TTCLID_STORAGE_KEY)?.trim() ||
      readCookie(TIKTOK_CLICK_ID_COOKIE)
    )
  } catch {
    return readCookie(TIKTOK_CLICK_ID_COOKIE)
  }
}

/**
 * First-party cookie so checkout (server) can copy the click id into Stripe
 * metadata for the webhook's Purchase event. Written only with ad consent.
 */
export function syncTikTokClickIdCookie(): void {
  if (!tiktokAllowed()) return
  const ttclid = readStoredTtclid()
  if (!ttclid || readCookie(TIKTOK_CLICK_ID_COOKIE) === ttclid) return
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${TIKTOK_CLICK_ID_COOKIE}=${encodeURIComponent(ttclid)}; Path=/; Max-Age=${TIKTOK_CLICK_ID_MAX_AGE_SEC}; SameSite=Lax${secure}`
}

/** Persist TikTok click id from ad landing URLs for Events API matching. */
export function captureTikTokClickIdFromUrl(): void {
  if (typeof window === "undefined") return

  const ttclid = new URLSearchParams(window.location.search)
    .get("ttclid")
    ?.trim()
  if (ttclid) {
    try {
      window.sessionStorage.setItem(TTCLID_STORAGE_KEY, ttclid)
    } catch {
      // ignore storage failures
    }
  }
  syncTikTokClickIdCookie()
}

/** Hash PII client-side, then call `ttq.identify` before conversion events. */
export async function identifyTikTokUser(
  input: TikTokIdentifyInput = {}
): Promise<void> {
  if (!tiktokAllowed()) return

  const payload: Record<string, string> = {}

  if (input.email) {
    payload.email = await sha256Hex(normalizeEmail(input.email))
  }
  if (input.phone_number) {
    payload.phone_number = await sha256Hex(normalizePhone(input.phone_number))
  }
  if (input.external_id) {
    payload.external_id = await sha256Hex(input.external_id)
  }

  if (Object.keys(payload).length === 0) return

  callTikTok("identify", payload)
}

export async function identifyTikTokSessionUser(
  extra?: Omit<TikTokIdentifyInput, "external_id">
): Promise<void> {
  const sessionId = getAnalyticsSessionId()
  if (!sessionId) return

  await identifyTikTokUser({
    ...extra,
    external_id: sessionId,
  })
}

function relayTikTokServerEvent(
  event: TikTokTrackEvent,
  eventId: string,
  options?: {
    email?: string
    phone?: string
    searchString?: string
  }
): void {
  const body = JSON.stringify({
    event,
    eventId,
    url: window.location.href,
    sessionId: getAnalyticsSessionId(),
    email: options?.email,
    phone: options?.phone,
    ttclid: readStoredTtclid(),
    ttp: readCookie("_ttp"),
    searchString: options?.searchString,
  })

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" })
    if (navigator.sendBeacon("/api/analytics/tiktok", blob)) return
  }

  void fetch("/api/analytics/tiktok", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body,
    keepalive: true,
  })
}

/** Pixel + Events API with one shared `event_id`, so TikTok keeps one copy. */
function dispatchTikTokEvent(
  event: TikTokTrackEvent,
  options?: {
    overrides?: Partial<TikTokContent>
    email?: string
    phone?: string
    searchString?: string
  }
): void {
  if (!tiktokAllowed()) return
  syncTikTokClickIdCookie()

  const eventId = createEventId()
  const params: Record<string, unknown> = {
    ...macwallProProperties(options?.overrides),
  }

  if (options?.searchString) {
    params.query = options.searchString
  }

  callTikTok("track", event, params, { event_id: eventId })
  relayTikTokServerEvent(event, eventId, {
    email: options?.email,
    phone: options?.phone,
    searchString: options?.searchString,
  })
}

export function trackTikTokViewContent(
  overrides?: Partial<TikTokContent>
): void {
  dispatchTikTokEvent("ViewContent", { overrides })
}

export function trackTikTokSearch(
  searchString: string,
  overrides?: Partial<TikTokContent>
): void {
  dispatchTikTokEvent("Search", { overrides, searchString })
}

export function trackTikTokAddToCart(overrides?: Partial<TikTokContent>): void {
  dispatchTikTokEvent("AddToCart", { overrides })
}

export function trackTikTokInitiateCheckout(
  overrides?: Partial<TikTokContent>
): void {
  dispatchTikTokEvent("InitiateCheckout", { overrides })
}

/**
 * Fires synchronously: the click navigates to Stripe right away, so an
 * awaited hash first would lose the event. Identify follows for later events.
 */
export async function trackTikTokInitiateCheckoutWithIdentify(
  identify?: TikTokIdentifyInput
): Promise<void> {
  trackTikTokInitiateCheckout()
  await identifyTikTokSessionUser(identify)
}

/**
 * Browser half of the Purchase. The Stripe webhook sends the same event with
 * the same `event_id` (from the Checkout Session id) via the Events API, so
 * TikTok dedupes them; this half carries the `_ttp` cookie and click context
 * the webhook may not have. Pixel only, no relay.
 */
export function trackTikTokPurchase(input: {
  checkoutSessionId: string
  value: number
  currency: string
}): void {
  if (!tiktokAllowed()) return
  callTikTok(
    "track",
    "Purchase",
    {
      ...macwallProProperties({ price: input.value }),
      value: input.value,
      currency: input.currency,
    },
    { event_id: tiktokPurchaseEventId(input.checkoutSessionId) }
  )
  void identifyTikTokSessionUser()
}
