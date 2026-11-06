"use client"

import { useEffect, useRef, useState } from "react"

import { MarketingSection } from "@/components/macwall-marketing/marketing-section"
import {
  landingBody,
  landingEyebrow,
  landingH2,
  landingH3,
  landingLead,
  landingPad,
} from "@/components/macwall-marketing/landing-type"
import { MARKETING_BEND_VIDEO_MP4_URL } from "@/lib/marketing-assets-urls"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { cn } from "@/lib/utils"

const BEND_POSTER_SRC = "/hero/bend-poster.avif"

/**
 * `h1` on the standalone /bend page; `h2` as a homepage section. The /bend
 * page passes a descriptive `headline` (the marketing title becomes the
 * first line of the lead) and a `pointsHeading` above the four points.
 */
export function Bend({
  headingLevel = "h2",
  headline,
  pointsHeading,
}: {
  headingLevel?: "h1" | "h2"
  headline?: string
  pointsHeading?: string
} = {}) {
  const Heading = headingLevel
  const bend = macwallMarketingCopy.landing.bend
  const videoRef = useRef<HTMLVideoElement>(null)
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduceMotion(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const load = () => {
      if (video.getAttribute("src") === MARKETING_BEND_VIDEO_MP4_URL) return
      video.src = MARKETING_BEND_VIDEO_MP4_URL
      video.load()
      if (!reduceMotion) {
        void video.play().catch(() => undefined)
      }
    }

    if (typeof IntersectionObserver === "undefined") {
      load()
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            load()
            observer.disconnect()
            break
          }
        }
      },
      { rootMargin: "200px" }
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [reduceMotion])

  return (
    <MarketingSection id="bend" aria-labelledby="bend-heading">
      <div
        className={cn(landingPad, "flex max-w-2xl flex-col gap-2 pt-10 pb-8")}
      >
        <p className={landingEyebrow}>{bend.eyebrow}</p>
        <Heading id="bend-heading" className={landingH2}>
          {headline ?? bend.title}
        </Heading>
        <p className={landingLead}>
          {headline ? `${bend.title} ${bend.lead}` : bend.lead}
        </p>
      </div>

      <div className="relative aspect-[16/9] w-full bg-black md:aspect-[2/1]">
        <video
          ref={videoRef}
          poster={BEND_POSTER_SRC}
          autoPlay={!reduceMotion}
          muted
          loop={!reduceMotion}
          playsInline
          preload="none"
          className="absolute inset-0 h-full w-full object-cover"
          aria-label={bend.title}
        />
      </div>

      {pointsHeading ? (
        <h2 className={cn(landingPad, landingH3, "pt-8")}>{pointsHeading}</h2>
      ) : null}
      <ul className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {bend.points.map((point) => (
          <li key={point.title} className="min-w-0 p-6 sm:p-8">
            <h3 className={landingH3}>{point.title}</h3>
            <p className={cn(landingBody, "mt-2")}>{point.body}</p>
          </li>
        ))}
      </ul>
    </MarketingSection>
  )
}
