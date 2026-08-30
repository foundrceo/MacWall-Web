import { NextResponse, type NextRequest } from "next/server"

import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/admin/session"
import {
  applyCountryCookie,
  MW_RESOLVED_COUNTRY_HEADER,
} from "@/lib/geo/country"
import { resolveVisitorCountry } from "@/lib/geo/resolve-visitor-country"

/**
 * Edge proxy — keep this matcher tiny. Every match burns Edge Middleware
 * invocations. Geo/pricing cookies only need to land on checkout + pricing
 * surfaces; admin auth is the other required path. Gallery/blog HTML no longer
 * runs Edge (saves the bulk of document hits).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Never block HTML / API on IP whois — Vercel edge geo + cookie only.
  const country = await resolveVisitorCountry({
    headers: request.headers,
    cookieCountry: request.cookies.get("mw_country")?.value,
    geoCountry: request.headers.get("x-vercel-ip-country"),
    skipIpLookup: true,
  })

  const requestHeaders = new Headers(request.headers)
  if (country) {
    requestHeaders.set(MW_RESOLVED_COUNTRY_HEADER, country)
  }

  const withGeoCookies = (response: NextResponse) => {
    applyCountryCookie(response, country)
    return response
  }

  const next = () =>
    withGeoCookies(NextResponse.next({ request: { headers: requestHeaders } }))

  if (pathname === "/checkout") {
    const redirect = request.nextUrl.clone()
    redirect.pathname = "/api/checkout/create-session"
    if (
      !redirect.searchParams.has("offer") &&
      !redirect.searchParams.has("plan")
    ) {
      redirect.searchParams.set("offer", "permanent")
    }
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
      pathname === "/" ||
      pathname === "/pricing" ||
      pathname === "/thank-you" ||
      pathname === "/download" ||
      pathname === "/tiktok"
    ) {
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

    // /api/pricing + /api/checkout — set country cookie, no TikTok rewrite.
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
    "/",
    "/checkout",
    "/pricing",
    "/thank-you",
    "/download",
    "/tiktok",
    "/admin",
    "/admin/:path*",
    "/api/admin",
    "/api/admin/:path*",
    "/api/pricing",
    "/api/checkout",
    "/api/checkout/:path*",
  ],
}
