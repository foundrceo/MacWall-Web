import { PlusIcon } from "lucide-react"
import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

function Cross() {
  return (
    <div className="relative size-6" aria-hidden>
      <div className="absolute left-3 h-6 w-px bg-background" />
      <div className="absolute top-3 h-px w-6 bg-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <PlusIcon className="size-5 text-border/70" strokeWidth={1.25} />
      </div>
    </div>
  )
}

type MarketingSectionProps = HTMLAttributes<HTMLElement> & {
  sectionClassName?: string
  innerClassName?: string
  showCrosses?: boolean
}

/** SaasCN section: container column, dashed side rules, plus-cross corners. */
export function MarketingSection({
  children,
  className,
  sectionClassName,
  innerClassName,
  showCrosses = true,
  ...props
}: MarketingSectionProps) {
  return (
    <section className={sectionClassName} {...props}>
      <div className="container relative mx-auto">
        <div
          className={cn(
            "border-border border-dashed sm:border-x",
            className,
            innerClassName
          )}
        >
          {children}
        </div>
        {showCrosses ? (
          <>
            <div className="pointer-events-none absolute -bottom-3 -left-3 z-10 hidden size-6 sm:block">
              <Cross />
            </div>
            <div className="pointer-events-none absolute -right-3 -bottom-3 z-10 hidden size-6 -translate-x-px sm:block">
              <Cross />
            </div>
          </>
        ) : null}
      </div>
    </section>
  )
}
