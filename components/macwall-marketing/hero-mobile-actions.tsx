"use client"

import { preloadProModal } from "@/components/macwall-marketing/pro-modal-lazy"
import { SendToMacForm } from "@/components/macwall-marketing/send-to-mac-form"
import { trackSiteEventClient } from "@/lib/analytics/client"
import { HeroPriceCaption } from "@/components/macwall-marketing/hero-price-caption"

/** Full-width and 48px on phones: easy thumb targets when stacked. */
const heroSecondaryCapsule =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white/10 px-5 text-[15px] font-medium text-foreground no-underline transition-colors hover:bg-white/15"

export function HeroMobileActions({
  onGetLicense,
}: Readonly<{
  onGetLicense: () => void
}>) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center">
      <SendToMacForm location="hero_mobile" />
      <button
        type="button"
        onClick={() => {
          trackSiteEventClient("pricing_click", { location: "hero_mobile" })
          onGetLicense()
        }}
        className={`${heroSecondaryCapsule} mt-3`}
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
