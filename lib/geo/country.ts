import { type NextResponse } from "next/server"

/** ISO 3166-1 alpha-2 country code stored in a first-party cookie. */
export const COUNTRY_COOKIE = "mw_country" as const

const COUNTRY_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

export function resolveCountryFromHeaders(headers: Headers): string | null {
  const vercel = headers.get("x-vercel-ip-country")?.trim()
  if (vercel && vercel !== "XX") return vercel.toUpperCase()

  const cloudflare = headers.get("cf-ipcountry")?.trim()
  if (cloudflare && cloudflare !== "XX") return cloudflare.toUpperCase()

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
