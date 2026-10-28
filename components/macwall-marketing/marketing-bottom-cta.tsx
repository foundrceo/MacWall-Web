"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"

import { TrackedDownloadButton } from "@/components/analytics/tracked-marketing-buttons"
import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import {
  ProModal,
  preloadProModal,
} from "@/components/macwall-marketing/pro-modal-lazy"
import { trackSiteEventClient } from "@/lib/analytics/client"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import {
  macwallInstallerLatestPath,
  macwallMinimumMacOSVersionLabel,
} from "@/lib/macwall-site"
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

/** three.js is heavy: load it only for the CTA, in the browser. */
const AuroraRibbons = dynamic(() => import("@/components/ui/aurora-ribbons"), {
  ssr: false,
})

/**
 * Aurora ribbons behind the CTA. Mounts (and so downloads three.js) only when
 * the card is near the viewport, then fades in.
 */
function CtaRibbons() {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setNear(true)
        observer.disconnect()
      },
      { rootMargin: "600px 0px" }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 animate-in duration-1000 fade-in-0"
    >
      {near ? (
        // Tilted across the card, and long enough that the faded ends sit
        // outside it, so the band runs edge to edge. The dimming sits on this
        // inner layer: the page's scroll reveal sets the wrapper to opacity 1.
        <AuroraRibbons
          className="h-full w-full opacity-70"
          tilt={0.32}
          length={30}
        />
      ) : null}
    </div>
  )
}

const heroOutlineCapsule =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full border-0 bg-surface-2 px-5 text-sm font-medium text-ink no-underline shadow-none transition-colors hover:bg-surface-3"

const heroFilledCapsule =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-black no-underline shadow-none transition-opacity hover:opacity-90"

export default function MacWallMarketingBottomCta() {
  const [proOpen, setProOpen] = useState(false)
  const copy = macwallMarketingCopy.underFooter

  return (
    <MarketingSection className="pt-20 pb-20 lg:pt-[110px] lg:pb-[110px]">
      {/* One rounded card, as on PostMesh's closing band (458px tall from sm up). */}
      <div className="relative isolate mx-auto flex w-full max-w-[1200px] flex-col items-center justify-center overflow-hidden rounded-[32px] bg-surface-1 px-5 py-14 text-center squircle sm:min-h-[458px] sm:px-10 sm:py-16 lg:rounded-[40px] lg:px-16 lg:py-[72px]">
        <CtaRibbons />
        <h2 className="mx-auto max-w-2xl font-display text-[40px] leading-[48px] font-normal tracking-tight text-balance sm:text-[56px] sm:leading-[64px]">
          {copy.title}
        </h2>
        <p className="mt-4 text-[15px] leading-[22px] text-pretty text-ink-2">
          {copy.lead}
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <TrackedDownloadButton
            href={macwallInstallerLatestPath}
            size="pill"
            location="bottom_cta"
            className={heroFilledCapsule}
          >
            <AppleIcon />
            Download for Mac
          </TrackedDownloadButton>
          <button
            type="button"
            onClick={() => {
              trackSiteEventClient("pricing_click", { location: "bottom_cta" })
              setProOpen(true)
            }}
            className={heroOutlineCapsule}
            aria-haspopup="dialog"
            onPointerEnter={preloadProModal}
            onFocus={preloadProModal}
          >
            Get License
          </button>
        </div>
        <p className="mt-4 text-[13px] leading-5 text-ink-3">
          {macwallMinimumMacOSVersionLabel}
        </p>
      </div>
      <ProModal open={proOpen} onOpenChange={setProOpen} />
    </MarketingSection>
  )
}
