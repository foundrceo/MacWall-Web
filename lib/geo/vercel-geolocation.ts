import "server-only"

import { geolocation } from "@vercel/functions"

function normalizeCountry(value: string | null | undefined): string | null {
  const code = value?.trim().toUpperCase()
  if (!code || !/^[A-Z]{2}$/.test(code) || code === "XX") return null
  return code
}

/**
 * Vercel injects geo headers into Functions at request time. Building a Request
 * from `headers()` lets server components read country on the same request.
 */
export function resolveCountryFromVercelGeolocation(
  headers: Headers
): string | null {
  try {
    const { country } = geolocation(
      new Request("https://macwall.app", { headers })
    )
    return normalizeCountry(country)
  } catch {
    return null
  }
}
