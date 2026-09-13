"use client"

import { AppleIcon, LaptopIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"

import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import { InfiniteSlider } from "@/components/ui/infinite-slider"
import { macwallPricingCopy as p } from "@/lib/macwall-pricing-copy"
import { cn } from "@/lib/utils"

function macIconForContext(context: string): IconSvgElement {
  return context.startsWith("MacBook") ? LaptopIcon : AppleIcon
}

export function Reviews({ className }: Readonly<{ className?: string }>) {
  const { title, subtitle, items } = p.reviews

  return (
    <MarketingSection className={className} aria-labelledby="reviews-heading">
      <div className="flex flex-col gap-10 pt-10">
        <div className="flex flex-col gap-2 px-6">
          <h2
            id="reviews-heading"
            className="text-left text-3xl font-normal tracking-tighter whitespace-nowrap md:text-5xl"
          >
            {title}
          </h2>
          <p className="text-left text-lg leading-relaxed tracking-tight text-muted-foreground whitespace-nowrap">
            {subtitle}
          </p>
        </div>

        <div className="border-t border-dashed border-border bg-muted">
          <InfiniteSlider
            gap={0}
            speed={40}
            speedOnHover={12}
            className="py-0"
          >
            {items.map((item, index) => (
              <div
                key={`${item.name}-${item.context}`}
                className={cn(
                  "flex h-80 w-[22rem] shrink-0 flex-col sm:h-96 sm:w-96",
                  index % 2 === 1 && "flex-col-reverse"
                )}
              >
                <div className="flex min-h-0 flex-1 flex-col justify-center border-r border-b border-dashed border-border bg-background p-6">
                  <div className="flex items-center gap-3">
                    {item.avatarSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.avatarSrc}
                        alt=""
                        width={40}
                        height={40}
                        className="size-10 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex size-10 items-center justify-center rounded-full bg-muted text-sm">
                        {item.name.slice(0, 1)}
                      </span>
                    )}
                    <div>
                      <p className="tracking-tight">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.context}
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 text-[17px] leading-relaxed">
                    {item.quote}
                  </p>
                </div>
                <div className="flex min-h-0 flex-1 items-center justify-center border-r border-dashed border-border p-6">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <HugeiconsIcon
                      icon={macIconForContext(item.context)}
                      size={40}
                      strokeWidth={1.25}
                    />
                    <p className="text-sm tracking-tight">{item.context}</p>
                  </div>
                </div>
              </div>
            ))}
          </InfiniteSlider>
        </div>
      </div>
    </MarketingSection>
  )
}
