"use client"

import { getAnalyticsSessionId } from "@/lib/analytics/client"
import {
  macwallProProperties,
  type TikTokContent,
  type TikTokTrackEvent,
} from "@/lib/analytics/tiktok-shared"

declare global {
  interface Window {
    ttq?: {
      track: (...args: unknown[]) => void
      identify: (...args: unknown[]) => void
    }
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

function isTikTokAvailable(): boolean {
  return (
    typeof window !== "undefined" && typeof window.ttq?.track === "function"
  )
}

function createEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function readTtpCookie(): string | undefined {
  if (typeof document === "undefined") return undefined
  const match = document.cookie.match(/(?:^|;\s*)_ttp=([^;]+)/)
  return match?.[1] ? decodeURIComponent(match[1]) : undefined
}

/** Persist TikTok click id from ad landing URLs for Events API matching. */
export function captureTikTokClickIdFromUrl(): void {
  if (typeof window === "undefined") return

  const ttclid = new URLSearchParams(window.location.search)
    .get("ttclid")
    ?.trim()
  if (!ttclid) return

  try {
    window.sessionStorage.setItem(TTCLID_STORAGE_KEY, ttclid)
  } catch {
    // ignore storage failures
  }
}

function readStoredTtclid(): string | undefined {
  if (typeof window === "undefined") return undefined

  try {
    return (
      window.sessionStorage.getItem(TTCLID_STORAGE_KEY)?.trim() || undefined
    )
  } catch {
    return undefined
  }
}

/** Hash PII client-side, then call `ttq.identify` before conversion events. */
export async function identifyTikTokUser(
  input: TikTokIdentifyInput = {}
): Promise<void> {
  if (typeof window.ttq?.identify !== "function") return

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

  window.ttq.identify(payload)
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

function trackTikTokPixel(
  event: TikTokTrackEvent,
  params: Record<string, unknown>,
  eventId: string
): void {
  if (!isTikTokAvailable()) return
  window.ttq!.track(event, params, { event_id: eventId })
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
    ttp: readTtpCookie(),
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

async function dispatchTikTokEvent(
  event: TikTokTrackEvent,
  options?: {
    overrides?: Partial<TikTokContent>
    email?: string
    phone?: string
    searchString?: string
  }
): Promise<void> {
  const eventId = createEventId()
  const params: Record<string, unknown> = {
    ...macwallProProperties(options?.overrides),
  }

  if (options?.searchString) {
    params.query = options.searchString
  }

  trackTikTokPixel(event, params, eventId)
  relayTikTokServerEvent(event, eventId, {
    email: options?.email,
    phone: options?.phone,
    searchString: options?.searchString,
  })
}

export function trackTikTokViewContent(
  overrides?: Partial<TikTokContent>
): void {
  void dispatchTikTokEvent("ViewContent", { overrides })
}

export function trackTikTokAddToWishlist(
  overrides?: Partial<TikTokContent>
): void {
  void dispatchTikTokEvent("AddToWishlist", { overrides })
}

export function trackTikTokSearch(
  searchString: string,
  overrides?: Partial<TikTokContent>
): void {
  void dispatchTikTokEvent("Search", { overrides, searchString })
}

export function trackTikTokAddPaymentInfo(
  overrides?: Partial<TikTokContent>
): void {
  void dispatchTikTokEvent("AddPaymentInfo", { overrides })
}

export function trackTikTokAddToCart(overrides?: Partial<TikTokContent>): void {
  void dispatchTikTokEvent("AddToCart", { overrides })
}

export function trackTikTokInitiateCheckout(
  overrides?: Partial<TikTokContent>
): void {
  void dispatchTikTokEvent("InitiateCheckout", { overrides })
}

export function trackTikTokPlaceAnOrder(
  overrides?: Partial<TikTokContent>
): void {
  void dispatchTikTokEvent("PlaceAnOrder", { overrides })
}

export function trackTikTokCompleteRegistration(
  overrides?: Partial<TikTokContent>
): void {
  void dispatchTikTokEvent("CompleteRegistration", { overrides })
}

export function trackTikTokPurchase(overrides?: Partial<TikTokContent>): void {
  void dispatchTikTokEvent("Purchase", { overrides })
}

export function trackTikTokCompletePayment(
  overrides?: Partial<TikTokContent>
): void {
  void dispatchTikTokEvent("CompletePayment", { overrides })
}

export async function trackTikTokInitiateCheckoutWithIdentify(
  identify?: TikTokIdentifyInput
): Promise<void> {
  await identifyTikTokSessionUser(identify)
  trackTikTokInitiateCheckout()
}

export async function trackTikTokPurchaseWithIdentify(
  identify?: TikTokIdentifyInput
): Promise<void> {
  await identifyTikTokSessionUser(identify)
  await dispatchTikTokEvent("Purchase", { email: identify?.email })
  await dispatchTikTokEvent("CompletePayment", { email: identify?.email })
  await dispatchTikTokEvent("PlaceAnOrder", { email: identify?.email })
}

export function readCheckoutEmailFromSearch(
  searchParams: URLSearchParams
): string | undefined {
  for (const key of ["email", "customer_email", "user_email"]) {
    const value = searchParams.get(key)?.trim()
    if (value?.includes("@")) return value
  }
  return undefined
}
