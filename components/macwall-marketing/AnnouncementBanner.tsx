import Link from "next/link"
import { macwall } from "@/lib/macwall-site"
import { LAUNCH_BANNER_CLASS } from "@/lib/marketing-chrome"

/** Fixed launch-pricing strip above the navbar on mobile; static in document flow from md up. */
export default function AnnouncementBanner() {
  return (
    <div id="launch-banner" className={LAUNCH_BANNER_CLASS}>
      <Link
        href="/pricing"
        className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-0.5 px-4 py-2.5 text-center transition-opacity hover:opacity-80 sm:h-9 sm:flex-row sm:gap-0 sm:py-0"
      >
        <span className="text-[12px] font-medium text-black sm:text-[14px]">
          Limited-time launch pricing
        </span>
        <span className="text-[12px] leading-snug text-black/65 sm:ml-1.5 sm:text-[14px]">
          Pro {macwall.pro.price}
          {macwall.pro.suffix ? ` ${macwall.pro.suffix}` : ""}{" "}
          <span className="line-through decoration-black/35">
            {macwall.pro.strikePrice}
          </span>
          {" · "}
          Lifetime updates on {macwall.maxLicensedMacs} Macs
        </span>
      </Link>
    </div>
  )
}
