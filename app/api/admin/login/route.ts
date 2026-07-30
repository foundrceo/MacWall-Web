import { NextResponse } from "next/server"

import {
  createAdminSessionToken,
  adminSessionCookieOptions,
  ADMIN_SESSION_COOKIE,
} from "@/lib/admin/session"
import { verifyAdminPassword } from "@/lib/admin/auth"
import {
  clientIpFromRequest,
  createInMemoryRateLimiter,
} from "@/lib/http/rate-limit"

export const runtime = "nodejs"

/** Throttle password guessing per IP (10 attempts / 5 min). */
const checkRateLimit = createInMemoryRateLimiter({
  max: 10,
  windowMs: 5 * 60_000,
})

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(clientIpFromRequest(request))
    if (rateLimit.limited) {
      return NextResponse.json(
        { error: "Too many attempts" },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        }
      )
    }

    const body = (await request.json()) as { password?: string }
    const password = body.password?.trim() ?? ""

    if (!password || !verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set(
      ADMIN_SESSION_COOKIE,
      await createAdminSessionToken(),
      adminSessionCookieOptions()
    )
    return response
  } catch {
    return NextResponse.json(
      { error: "Admin login unavailable" },
      { status: 503 }
    )
  }
}
