import Link from "next/link"

function Dot() {
  return (
    <span className="hidden shrink-0 text-black/35 sm:inline" aria-hidden>
      ·
    </span>
  )
}

/** Top strip — Bend Desktop (MacBook lid fold). */
export default function AnnouncementBanner() {
  return (
    <div id="launch-banner" className="launch-banner">
      <Link
        href="/#bend"
        className="mx-auto flex h-full w-full max-w-7xl flex-col items-center justify-center gap-1.5 px-4 text-center transition-opacity outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:flex-row sm:gap-x-3 sm:gap-y-0 sm:px-5"
      >
        <span className="inline-flex min-w-0 max-w-full items-center justify-center gap-2 text-[11px] leading-4 font-medium tracking-normal text-black sm:truncate sm:text-[13px] sm:leading-5">
          <span aria-hidden className="shrink-0 text-[12px] leading-none sm:text-[13px]">
            💻
          </span>
          <span className="min-w-0 text-balance sm:truncate">
            Introducing Bend. Close your MacBook lid and the desktop folds with
            it.
          </span>
        </span>

        <Dot />

        <span className="inline-flex shrink-0 items-center gap-2 text-[11px] leading-4 font-medium tracking-normal whitespace-nowrap text-black sm:text-[13px] sm:leading-5">
          <span className="underline underline-offset-[3px] decoration-black/25">
            See how it works
          </span>
          <span aria-hidden className="translate-y-px text-[12px] leading-none">
            →
          </span>
        </span>
      </Link>
    </div>
  )
}
