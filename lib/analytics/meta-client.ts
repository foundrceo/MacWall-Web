"use client"

import {
  macwallMetaPurchaseParams,
  type MetaTrackEvent,
} from "@/lib/analytics/meta-shared"

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

function isMetaAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.fbq === "function"
}

function createEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function trackMetaPixel(
  event: MetaTrackEvent,
  params: Record<string, unknown>,
  eventId: string
): void {
  if (!isMetaAvailable()) return
  window.fbq!("track", event, params, { eventID: eventId })
}

function trackWhenReady(
  event: MetaTrackEvent,
  params: Record<string, unknown>,
  eventId: string
): void {
  if (isMetaAvailable()) {
    trackMetaPixel(event, params, eventId)
    return
  }

  window.setTimeout(() => {
    trackMetaPixel(event, params, eventId)
  }, 1200)
}

export function trackMetaViewContent(): void {
  const eventId = createEventId()
  trackWhenReady("ViewContent", macwallMetaPurchaseParams(), eventId)
}

export function trackMetaAddToCart(): void {
  const eventId = createEventId()
  trackWhenReady("AddToCart", macwallMetaPurchaseParams(), eventId)
}

export function trackMetaInitiateCheckout(): void {
  const eventId = createEventId()
  trackWhenReady("InitiateCheckout", macwallMetaPurchaseParams(), eventId)
}

export function trackMetaPurchase(options?: {
  value?: number
  currency?: string
}): void {
  const eventId = createEventId()
  trackWhenReady(
    "Purchase",
    macwallMetaPurchaseParams({
      value: options?.value,
      currency: options?.currency,
    }),
    eventId
  )
}

/** Persist Meta click id from ad landing URLs for later matching. */
export function captureMetaClickIdFromUrl(): void {
  if (typeof window === "undefined") return

  const fbclid = new URLSearchParams(window.location.search)
    .get("fbclid")
    ?.trim()
  if (!fbclid) return

  try {
    window.sessionStorage.setItem("macwall_fbclid", fbclid)
  } catch {
    // ignore storage failures
  }
}
