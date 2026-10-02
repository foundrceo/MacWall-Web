import Link from "next/link"

import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

/**
 * Point-of-sale disclosure under Buy buttons: card networks expect the
 * refund policy and terms to be visible before payment, not only in the
 * footer.
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
      One-time payment, no subscription. {macwall.refundWindowDays}-day
      money-back guarantee. Taxes, if any, are calculated at checkout. By
      purchasing you agree to our{" "}
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
