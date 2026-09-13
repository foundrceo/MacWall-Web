"use client"

import { trackSiteEventClient } from "@/lib/analytics/client"
import { macwallMinimumMacOSVersionLabel } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

function AppleIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      className={cn("size-3.5 shrink-0", className)}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

const heroOutlineCapsule =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border-0 bg-muted/70 px-5 text-sm font-medium text-foreground no-underline shadow-none transition-colors hover:bg-muted"

const heroFilledCapsule =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-black no-underline shadow-none transition-opacity hover:opacity-90"

export function HeroMobileActions({
  onGetLicense,
}: Readonly<{
  onGetLicense: () => void
}>) {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex w-full flex-col items-center">
        <a href="/download" className={heroFilledCapsule}>
          <AppleIcon />
          Send link to my Mac
        </a>
        <p className="mt-2 text-center text-[11px] leading-snug text-muted-foreground sm:text-[12px]">
          {macwallMinimumMacOSVersionLabel}
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          trackSiteEventClient("pricing_click", { location: "hero_mobile" })
          onGetLicense()
        }}
        className={heroOutlineCapsule}
        aria-haspopup="dialog"
      >
        Get License
      </button>
    </div>
  )
}
