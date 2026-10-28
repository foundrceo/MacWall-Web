import { PlusIcon } from "lucide-react"
import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

/** Plus mark from the old dashed grid; sections no longer draw it. */
export function MarketingCross() {
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

/** PostMesh's section frame and stage. */
export const LANDING_FRAME =
  "relative mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8"
export const LANDING_STAGE = "mx-auto w-full max-w-[1200px]"

/** PostMesh's footer frame: wider than the section frame (1440px, 80px gutters on desktop). */
export const FOOTER_FRAME =
  "mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-20"

/**
 * Space under a landing section. With the next section's 80/110px top it makes
 * one gap down the page: 160px on phones, 206px on desktop, the same as FAQ to
 * CTA and CTA to footer.
 */
export const LANDING_SECTION_END = "pb-20 lg:pb-24"

/** PostMesh's card: Apple-style corners on the first surface. */
export const LANDING_CARD = "squircle min-w-0 rounded-[28px] bg-surface-1"

type MarketingSectionProps = HTMLAttributes<HTMLElement> & {
  sectionClassName?: string
  innerClassName?: string
  /** Accepted for old callers; corner marks are no longer drawn. */
  showCrosses?: boolean
}

function withoutCrosses<T extends { showCrosses?: boolean }>(props: T) {
  const { showCrosses: _ignored, ...rest } = props
  void _ignored
  return rest
}

/**
 * A page section in PostMesh's frame: 1280px wide with 16/24/32px gutters,
 * content on a centred 1200px stage, so every edge lines up down the page.
 */
export function MarketingSection({
  children,
  className,
  sectionClassName,
  innerClassName,
  ...props
}: MarketingSectionProps) {
  return (
    <section
      className={cn("w-full min-w-0", sectionClassName)}
      {...withoutCrosses(props)}
    >
      <div className={LANDING_FRAME}>
        <div className={cn(LANDING_STAGE, className, innerClassName)}>
          {children}
        </div>
      </div>
    </section>
  )
}
