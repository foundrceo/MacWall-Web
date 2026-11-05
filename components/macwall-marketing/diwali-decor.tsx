"use client"

import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

/** Clay diya with a flickering flame (motion-safe). */
export function Diya({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className={cn("shrink-0 overflow-visible", className)}
    >
      <defs>
        <radialGradient id="diya-glow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#FFD86B" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FF8A00" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="diya-flame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF4C2" />
          <stop offset="55%" stopColor="#FFC93C" />
          <stop offset="100%" stopColor="#FF6A00" />
        </linearGradient>
        <linearGradient id="diya-bowl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F28C28" />
          <stop offset="100%" stopColor="#A63A0A" />
        </linearGradient>
      </defs>
      <circle
        cx="16"
        cy="11"
        r="10"
        fill="url(#diya-glow)"
        className="mw-diya-glow"
      />
      <path
        d="M16 3.5c2.6 3.4 3.6 5.6 3.6 7.4a3.6 3.6 0 0 1-7.2 0c0-1.8 1-4 3.6-7.4Z"
        fill="url(#diya-flame)"
        className="mw-diya-flame"
      />
      <path
        d="M3.5 17.5h25c-.8 5.6-5.8 9.5-12.5 9.5S4.3 23.1 3.5 17.5Z"
        fill="url(#diya-bowl)"
      />
      <path
        d="M3.5 17.5h25"
        stroke="#FFD27A"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M9 21.5h2m3 0h4m3 0h2"
        stroke="#FFD27A"
        strokeOpacity="0.7"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

const BULB_COLORS = ["#FFC93C", "#FF6A3D", "#FF3D8B", "#7CF29A", "#5CC8FF"]

/**
 * Festive string lights that hang off the bottom edge of the Diwali
 * banner. Decorative only: no pointer events, hidden from assistive tech.
 */
export function DiwaliLights({ className }: Readonly<{ className?: string }>) {
  const loops = 24
  const width = 1200
  const step = width / loops
  const wire = Array.from({ length: loops }, (_, i) => {
    const x0 = i * step
    return `${i === 0 ? `M${x0} 0` : ""} Q${x0 + step / 2} 12 ${x0 + step} 0`
  }).join(" ")

  return (
    <svg
      viewBox={`0 0 ${width} 22`}
      preserveAspectRatio="none"
      aria-hidden
      className={cn("pointer-events-none h-[18px] w-full", className)}
    >
      <path d={wire} fill="none" stroke="#6B3A12" strokeWidth="1.2" />
      {Array.from({ length: loops }, (_, i) => {
        const color = BULB_COLORS[i % BULB_COLORS.length]
        return (
          <ellipse
            key={i}
            cx={i * step + step / 2}
            cy={11}
            rx={3.2}
            ry={4.6}
            fill={color}
            className="mw-diwali-bulb"
            style={{
              animationDelay: `${(i % 5) * 0.35}s`,
              filter: `drop-shadow(0 0 4px ${color})`,
            }}
          />
        )
      })}
    </svg>
  )
}

/**
 * "4d 12h left" / "5h 20m left" until `endsAt`, for a real deadline only.
 * Client-only (null on the server and first render) so hydration matches.
 */
export function useTimeLeft(endsAt: string | null | undefined): string | null {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    if (!endsAt) return
    const tick = () => setNow(Date.now())
    const first = window.setTimeout(tick, 0)
    const id = window.setInterval(tick, 30_000)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(id)
    }
  }, [endsAt])

  if (!endsAt || now === null) return null
  const ms = Date.parse(endsAt) - now
  if (ms <= 0) return null
  const minutes = Math.floor(ms / 60_000)
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  const mins = minutes % 60
  if (days > 0) return `${days}d ${hours}h left`
  if (hours > 0) return `${hours}h ${mins}m left`
  return `${Math.max(mins, 1)}m left`
}
