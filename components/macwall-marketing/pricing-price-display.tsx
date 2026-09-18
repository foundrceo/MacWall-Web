"use client"

import NumberFlow from "@number-flow/react"
import type { ReactNode } from "react"

import { usePricingReady } from "@/components/marketing/marketing-pricing-context"
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
  const ready = usePricingReady()

  // Blank reserved space until the real regional price lands —
  // never flash default USD, never show a loader.
  if (!ready) {
    return (
      <span
        aria-hidden
        className={cn("tabular-nums tracking-[-0.02em]", className)}
      >
        {"\u00a0"}
      </span>
    )
  }

  if (typeof priceMajor === "number" && Number.isFinite(priceMajor)) {
    const code = currency.toUpperCase()
    const zeroDecimal = isZeroDecimalCurrency(currency)

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
          minimumFractionDigits: zeroDecimal || priceMajor === 0 ? 0 : 2,
          maximumFractionDigits: zeroDecimal || priceMajor === 0 ? 0 : 2,
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
