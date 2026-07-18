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
 * Resolves visitor country on the Edge (x-vercel-ip-country) and forwards it to
 * server components via x-mw-resolved-country — Node runtimes do not receive geo headers.
 */
export async function middleware(request: NextRequest) {
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

  const withCountryCookie = (response: NextResponse) =>
    applyCountryCookie(response, country)

  const next = () =>
    withCountryCookie(
      NextResponse.next({ request: { headers: requestHeaders } })
    )

  const isAdminSurface =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin")

  if (!isAdminSurface) {
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
    return withCountryCookie(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    )
  }

  const loginUrl = new URL("/admin/login", request.url)
  loginUrl.searchParams.set("next", pathname)
  return withCountryCookie(NextResponse.redirect(loginUrl))
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
