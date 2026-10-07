"use client"

import { preloadProModal } from "@/components/macwall-marketing/pro-modal-lazy"
import { SendToMacButton } from "@/components/macwall-marketing/send-to-mac-dialog"
import { trackSiteEventClient } from "@/lib/analytics/client"
import { HeroPriceCaption } from "@/components/macwall-marketing/hero-price-caption"

/** Full-width and 48px on phones: easy thumb targets when stacked. */
const heroFilledCapsule =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-[15px] font-medium text-black no-underline shadow-none transition-colors hover:bg-white/90"

const heroSecondaryCapsule =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white/10 px-5 text-[15px] font-medium text-foreground no-underline transition-colors hover:bg-white/15"

export function HeroMobileActions({
  onGetLicense,
}: Readonly<{
  onGetLicense: () => void
}>) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center">
      <SendToMacButton location="hero_mobile" className={heroFilledCapsule} />
      <button
        type="button"
        onClick={() => {
          trackSiteEventClient("pricing_click", { location: "hero_mobile" })
          onGetLicense()
        }}
        className={`${heroSecondaryCapsule} mt-2`}
        aria-haspopup="dialog"
        onPointerEnter={preloadProModal}
        onFocus={preloadProModal}
      >
        Get License
      </button>
      <HeroPriceCaption />
    </div>
  )
}
