import { NextResponse, type NextRequest } from "next/server"

import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/admin/session"
import {
  applyCountryCookie,
  isIndiaCountry,
  MW_RESOLVED_COUNTRY_HEADER,
} from "@/lib/geo/country"
import { resolveVisitorCountry } from "@/lib/geo/resolve-visitor-country"
import {
  INDIA_QUOTE_COOKIE,
  INDIA_QUOTE_MAX_AGE_SECONDS,
  MW_INDIA_QUOTE_HEADER,
  parseIndiaQuotePayload,
  serializeIndiaQuote,
} from "@/lib/pricing/india-quote-transport"
import { fetchStripeIndiaQuote } from "@/lib/pricing/stripe-india-pricing"

/**
 * India INR display is estimated from USD list price; Stripe Checkout applies
 * INDIA50 and local currency at payment time.
 */
async function resolveIndiaQuoteOnEdge(_request: NextRequest) {
  const cached = parseIndiaQuotePayload(
    _request.cookies.get(INDIA_QUOTE_COOKIE)?.value
  )
  if (cached) return cached

  return fetchStripeIndiaQuote()
}

function applyIndiaQuoteCookie(
  response: NextResponse,
  serializedQuote: string
): NextResponse {
  response.cookies.set(INDIA_QUOTE_COOKIE, serializedQuote, {
    maxAge: INDIA_QUOTE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
  })

  return response
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const country = await resolveVisitorCountry({
    headers: request.headers,
    cookieCountry: request.cookies.get("mw_country")?.value,
    geoCountry: request.headers.get("x-vercel-ip-country"),
  })

  const requestHeaders = new Headers(request.headers)
  if (country) {
    requestHeaders.set(MW_RESOLVED_COUNTRY_HEADER, country)
  }

  let indiaQuoteSerialized: string | null = null
  if (isIndiaCountry(country)) {
    const quote = await resolveIndiaQuoteOnEdge(request)
    if (quote) {
      indiaQuoteSerialized = serializeIndiaQuote(quote)
      requestHeaders.set(MW_INDIA_QUOTE_HEADER, indiaQuoteSerialized)
    }
  }

  const withGeoCookies = (response: NextResponse) => {
    applyCountryCookie(response, country)
    if (indiaQuoteSerialized) {
      applyIndiaQuoteCookie(response, indiaQuoteSerialized)
    }
    return response
  }

  const next = () =>
    withGeoCookies(NextResponse.next({ request: { headers: requestHeaders } }))

  if (pathname === "/checkout") {
    const redirect = request.nextUrl.clone()
    redirect.pathname = "/api/checkout/create-session"
    return withGeoCookies(NextResponse.redirect(redirect, 308))
  }

  const isAdminSurface =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin")

  if (!isAdminSurface) {
    const ttclid = request.nextUrl.searchParams.get("ttclid")
    const utmSource = request.nextUrl.searchParams
      .get("utm_source")
      ?.toLowerCase()
    if (
      pathname === "/" &&
      (ttclid || utmSource === "tiktok" || utmSource === "tt")
    ) {
      const url = request.nextUrl.clone()
      url.pathname = "/tiktok"
      return withGeoCookies(NextResponse.rewrite(url))
    }

    return next()
  }

  const isLoginPage = pathname === "/admin/login"
  const isLoginApi = pathname === "/api/admin/login"
  if (isLoginPage || isLoginApi) {
    return next()
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (await verifyAdminSessionToken(token)) {
    return next()
  }

  if (pathname.startsWith("/api/")) {
    return withGeoCookies(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    )
  }

  const loginUrl = new URL("/admin/login", request.url)
  loginUrl.searchParams.set("next", pathname)
  return withGeoCookies(NextResponse.redirect(loginUrl))
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
