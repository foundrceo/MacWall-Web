import { NextResponse } from "next/server"

import { ADMIN_SESSION_COOKIE } from "@/lib/admin/session"
import { requireAdminApi } from "@/lib/admin/auth"

export async function POST() {
  const denied = await requireAdminApi()
  if (denied) return denied

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  })
  return response
}
