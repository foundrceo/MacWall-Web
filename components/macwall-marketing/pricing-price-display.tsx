"use client"

import NumberFlow from "@number-flow/react"
import type { ReactNode } from "react"

import { moneyFractionDigits } from "@/lib/pricing/money"
import { cn } from "@/lib/utils"

export function PricingPriceDisplay({
  price,
  priceMajor,
  currency = "usd",
  className,
}: Readonly<{
  price: ReactNode
  priceMajor?: number
  currency?: string
  className?: string
}>) {
  if (typeof priceMajor === "number" && Number.isFinite(priceMajor)) {
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
