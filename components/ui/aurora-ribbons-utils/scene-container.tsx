"use client"

import * as React from "react"
import { Canvas } from "@react-three/fiber"

import type { ThemeMode } from "@/components/ui/aurora-ribbons-utils/use-shadcn-theme"
import { cn } from "@/lib/utils"

export type SceneContainerProps = {
  children: React.ReactNode
  className?: string
  theme?: ThemeMode
  /** Lighting preset. The ribbons are unlit shaders, so it changes nothing for them. */
  environment?: "night" | "day" | "none"
  camera?: [number, number, number]
  fov?: number
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

/**
 * A transparent three.js canvas that fills its parent. It only animates while
 * on screen, and with Reduce Motion on it draws one still frame.
 */
export function SceneContainer({
  children,
  className,
  camera = [0, 0, 6],
  fov = 45,
}: SceneContainerProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [visible, setVisible] = React.useState(false)
  const [reduce] = React.useState(
    () => window.matchMedia(REDUCED_MOTION).matches
  )

  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting)
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const frameloop = reduce ? "demand" : visible ? "always" : "never"

  return (
    <div ref={ref} className={cn("relative", className)}>
      <Canvas
        frameloop={frameloop}
        dpr={[1, 2]}
        camera={{ position: camera, fov }}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        style={{ position: "absolute", inset: 0 }}
      >
        {children}
      </Canvas>
    </div>
  )
}
