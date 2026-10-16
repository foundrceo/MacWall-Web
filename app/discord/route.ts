import { NextResponse } from "next/server"

import { macwall } from "@/lib/macwall-site"

/** Prerendered at build, so the short link is a CDN hit, not a Function run. */
export const dynamic = "force-static"

/** Short link — `/discord` always redirects to the community invite. */
export function GET() {
  return NextResponse.redirect(macwall.discordInvite, 308)
}
