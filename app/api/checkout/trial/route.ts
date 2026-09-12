import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import {
  COUNTRY_COOKIE,
  resolveVisitorCountry,
} from "@/lib/geo/resolve-visitor-country"
import {
  clientIpFromRequest,
  createInMemoryRateLimiter,
} from "@/lib/http/rate-limit"
import { AFFONSO_REFERRAL_COOKIE } from "@/lib/macwall-affiliate"
import { resolveCheckoutSiteOrigin } from "@/lib/stripe/checkout-origin"
import { createMacWallCheckoutSession } from "@/lib/stripe/create-macwall-checkout-session"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const checkCheckoutRateLimit = createInMemoryRateLimiter({
  max: 30,
  windowMs: 60_000,
})

/**
 * 24-hour free trial only. Card now, charge list price later.
 * Never falls through to Buy / permanent Checkout.
 */
export async function GET(request: Request) {
  const rate = checkCheckoutRateLimit(clientIpFromRequest(request))
  if (rate.limited) {
    const origin = resolveCheckoutSiteOrigin(request.url)
    const pricing = new URL("/pricing", origin)
    pricing.searchParams.set("checkout_error", "Too many checkout attempts.")
    return NextResponse.redirect(pricing)
  }

  const cookieStore = await cookies()
  const affonsoReferral =
    cookieStore.get(AFFONSO_REFERRAL_COOKIE)?.value?.trim().slice(0, 255) || ""
  const country = await resolveVisitorCountry({
    headers: request.headers,
    cookieCountry: cookieStore.get(COUNTRY_COOKIE)?.value,
    skipIpLookup: true,
  })

  const result = await createMacWallCheckoutSession({
    country,
    offerSlug: "trial",
    affonsoReferral,
    siteOrigin: resolveCheckoutSiteOrigin(request.url),
  })

  if (!result.ok) {
    const origin = resolveCheckoutSiteOrigin(request.url)
    const pricing = new URL("/pricing", origin)
    pricing.searchParams.set("checkout_error", result.error.slice(0, 120))
    return NextResponse.redirect(pricing)
  }

  return NextResponse.redirect(result.url, 303)
}
