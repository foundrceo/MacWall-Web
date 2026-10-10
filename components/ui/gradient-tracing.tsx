"use client"

import { useId } from "react"
import { useReducedMotion } from "motion/react"

type GradientTracingProps = {
  width: number
  height: number
  baseColor?: string
  gradientColors?: [string, string, string]
  animationDuration?: number
  strokeWidth?: number
  path?: string
  className?: string
}

export function GradientTracing({
  width,
  height,
  baseColor = "black",
  gradientColors = ["#2EB9DF", "#2EB9DF", "#9E00FF"],
  animationDuration = 2,
  strokeWidth = 2,
  path = `M0,${height / 2} L${width},${height / 2}`,
  className,
}: GradientTracingProps) {
  const gradientId = useId().replace(/:/g, "")
  const reduceMotion = useReducedMotion()

  return (
    <div className={className} style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        aria-hidden
      >
        <path
          d={path}
          stroke={baseColor}
          strokeOpacity="0.2"
          strokeWidth={strokeWidth}
        />
        <path
          d={path}
          stroke={`url(#${gradientId})`}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />
        <defs>
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1="0"
            x2={width}
            y1="0"
            y2="0"
          >
            {!reduceMotion ? <>
              <animate attributeName="x1" values={`0;${width * 2}`} dur={`${animationDuration}s`} repeatCount="indefinite" />
              <animate attributeName="x2" values={`0;${width}`} dur={`${animationDuration}s`} repeatCount="indefinite" />
            </> : null}
            <stop stopColor={gradientColors[0]} stopOpacity="0" />
            <stop stopColor={gradientColors[1]} />
            <stop offset="1" stopColor={gradientColors[2]} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
