import { NextResponse } from "next/server"

import { macwall } from "@/lib/macwall-site"

/** Short link — `/discord` always redirects to the community invite. */
export function GET() {
  return NextResponse.redirect(macwall.discordInvite, 308)
}
