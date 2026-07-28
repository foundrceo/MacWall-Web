import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import {
  COUNTRY_COOKIE,
  resolveVisitorCountry,
} from "@/lib/geo/resolve-visitor-country"
import { AFFONSO_REFERRAL_COOKIE } from "@/lib/macwall-affiliate"
import { createMacWallCheckoutSession } from "@/lib/stripe/create-macwall-checkout-session"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

async function startCheckout(
  request: Request,
  offerSlug: string | null,
  planSlug: string | null
) {
  const cookieStore = await cookies()
  const affonsoReferral =
    cookieStore.get(AFFONSO_REFERRAL_COOKIE)?.value?.trim().slice(0, 255) || ""
  const country = await resolveVisitorCountry({
    headers: request.headers,
    cookieCountry: cookieStore.get(COUNTRY_COOKIE)?.value,
  })

  return createMacWallCheckoutSession({
    country,
    offerSlug,
    planSlug,
    affonsoReferral,
    siteOrigin: new URL(request.url).origin,
  })
}

/** Instant redirect to Stripe Checkout — use this URL in CTAs, not /checkout. */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const offerSlug = url.searchParams.get("offer")
  const planSlug = url.searchParams.get("plan")

  const result = await startCheckout(request, offerSlug, planSlug)

  if (!result.ok) {
    const pricing = new URL("/pricing", url.origin)
    pricing.searchParams.set("checkout_error", result.error.slice(0, 120))
    return NextResponse.redirect(pricing)
  }

  return NextResponse.redirect(result.url, 303)
}

export async function POST(request: Request) {
  let offerSlug: string | null = null
  let planSlug: string | null = null
  try {
    const body = (await request.json()) as {
      offer?: string
      plan?: string
    }
    offerSlug = body.offer?.trim() || null
    planSlug = body.plan?.trim() || null
  } catch {
    offerSlug = null
    planSlug = null
  }

  const result = await startCheckout(request, offerSlug, planSlug)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json({ url: result.url })
}
