"use client"

import NumberFlow from "@number-flow/react"
import type { ReactNode } from "react"

import { hasAmbiguousDollarSign, moneyFractionDigits } from "@/lib/pricing/money"
import { cn } from "@/lib/utils"

export function PricingPriceDisplay({
  price,
  priceMajor,
  currency = "usd",
  locale,
  className,
}: Readonly<{
  price: ReactNode
  priceMajor?: number
  currency?: string
  /** Pricing locale; where it writes this currency as a bare "$", show `price` as is. */
  locale?: string
  className?: string
}>) {
  // NumberFlow can't swap the sign, and `price` already says S$, CA$, A$ … there.
  const ambiguousSign = locale !== undefined && hasAmbiguousDollarSign(currency, locale)
  if (typeof priceMajor === "number" && Number.isFinite(priceMajor) && !ambiguousSign) {
    const code = currency.toUpperCase()
    const digits = moneyFractionDigits(priceMajor, currency)

    return (
      <NumberFlow
        className={cn(
          "tabular-nums tracking-[-0.02em]",
          className
        )}
        value={priceMajor}
        format={{
          style: "currency",
          currency: code,
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        }}
      />
    )
  }

  return (
    <span className={cn("tabular-nums tracking-[-0.02em]", className)}>
      {price}
    </span>
  )
}
