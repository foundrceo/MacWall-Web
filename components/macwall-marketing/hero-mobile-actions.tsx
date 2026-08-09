"use client"

import { useState } from "react"

import { TrackedPricingButton } from "@/components/analytics/tracked-marketing-buttons"
import { trackSiteEventClient } from "@/lib/analytics/client"
import { useMarketingPricing } from "@/components/marketing/marketing-pricing-context"
import { macwall } from "@/lib/macwall-site"

const SHARE_TITLE = `${macwall.name}, live wallpapers for Mac`

export function HeroMobileActions() {
  const pricing = useMarketingPricing()
  const [linkState, setLinkState] = useState<"idle" | "copied">("idle")

  const sendLinkToMac = async () => {
    const url = `${window.location.origin}/download`
    trackSiteEventClient("cta_click", { location: "hero_mobile_send_link" })

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: SHARE_TITLE, url })
        return
      } catch {
        // Share sheet dismissed, so fall through to copying.
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setLinkState("copied")
      window.setTimeout(() => setLinkState("idle"), 2500)
    } catch {
      window.location.href = "/download"
    }
  }

  return (
    <div className="mt-8 sm:mt-10">
      <div className="flex flex-col items-stretch gap-2.5">
        <TrackedPricingButton
          href={pricing.checkoutUrl}
          size="pill"
          location="hero_mobile"
          ariaLabel={`Get ${macwall.name} Pro`}
          className="marketing-hero-primary-btn justify-center px-4 py-3 text-[15px]"
        >
          {pricing.getProCta}
        </TrackedPricingButton>

        <button
          type="button"
          onClick={() => void sendLinkToMac()}
          className="marketing-hero-secondary-btn justify-center px-4 py-3 text-[15px]"
        >
          {linkState === "copied" ? "Link copied" : "Send link to my Mac"}
        </button>
      </div>

      <p className="mt-3 text-[12px] leading-snug text-marketing-muted sm:text-[13px]">
        MacWall runs on a Mac, not a phone. Buy now and your license key is
        emailed straight away, so you can install it next time you sit down at
        your Mac.
      </p>
    </div>
  )
}
