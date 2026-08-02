import { NextResponse } from "next/server"

import { SUPPORT_CHAT_QUERY } from "@/lib/support/shared"

/**
 * `/support` is not a page — redirect home and open the chat popup via query.
 */
export function GET(request: Request) {
  const url = new URL(request.url)
  const dest = new URL("/", url.origin)
  dest.searchParams.set(SUPPORT_CHAT_QUERY, "1")
  return NextResponse.redirect(dest, 308)
}
