"use client"

import NumberFlow from "@number-flow/react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

function isZeroDecimalCurrency(currency: string): boolean {
  return [
    "bif",
    "clp",
    "djf",
    "gnf",
    "jpy",
    "kmf",
    "krw",
    "mga",
    "pyg",
    "rwf",
    "ugx",
    "vnd",
    "vuv",
    "xaf",
    "xof",
    "xpf",
  ].includes(currency.toLowerCase())
}

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
    const zeroDecimal = isZeroDecimalCurrency(currency)

    return (
      <NumberFlow
        className={cn("tabular-nums", className)}
        value={priceMajor}
        format={{
          style: "currency",
          currency: code,
          minimumFractionDigits: zeroDecimal || priceMajor === 0 ? 0 : 2,
          maximumFractionDigits: zeroDecimal || priceMajor === 0 ? 0 : 2,
        }}
      />
    )
  }

  return <span className={className}>{price}</span>
}
