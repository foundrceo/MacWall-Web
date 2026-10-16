import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import {
  COUNTRY_COOKIE,
  resolveVisitorCountry,
} from "@/lib/geo/resolve-visitor-country"
import { isAutomationUserAgent } from "@/lib/http/bot-user-agent"
import {
  clientIpFromRequest,
  createInMemoryRateLimiter,
} from "@/lib/http/rate-limit"
import { normalizeCheckoutEmail } from "@/lib/stripe/checkout-email"
import { resolveCheckoutSiteOrigin } from "@/lib/stripe/checkout-origin"
import { createWindowsPreorderSession } from "@/lib/stripe/create-windows-preorder-session"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const checkRateLimit = createInMemoryRateLimiter({ max: 10, windowMs: 60_000 })

/** Starts a Windows early-access preorder: { email } → { url } (Stripe). */
export async function POST(request: Request) {
  if (isAutomationUserAgent(request.headers.get("user-agent"))) {
    return NextResponse.json({ error: "unavailable" }, { status: 403 })
  }
  if (checkRateLimit(clientIpFromRequest(request)).limited) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment." },
      { status: 429 }
    )
  }

  let rawEmail: string | null = null
  try {
    const body = (await request.json()) as { email?: unknown }
    rawEmail = typeof body.email === "string" ? body.email : null
  } catch {
    rawEmail = null
  }
  const email = normalizeCheckoutEmail(rawEmail)
  if (!email) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    )
  }

  const cookieStore = await cookies()
  const country = await resolveVisitorCountry({
    headers: request.headers,
    cookieCountry: cookieStore.get(COUNTRY_COOKIE)?.value,
  })

  const result = await createWindowsPreorderSession({
    country,
    email,
    siteOrigin: resolveCheckoutSiteOrigin(request.url),
  })
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }
  return NextResponse.json({ url: result.url })
}
