import { getVisitorCountry } from "@/lib/geo/country-client"

/**
 * Ad / analytics pixel consent.
 *
 * EEA, UK and Swiss visitors (GDPR + ePrivacy) must opt in before ad pixels
 * load. Everyone else gets them by default, except browsers sending Global
 * Privacy Control, which California treats as an opt-out of "sharing".
 */
const STORAGE_KEY = "mw_cookie_consent"
const CHANGE_EVENT = "mw-consent-change"

export type ConsentChoice = "granted" | "denied"

/** EU/EEA members plus the UK and Switzerland. */
const CONSENT_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH",
])

const EUROPEAN_ATLANTIC_ZONES = new Set([
  "Atlantic/Azores",
  "Atlantic/Canary",
  "Atlantic/Faroe",
  "Atlantic/Madeira",
  "Atlantic/Reykjavik",
])

/**
 * The country cookie only lands on a few routes, so fall back to the
 * browser time zone. Over-asking (e.g. a non-EU European zone) is safe.
 */
export function requiresConsent(): boolean {
  const country = getVisitorCountry()
  if (country) return CONSENT_COUNTRIES.has(country)
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ""
    return zone.startsWith("Europe/") || EUROPEAN_ATLANTIC_ZONES.has(zone)
  } catch {
    return false
  }
}

export function globalPrivacyControl(): boolean {
  return (
    typeof navigator !== "undefined" &&
    (navigator as Navigator & { globalPrivacyControl?: boolean })
      .globalPrivacyControl === true
  )
}

export function readConsent(): ConsentChoice | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === "granted" || value === "denied" ? value : null
  } catch {
    return null
  }
}

export function writeConsent(choice: ConsentChoice | null): void {
  try {
    if (choice) window.localStorage.setItem(STORAGE_KEY, choice)
    else window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage blocked: the choice lasts for this page view only.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function subscribeConsent(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}

/** "allowed" | "blocked" | "ask" (consent region with no choice yet). */
export type AdPixelState = "allowed" | "blocked" | "ask"

export function adPixelState(): AdPixelState {
  if (globalPrivacyControl()) return "blocked"
  const choice = readConsent()
  if (choice === "granted") return "allowed"
  if (choice === "denied") return "blocked"
  return requiresConsent() ? "ask" : "allowed"
}
