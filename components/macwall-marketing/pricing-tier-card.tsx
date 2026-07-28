import type { ReactNode } from "react"

import { PricingPriceDisplay } from "@/components/macwall-marketing/pricing-price-display"
import { cn } from "@/lib/utils"

export function PricingTierCard({
  id,
  title,
  subtitle,
  price,
  priceSuffix,
  features,
  featuresPrefix = "Includes:",
  action,
  actionSlot,
  showActionSlot = false,
  highlight = false,
  badge,
  className,
}: Readonly<{
  id: string
  title: string
  subtitle: string
  price: ReactNode
  priceSuffix?: ReactNode
  features: readonly string[]
  featuresPrefix?: string
  action: ReactNode
  actionSlot?: ReactNode
  showActionSlot?: boolean
  highlight?: boolean
  badge?: string
  className?: string
}>) {
  const badgeLabel = badge ?? (highlight ? "Popular" : undefined)

  return (
    <div className={cn("relative h-full pt-2.5", className)}>
      {badgeLabel ? (
        <span className="absolute top-0 right-4 z-10 rounded-full bg-foreground px-2.5 py-1 text-[11px] font-medium tracking-wide text-background">
          {badgeLabel}
        </span>
      ) : null}

      <article
        aria-labelledby={id}
        className="flex h-full flex-col rounded-[24px] bg-secondary px-5 py-6 sm:px-6 sm:py-7"
        data-highlight={highlight || undefined}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <h3
            id={id}
            className="font-sans text-[19px] font-normal tracking-tight text-foreground"
          >
            {title}
          </h3>

          <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
            {subtitle}
          </p>

          <p className="mt-3.5 flex flex-wrap items-baseline gap-x-1">
            <PricingPriceDisplay
              price={price}
              className="text-[1.75rem] font-normal tracking-tight text-foreground"
            />
            {priceSuffix ? (
              <span className="text-[12px] text-muted-foreground">
                {priceSuffix}
              </span>
            ) : null}
          </p>

          <div
            className={cn(
              "mt-3 min-h-7 items-center",
              showActionSlot ? "flex" : "hidden md:flex"
            )}
          >
            {actionSlot ?? null}
          </div>

          <p className="mt-4 text-[11px] font-medium tracking-wide text-muted-foreground">
            {featuresPrefix}
          </p>

          <ul role="list" className="mt-2 space-y-1.5">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex gap-x-2 text-[13px] leading-snug text-foreground"
              >
                <span
                  className="mt-px shrink-0 text-[12px] text-muted-foreground"
                  aria-hidden
                >
                  ✓
                </span>
                <span className="line-clamp-2 min-w-0">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex items-center justify-start">{action}</div>
      </article>
    </div>
  )
}
