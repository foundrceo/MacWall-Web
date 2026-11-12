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
  /**
   * Called once the first frame is drawn (shaders compiled), so the caller
   * can fade the canvas in instead of showing a blank one that pops later.
   */
  onReady?: () => void
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

/**
 * A transparent three.js canvas that fills its parent. It only animates while
 * on screen, and with Reduce Motion on it draws one still frame. It compiles
 * the shaders and draws a frame as soon as it mounts, even off screen, so
 * the GPU work is done before the canvas scrolls into view.
 */
export function SceneContainer({
  children,
  className,
  camera = [0, 0, 6],
  fov = 45,
  onReady,
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
        onCreated={(state) => {
          // Next task, once the scene's children have mounted. Not
          // requestAnimationFrame: it never fires in a background tab, so the
          // canvas would stay hidden until the tab is shown and then pop in.
          setTimeout(() => {
            state.gl.compile(state.scene, state.camera)
            state.gl.render(state.scene, state.camera)
            onReady?.()
          }, 0)
        }}
      >
        {children}
      </Canvas>
    </div>
  )
}
