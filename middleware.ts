import { NextResponse, type NextRequest } from "next/server"

import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/admin/session"
import { applyCountryCookie } from "@/lib/geo/country"
import { resolveVisitorCountry } from "@/lib/geo/resolve-visitor-country"

/**
 * Resolves visitor country (Vercel/CF geo, cookie, Accept-Language, IP, dev override)
 * and persists it in mw_country for analytics + client reads.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const country = await resolveVisitorCountry({
    headers: request.headers,
    cookieCountry: request.cookies.get("mw_country")?.value,
  })

  const withCountryCookie = (response: NextResponse) =>
    applyCountryCookie(response, country)

  const isAdminSurface =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin")

  if (!isAdminSurface) {
    return withCountryCookie(NextResponse.next())
  }

  const isLoginPage = pathname === "/admin/login"
  const isLoginApi = pathname === "/api/admin/login"
  if (isLoginPage || isLoginApi) {
    return withCountryCookie(NextResponse.next())
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (await verifyAdminSessionToken(token)) {
    return withCountryCookie(NextResponse.next())
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
