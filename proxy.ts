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
 * Next.js Node proxy — every matched request is a billed invocation, so keep
 * this matcher tiny: the country cookie on checkout and admin auth. TikTok ad
 * clicks land on the full homepage like everyone else. Marketing pages never get a Set-Cookie here: a page response
 * that sets a cookie can't be cached (vinext on Cloudflare renders it on every
 * visit), and the country cookie is set by `/api/pricing` from the client.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Crawlers read catalog keys (`"videoKey":"videos/<id>.mp4"`) in page
  // payloads and `/api/wallpapers` as relative links, then request
  // `<page>/videos/<id>.mp4` thousands of times a day. Each got the full HTML
  // not-found page (~115 KB, usually uncompressed). Answer with an empty 404
  // the browser and bots may cache instead.
  if (pathname.endsWith(".mp4")) {
    return new NextResponse(null, {
      status: 404,
      headers: { "Cache-Control": "public, max-age=86400" },
    })
  }

  const isAdminSurface =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin")

  // Never block HTML / API on IP whois — Vercel edge geo + cookie only.
  const country = isAdminSurface ? null : await resolveVisitorCountry({
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
    if (country !== request.cookies.get("mw_country")?.value) {
      applyCountryCookie(response, country)
    }
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

  if (!isAdminSurface) {
    // /api/checkout — set the country cookie before Stripe.
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
    "/checkout",
    "/admin",
    "/admin/:path*",
    "/api/admin",
    "/api/admin/:path*",
    // `/api/pricing` resolves geo and sets the cookie itself, so its CDN-cached
    // `?c=` responses never wake the proxy.
    "/api/checkout",
    "/api/checkout/:path*",
    // Crawler-resolved relative catalog keys (see the `.mp4` early return).
    "/videos/:path*",
    "/:prefix+/videos/:path*",
  ],
}
