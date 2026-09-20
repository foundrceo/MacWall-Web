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
import {
  CHECKOUT_LEAD_EMAIL_COOKIE,
  CHECKOUT_VISITOR_ID_COOKIE,
  normalizeCheckoutEmail,
  normalizeCheckoutVisitorId,
} from "@/lib/stripe/checkout-email"
import { resolveCheckoutSiteOrigin } from "@/lib/stripe/checkout-origin"
import { createMacWallCheckoutSession } from "@/lib/stripe/create-macwall-checkout-session"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Cheap per-instance brake against Stripe session / pending-license spam. */
const checkCheckoutRateLimit = createInMemoryRateLimiter({
  max: 30,
  windowMs: 60_000,
})

const LEAD_COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30

type CheckoutLeadInput = {
  email: string | null
  visitorId: string | null
}

function readLeadFromSearchParams(url: URL): CheckoutLeadInput {
  return {
    email: url.searchParams.get("email"),
    visitorId:
      url.searchParams.get("visitor_id") || url.searchParams.get("visitorId"),
  }
}

function attachLeadCookies(
  response: NextResponse,
  email: string | null | undefined,
  visitorId: string | null | undefined
) {
  const secure = process.env.NODE_ENV === "production"
  const normalizedEmail = normalizeCheckoutEmail(email)
  if (normalizedEmail) {
    response.cookies.set(CHECKOUT_LEAD_EMAIL_COOKIE, normalizedEmail, {
      path: "/",
      maxAge: LEAD_COOKIE_MAX_AGE_SEC,
      sameSite: "lax",
      secure,
      httpOnly: false,
    })
  }
  const normalizedVisitor = normalizeCheckoutVisitorId(visitorId)
  if (normalizedVisitor) {
    response.cookies.set(CHECKOUT_VISITOR_ID_COOKIE, normalizedVisitor, {
      path: "/",
      maxAge: LEAD_COOKIE_MAX_AGE_SEC,
      sameSite: "lax",
      secure,
      httpOnly: false,
    })
  }
}

async function startCheckout(
  request: Request,
  offerSlug: string | null,
  planSlug: string | null,
  promoCode: string | null,
  offerUntil: string | null,
  lead: CheckoutLeadInput
) {
  const rate = checkCheckoutRateLimit(clientIpFromRequest(request))
  if (rate.limited) {
    return {
      ok: false as const,
      error: "Too many checkout attempts. Please wait a moment.",
      status: 429,
    }
  }

  const cookieStore = await cookies()
  const affonsoReferral =
    cookieStore.get(AFFONSO_REFERRAL_COOKIE)?.value?.trim().slice(0, 255) || ""
  // Fast path: Vercel/edge headers + cookie only — never wait on IP whois.
  const country = await resolveVisitorCountry({
    headers: request.headers,
    cookieCountry: cookieStore.get(COUNTRY_COOKIE)?.value,
    skipIpLookup: true,
  })

  const email =
    lead.email ||
    cookieStore.get(CHECKOUT_LEAD_EMAIL_COOKIE)?.value ||
    null
  const visitorId =
    lead.visitorId ||
    cookieStore.get(CHECKOUT_VISITOR_ID_COOKIE)?.value ||
    null

  return createMacWallCheckoutSession({
    country,
    offerSlug,
    planSlug,
    promoCode,
    offerUntil,
    affonsoReferral,
    siteOrigin: resolveCheckoutSiteOrigin(request.url),
    customerEmail: email,
    visitorId,
  })
}

/** Instant redirect to Stripe Checkout — paid one-time licenses only. */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const offerSlug = url.searchParams.get("offer")
  const planSlug = url.searchParams.get("plan")
  const promoCode = url.searchParams.get("promo")
  const offerUntil = url.searchParams.get("until")
  const lead = readLeadFromSearchParams(url)

  const result = await startCheckout(
    request,
    offerSlug,
    planSlug,
    promoCode,
    offerUntil,
    lead
  )

  if (!result.ok) {
    const origin = resolveCheckoutSiteOrigin(request.url)
    const pricing = new URL("/pricing", origin)
    pricing.searchParams.set("checkout_error", result.error.slice(0, 120))
    return NextResponse.redirect(pricing)
  }

  const response = NextResponse.redirect(result.url, 303)
  attachLeadCookies(response, result.customerEmail ?? lead.email, lead.visitorId)
  return response
}

export async function POST(request: Request) {
  let offerSlug: string | null = null
  let planSlug: string | null = null
  let promoCode: string | null = null
  let offerUntil: string | null = null
  let email: string | null = null
  let visitorId: string | null = null
  try {
    const body = (await request.json()) as {
      offer?: string
      plan?: string
      promo?: string
      until?: string
      email?: string
      visitor_id?: string
      visitorId?: string
    }
    offerSlug = body.offer?.trim() || null
    planSlug = body.plan?.trim() || null
    promoCode = body.promo?.trim() || null
    offerUntil = body.until?.trim() || null
    email = body.email?.trim() || null
    visitorId = body.visitor_id?.trim() || body.visitorId?.trim() || null
  } catch {
    offerSlug = null
    planSlug = null
    promoCode = null
    offerUntil = null
    email = null
    visitorId = null
  }

  // GET-style query params still work on POST (email CTAs, app deep links).
  const url = new URL(request.url)
  const fromQuery = readLeadFromSearchParams(url)
  if (!email) email = fromQuery.email
  if (!visitorId) visitorId = fromQuery.visitorId
  if (!offerSlug) offerSlug = url.searchParams.get("offer")
  if (!planSlug) planSlug = url.searchParams.get("plan")
  if (!promoCode) promoCode = url.searchParams.get("promo")
  if (!offerUntil) offerUntil = url.searchParams.get("until")

  const result = await startCheckout(
    request,
    offerSlug,
    planSlug,
    promoCode,
    offerUntil,
    { email, visitorId }
  )

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  const response = NextResponse.json({ url: result.url })
  attachLeadCookies(response, result.customerEmail ?? email, visitorId)
  return response
}
