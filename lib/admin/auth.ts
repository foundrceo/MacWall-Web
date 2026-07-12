import { timingSafeEqual } from "crypto"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/admin/session"

function adminPassword(): string {
  const password = process.env.ADMIN_PASSWORD?.trim()
  if (!password || password.length < 12) {
    throw new Error(
      "ADMIN_PASSWORD must be set (min 12 characters) for admin login."
    )
  }
  return password
}

export function verifyAdminPassword(candidate: string): boolean {
  const expected = adminPassword()
  const a = Buffer.from(candidate)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies()
  const token = jar.get(ADMIN_SESSION_COOKIE)?.value
  try {
    return await verifyAdminSessionToken(token)
  } catch {
    return false
  }
}

export function unauthorizedAdminResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export async function requireAdminApi(): Promise<NextResponse | null> {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedAdminResponse()
  }
  return null
}
