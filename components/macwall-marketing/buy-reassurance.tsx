import { Mail01Icon, Shield01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

/**
 * Two lines under every Get Pro button: the money-back guarantee (it used to
 * live only in the fine print) and what happens after paying, which matters
 * most to people buying from a phone they can't install on.
 */
export function BuyReassurance({ className }: Readonly<{ className?: string }>) {
  return (
    <ul className={cn("space-y-1.5 text-[12px] leading-4 text-white/70", className)}>
      <li className="flex items-center gap-2">
        <HugeiconsIcon icon={Shield01Icon} size={14} strokeWidth={1.75} className="shrink-0 text-white/55" aria-hidden />
        {macwall.refundWindowDays}-day money-back guarantee, no reason needed
      </li>
      <li className="flex items-center gap-2">
        <HugeiconsIcon icon={Mail01Icon} size={14} strokeWidth={1.75} className="shrink-0 text-white/55" aria-hidden />
        Key by email. Install on your Mac anytime.
      </li>
    </ul>
  )
}
