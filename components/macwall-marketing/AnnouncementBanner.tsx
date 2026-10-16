import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

/**
 * Full-bleed notice strip above the navbar. Off by default
 * (`FLAGS.announcementBanner`); edit the copy before turning it back on.
 */
export default function AnnouncementBanner() {
  return (
    <div
      id="launch-banner"
      className="fixed inset-x-0 top-0 z-[51] h-[var(--marketing-banner-height)] bg-[#67EDEC] lg:static lg:z-auto"
    >
      <Link
        href="/contact"
        className="flex h-full w-full items-center justify-center gap-1.5 px-4 text-black outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#67EDEC] sm:px-6"
      >
        <span className="line-clamp-2 min-w-0 text-center text-[12px] leading-4 font-medium tracking-normal sm:line-clamp-1 sm:text-[13px] sm:leading-5">
          Checkout is back on Stripe. Your license and support work exactly
          the same.
        </span>
        <ArrowUpRight
          className="size-3.5 shrink-0 sm:size-4"
          strokeWidth={2}
          aria-hidden
        />
      </Link>
    </div>
  )
}
