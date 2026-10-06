"use client"

import { useId, useRef, useState, type PointerEvent } from "react"

import { cn } from "@/lib/utils"

/**
 * A giant wordmark: soft letters fading downward, cropped by the bottom edge
 * like type running off the page. Its outline lights up around the pointer
 * (adapted from the 21st.dev "Hover Footer" idea). Decorative: hidden from
 * assistive tech; with no pointer it simply rests.
 */
export function FooterHoverWordmark({
  text,
  className,
}: Readonly<{
  text: string
  className?: string
}>) {
  const id = useId()
  const ref = useRef<SVGSVGElement>(null)
  // Pointer position as a fraction of the box; mapped into the viewBox below.
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 })
  const [active, setActive] = useState(false)

  const onMove = (event: PointerEvent<SVGSVGElement>) => {
    const box = ref.current?.getBoundingClientRect()
    if (!box) return
    setPos({
      x: (event.clientX - box.left) / box.width,
      y: (event.clientY - box.top) / box.height,
    })
  }

  // The baseline sits past the bottom edge, so the letters are cropped.
  const [vw, vh] = [1000, 178]
  const label = {
    x: "50%",
    y: 212,
    textAnchor: "middle" as const,
    dominantBaseline: "alphabetic" as const,
    fontSize: 228,
  }

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${vw} ${vh}`}
      className={cn("w-full select-none", className)}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      onPointerMove={onMove}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-ink`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#d4d4d4" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.16} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
        </linearGradient>
        <radialGradient
          id={`${id}-spot`}
          gradientUnits="userSpaceOnUse"
          r={(0.22 * Math.hypot(vw, vh)) / Math.SQRT2}
          cx={pos.x * vw}
          cy={pos.y * vh}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>
        <mask id={`${id}-mask`}>
          <rect width={vw} height={vh} fill={`url(#${id}-spot)`} />
        </mask>
      </defs>
      {/* Resting state. */}
      <text {...label} className="font-display" fill={`url(#${id}-fade)`}>
        {text}
      </text>
      {/* The lit outline, revealed only around the pointer. */}
      <text
        {...label}
        className="font-display fill-transparent transition-opacity duration-300"
        stroke={`url(#${id}-ink)`}
        strokeWidth={1.4}
        mask={`url(#${id}-mask)`}
        style={{ opacity: active ? 1 : 0 }}
      >
        {text}
      </text>
    </svg>
  )
}
