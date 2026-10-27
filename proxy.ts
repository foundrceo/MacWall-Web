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
import {
  negotiatedMarkdownPath,
  prefersMarkdown,
} from "@/lib/http/markdown-negotiation"

/**
 * Every matched request is a billed invocation, so the matcher stays small:
 * the country cookie on checkout, and admin auth. Marketing pages never get a
 * Set-Cookie from here. A page response that sets a cookie can't be cached
 * (vinext renders it on every visit), and `/api/pricing` sets the country
 * cookie from the client instead.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // `Accept: text/markdown` on a page URL serves its `.md` twin. Production
  // does this in worker/index.ts before vinext; this covers `next start`.
  if (prefersMarkdown(request.headers.get("accept"))) {
    const markdownPath = negotiatedMarkdownPath(pathname)
    if (!markdownPath) return NextResponse.next()
    const target = request.nextUrl.clone()
    // Straight to the handler behind the `/:path+.md` rewrite.
    target.pathname = `/md${markdownPath.replace(/\.md$/, "")}`
    const response = NextResponse.rewrite(target)
    response.headers.set("Vary", "Accept")
    return response
  }

  // Crawlers treat catalog keys (`"videoKey":"videos/<id>.mp4"`) in page
  // payloads and `/api/wallpapers` as relative links and request
  // `<page>/videos/<id>.mp4`. Return an empty, cacheable 404 instead of the full
  // not-found page.
  if (pathname.endsWith(".mp4")) {
    return new NextResponse(null, {
      status: 404,
      headers: { "Cache-Control": "public, max-age=86400" },
    })
  }

  const isAdminSurface =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin")

  // Header geo and the cookie only, never an IP lookup on the request path.
  const country = isAdminSurface
    ? null
    : await resolveVisitorCountry({
        headers: request.headers,
        cookieCountry: request.cookies.get("mw_country")?.value,
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
    // /api/checkout: set the country cookie before Stripe
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
    // Markdown negotiation, only for requests that ask for Markdown.
    {
      source: "/((?!api/|_next/|admin|md/).*)",
      has: [{ type: "header", key: "accept", value: ".*text/markdown.*" }],
    },
  ],
}
