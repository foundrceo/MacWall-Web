import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { CashfreeHandoff } from "@/app/checkout/india/cashfree-handoff"
import { isCashfreeIndiaEnabled } from "@/lib/cashfree/server"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
}

/**
 * Blank hand-off to Cashfree for checkout links that don't start on our
 * pages (GET create-session from the app or emails). Buy buttons on the site
 * open Cashfree directly and never land here.
 */
export default async function CashfreeIndiaHandoffPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string; mode?: string }>
}) {
  const { session, mode } = await searchParams
  if (!isCashfreeIndiaEnabled() || !session || !/^session_[\w-]+$/.test(session)) {
    redirect("/pricing")
  }

  return (
    <CashfreeHandoff
      session={session}
      mode={mode === "production" ? "production" : "sandbox"}
    />
  )
}
