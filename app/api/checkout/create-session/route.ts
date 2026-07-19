import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import {
  COUNTRY_COOKIE,
  resolveVisitorCountry,
} from "@/lib/geo/resolve-visitor-country"
import { createMacWallCheckoutSession } from "@/lib/stripe/create-macwall-checkout-session"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function startCheckout(request: Request, requestedPromo: string | null) {
  const cookieStore = await cookies()
  const country = await resolveVisitorCountry({
    headers: request.headers,
    cookieCountry: cookieStore.get(COUNTRY_COOKIE)?.value,
  })

  return createMacWallCheckoutSession({
    country,
    requestedPromo,
    siteOrigin: new URL(request.url).origin,
  })
}

/** Instant redirect to Stripe Checkout — use this URL in CTAs, not /checkout. */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const requestedPromo = url.searchParams.get("promo")

  const result = await startCheckout(request, requestedPromo)

  if (!result.ok) {
    const pricing = new URL("/pricing", url.origin)
    pricing.searchParams.set("checkout_error", result.error.slice(0, 120))
    return NextResponse.redirect(pricing)
  }

  return NextResponse.redirect(result.url, 303)
}

export async function POST(request: Request) {
  let requestedPromo: string | null = null
  try {
    const body = (await request.json()) as { promoCode?: string }
    requestedPromo = body.promoCode?.trim() || null
  } catch {
    requestedPromo = null
  }

  const result = await startCheckout(request, requestedPromo)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json({ url: result.url })
}
