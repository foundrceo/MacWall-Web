import type { Metadata } from "next"
import Image from "next/image"
import { redirect } from "next/navigation"

import { CashfreeHandoff } from "@/app/checkout/india/cashfree-handoff"
import { CashfreeEmailForm } from "@/components/checkout/cashfree-email-form"
import { isCashfreeIndiaEnabled } from "@/lib/cashfree/server"
import { macwallAppIconPath, macwallAppIconRadiusClass } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
}

/**
 * India checkout for links that don't start on our pages (the app's Get
 * License button, emails). Without a session it asks for the buyer's email,
 * like the dialog on the site; with one it hands straight off to Cashfree.
 */
export default async function CashfreeIndiaCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    session?: string
    mode?: string
    offer?: string
    promo?: string
    until?: string
  }>
}) {
  const { session, mode, offer, promo, until } = await searchParams
  if (!isCashfreeIndiaEnabled()) redirect("/pricing")

  if (session) {
    if (!/^session_[\w-]+$/.test(session)) redirect("/pricing")
    return (
      <CashfreeHandoff
        session={session}
        mode={mode === "production" ? "production" : "sandbox"}
      />
    )
  }

  return (
    <main className="dark flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-[400px] rounded-3xl border border-white/10 bg-secondary px-5 pt-5 pb-5 shadow-2xl sm:px-6 sm:pb-6">
        <Image
          src={macwallAppIconPath}
          alt=""
          width={40}
          height={40}
          className={cn("size-10", macwallAppIconRadiusClass)}
        />
        <h1 className="mt-4 text-[19px] leading-snug font-semibold tracking-tight">
          Where should we send your license?
        </h1>
        <p className="mt-1.5 text-[13px] leading-snug text-marketing-muted">
          Your license key is emailed here and shown right after payment.
        </p>
        <CashfreeEmailForm
          step={{
            offer: offer || "permanent",
            promo: promo || null,
            until: until || null,
          }}
          className="mt-5"
        />
      </div>
    </main>
  )
}
