"use client"

import { useEffect, useState } from "react"
import { HeroVideoControls } from "@/components/macwall-marketing/hero-video-controls"
import {
  HERO_VIDEO_ASPECT_CLASS,
  HERO_WALKTHROUGH_VIDEO_ID,
} from "@/lib/marketing/hero-walkthrough-video.shared"
import { marketingWalkthroughVideoSources } from "@/lib/marketing-assets-urls"
import { macwall } from "@/lib/macwall-site"
import { cn } from "@/lib/utils"

export function HeroWalkthroughVideo({
  endCaption = `Live wallpapers on your Mac desktop with ${macwall.name}.`,
  ariaLabel = `${macwall.name} app preview`,
}: Readonly<{
  endCaption?: string
  ariaLabel?: string
}>) {
  const sources = marketingWalkthroughVideoSources()
  const primarySrc = sources[0] ?? ""
  const fallbackSources = sources.slice(1)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduceMotion(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  return (
    <div>
      <div
        className={cn(
          "group relative w-full overflow-hidden rounded-2xl bg-surface-elevated",
          HERO_VIDEO_ASPECT_CLASS
        )}
      >
        {primarySrc ? (
          <video
            id={HERO_WALKTHROUGH_VIDEO_ID}
            src={primarySrc}
            autoPlay={!reduceMotion}
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
            aria-label={ariaLabel}
          />
        ) : null}

        <HeroVideoControls
          fallbackSources={fallbackSources}
          endCaption={endCaption}
        />
      </div>
    </div>
  )
}
