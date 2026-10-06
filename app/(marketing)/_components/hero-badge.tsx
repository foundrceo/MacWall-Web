import Link from "next/link"
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"

/**
 * The hero's "New" announcement: a light rotates around the border while a
 * shimmer glides across the words. Styles: `.mw-badge-shine` and
 * `.mw-badge-shimmer` in globals.css; both still for reduced motion.
 */
export function HeroBadge() {
  const ix = macwallMarketingCopy.interact

  return (
    <Link
      href={ix.chipHref}
      className="relative inline-flex h-8 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] ps-1 pe-3 text-[13px] whitespace-nowrap text-muted-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      <span className="rounded-full bg-white px-2 py-0.5 text-[11px] leading-4 font-semibold text-black">
        {ix.chipTag}
      </span>
      <span className="mw-badge-shimmer font-medium">{ix.chip}</span>
      <HugeiconsIcon
        icon={ArrowUpRight01Icon}
        size={14}
        strokeWidth={2}
        className="-ms-1 text-muted-foreground"
        aria-hidden
      />
      <span className="mw-badge-shine" aria-hidden />
    </Link>
  )
}
