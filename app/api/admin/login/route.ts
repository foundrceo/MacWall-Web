import { NextResponse } from "next/server"

import {
  createAdminSessionToken,
  adminSessionCookieOptions,
  ADMIN_SESSION_COOKIE,
} from "@/lib/admin/session"
import { verifyAdminPassword } from "@/lib/admin/auth"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
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
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Admin login unavailable"
    return NextResponse.json({ error: message }, { status: 503 })
  }
}
