"use client"

import { useEffect, useRef, useState } from "react"

import { LandingSurface } from "@/components/macwall-marketing/landing-surface"
import {
  landingBelow,
  landingBody,
  landingEyebrow,
  landingH2,
  landingH3,
  landingLead,
  landingSectionY,
} from "@/components/macwall-marketing/landing-type"
import { macwallMarketingCopy } from "@/lib/macwall-marketing-copy"
import { cn } from "@/lib/utils"

const BEND_VIDEO_SRC = "/hero/bend-demo.mp4"
const BEND_POSTER_SRC = "/hero/bend-poster.jpg"

export default function BendSection() {
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
      if (video.getAttribute("src") === BEND_VIDEO_SRC) return
      video.src = BEND_VIDEO_SRC
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
    <section id="bend" className={landingSectionY} aria-labelledby="bend-heading">
      <div className="marketing-container">
        <div className="mx-auto max-w-2xl text-center">
          <p className={landingEyebrow}>{bend.eyebrow}</p>
          <h2 id="bend-heading" className={cn(landingH2, "mt-2")}>
            {bend.title}
          </h2>
          <p className={cn(landingLead, "mx-auto mt-5")}>{bend.lead}</p>
        </div>

        <div
          className={cn(
            landingBelow,
            "relative overflow-hidden rounded-2xl bg-[#111]"
          )}
        >
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
        </div>

        <ul
          className={cn(
            landingBelow,
            "grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4"
          )}
        >
          {bend.points.map((point) => (
            <li key={point.title} className="min-w-0">
              <LandingSurface
                className="flex h-full flex-col rounded-none p-5 sm:p-6 md:p-8"
                hover={false}
              >
                <h3 className={landingH3}>{point.title}</h3>
                <p className={cn(landingBody, "mt-2")}>{point.body}</p>
              </LandingSurface>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
