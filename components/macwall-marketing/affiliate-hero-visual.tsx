"use client"

import NumberFlow from "@number-flow/react"
import { useEffect, useRef, useState } from "react"

import { ShaderBackground } from "@/components/macwall-marketing/shader-background"
import { AFFILIATE_SHADER_HERO } from "@/lib/affiliate-shader-presets"
import { AFFILIATE_COMMISSION_PERCENT } from "@/lib/macwall-affiliate-copy"
import { cn } from "@/lib/utils"

const COUNT_MS = 3400
const COUNT_TIMING = {
  duration: 480,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

export function AffiliateHeroVisual({
  className,
}: Readonly<{ className?: string }>) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let raf = 0
    let start: number | null = null

    const tick = (now: number) => {
      if (start === null) start = now
      const t = Math.min(1, (now - start) / COUNT_MS)
      const next = Math.round(
        easeOutCubic(t) * AFFILIATE_COMMISSION_PERCENT
      )
      setValue(next)
      if (t < 1) raf = requestAnimationFrame(tick)
      else setValue(AFFILIATE_COMMISSION_PERCENT)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || startedRef.current) return
        startedRef.current = true
        observer.disconnect()
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.35 }
    )

    observer.observe(root)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative w-full overflow-hidden rounded-[28px]",
        className
      )}
    >
      <div className="relative aspect-[4/5] w-full sm:aspect-[5/6] lg:aspect-auto lg:min-h-[min(72vh,640px)]">
        <ShaderBackground
          className="absolute inset-0"
          config={AFFILIATE_SHADER_HERO}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" />

        <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9 lg:p-10">
          <p className="text-[clamp(4.5rem,12vw,7.5rem)] font-light leading-none tracking-[-0.04em] text-white">
            <NumberFlow
              className="tabular-nums"
              value={value}
              suffix="%"
              transformTiming={COUNT_TIMING}
              spinTiming={COUNT_TIMING}
              format={{
                maximumFractionDigits: 0,
                minimumIntegerDigits: 2,
              }}
            />
          </p>
          <p className="mt-0.5 whitespace-nowrap text-[15px] font-normal leading-[1.4] text-white/70 sm:text-base">
            on every sale you refer
          </p>
        </div>
      </div>
    </div>
  )
}
