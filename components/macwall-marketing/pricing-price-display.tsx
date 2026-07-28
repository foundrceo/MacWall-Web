"use client"

import NumberFlow from "@number-flow/react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

function parseUsdPrice(price: string): number | null {
  const trimmed = price.trim()
  if (!/^\$[\d,.]+$/.test(trimmed)) return null

  const numeric = Number(trimmed.replace(/[^0-9.]/g, ""))
  return Number.isFinite(numeric) ? numeric : null
}

export function PricingPriceDisplay({
  price,
  className,
}: Readonly<{
  price: ReactNode
  className?: string
}>) {
  if (typeof price !== "string") {
    return <span className={className}>{price}</span>
  }

  const value = parseUsdPrice(price)
  if (value === null) {
    return <span className={className}>{price}</span>
  }

  return (
    <NumberFlow
      className={cn("tabular-nums", className)}
      value={value}
      prefix="$"
      format={{
        minimumFractionDigits: value === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      }}
    />
  )
}
