import { type NextResponse } from "next/server"

/** ISO 3166-1 alpha-2 country code stored in a first-party cookie. */
export const COUNTRY_COOKIE = "mw_country" as const

/** Set by middleware from `request.geo` — Node server components do not get Vercel geo headers directly. */
export const MW_RESOLVED_COUNTRY_HEADER = "x-mw-resolved-country" as const

const COUNTRY_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

function normalizeCountryCode(value: string | null | undefined): string | null {
  const code = value?.trim().toUpperCase()
  if (!code || !/^[A-Z]{2}$/.test(code) || code === "XX") return null
  return code
}

export function resolveCountryFromHeaders(headers: Headers): string | null {
  const fromMiddleware = normalizeCountryCode(
    headers.get(MW_RESOLVED_COUNTRY_HEADER)
  )
  if (fromMiddleware) return fromMiddleware

  const vercel = normalizeCountryCode(headers.get("x-vercel-ip-country"))
  if (vercel) return vercel

  const cloudflare = normalizeCountryCode(headers.get("cf-ipcountry"))
  if (cloudflare) return cloudflare

  return null
}

export function applyCountryCookie(
  response: NextResponse,
  country: string | null
): NextResponse {
  if (!country || !/^[A-Z]{2}$/.test(country)) return response

  response.cookies.set(COUNTRY_COOKIE, country, {
    maxAge: COUNTRY_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
  })

  return response
}

export function isIndiaCountry(country: string | null | undefined): boolean {
  return country?.toUpperCase() === "IN"
}
