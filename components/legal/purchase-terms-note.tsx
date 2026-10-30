import Link from "next/link"

import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

/**
 * Point-of-sale disclosure under Buy buttons: card networks expect the
 * refund policy and terms to be visible before payment, not only in the
 * footer. Prices are set in USD, but Stripe Adaptive Pricing may charge local
 * currency, and no tax is added at checkout today: keep this note to what is
 * true of the checkout session.
 */
export function PurchaseTermsNote({
  className,
}: Readonly<{ className?: string }>) {
  return (
    <p
      className={cn(
        "text-center text-[12px] leading-5 text-muted-foreground",
        className
      )}
    >
      One-time payment, no subscription. Prices are set in USD; checkout may
      show and charge your local currency, and the total is shown before you
      pay. {macwall.refundWindowDays}-day money-back guarantee. By purchasing
      you agree to our{" "}
      <Link href="/legal/terms" className="underline underline-offset-2">
        Terms
      </Link>{" "}
      and{" "}
      <Link href="/legal/refund" className="underline underline-offset-2">
        Refund Policy
      </Link>
      .
    </p>
  )
}
