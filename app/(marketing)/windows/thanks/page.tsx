import type { Metadata } from "next"
import Link from "next/link"

import { macwall } from "@/lib/macwall-site"
import { getStripe } from "@/lib/stripe/server"
import {
  WINDOWS_PREORDER_PRODUCT,
  windowsWaitlistPath,
} from "@/lib/windows/preorder.shared"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "You're on the list",
  robots: { index: false, follow: false },
}

async function paidPreorderEmail(
  sessionId: string | undefined
): Promise<{ paid: true; email: string | null } | { paid: false }> {
  if (!sessionId || !/^cs_[a-zA-Z0-9_]+$/.test(sessionId)) {
    return { paid: false }
  }
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId)
    if (
      session.metadata?.product !== WINDOWS_PREORDER_PRODUCT ||
      session.payment_status !== "paid"
    ) {
      return { paid: false }
    }
    return {
      paid: true,
      email: session.customer_details?.email ?? session.customer_email ?? null,
    }
  } catch (error) {
    console.error(
      "[windows/thanks]",
      error instanceof Error ? error.message : "session lookup failed"
    )
    return { paid: false }
  }
}

export default async function WindowsWaitlistThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams
  const result = await paidPreorderEmail(session_id)

  return (
    <main id="main-content" className="mx-auto max-w-lg px-6 py-24 text-center">
      {result.paid ? (
        <>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            You&apos;re on the list
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            Payment received. We sent a confirmation to{" "}
            {result.email ? (
              <span className="text-foreground">{result.email}</span>
            ) : (
              "your email"
            )}
            . Your {macwall.name} Pro key will arrive at the same address on the
            day the Windows app launches. It works on Mac and Windows. Nothing
            else to do for now.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            We couldn&apos;t confirm this payment
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            If you were charged, your confirmation email is on its way. Still
            nothing after a few minutes? Write to{" "}
            <a
              className="text-foreground underline underline-offset-4"
              href={`mailto:${macwall.supportEmail}`}
            >
              {macwall.supportEmail}
            </a>
            .
          </p>
        </>
      )}
      <Link
        href={result.paid ? "/" : windowsWaitlistPath}
        className="mt-8 inline-flex h-10 items-center justify-center rounded-full border border-border bg-muted/70 px-5 text-sm font-medium text-foreground hover:bg-muted"
      >
        {result.paid ? `Back to ${macwall.name}` : "Back to the waitlist"}
      </Link>
    </main>
  )
}
