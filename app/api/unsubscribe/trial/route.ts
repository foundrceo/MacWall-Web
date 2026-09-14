import { NextResponse } from "next/server"

import { unsubscribeTrialEmailByToken } from "@/lib/email/trial-unsubscribe"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function pageRedirect(request: Request): NextResponse {
  const url = new URL(request.url)
  const dest = new URL("/unsubscribe/trial", url.origin)
  const token = url.searchParams.get("t")
  if (token) dest.searchParams.set("t", token)
  return NextResponse.redirect(dest, 302)
}

/** Older mail clients open List-Unsubscribe as GET. */
export async function GET(request: Request) {
  return pageRedirect(request)
}

/** RFC 8058 one-click unsubscribe from trial-ended mail. */
export async function POST(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get("t")
  const result = await unsubscribeTrialEmailByToken(token)
  if (!result.ok) {
    const status = result.error === "update_failed" ? 500 : 400
    return NextResponse.json({ ok: false, error: result.error }, { status })
  }
  return new NextResponse(null, { status: 200 })
}
