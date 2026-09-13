"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "motion/react"

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

type Dot = {
  x: number
  y: number
  phase: number
  speed: number
  currentMouseStrength: number
}

export function DottedGrid({
  spacing = 22,
  baseRadius = 1.8,
  mouseRadius = 120,
  backgroundColor = "#0a0a0a",
  className = "",
}: {
  spacing?: number
  baseRadius?: number
  mouseRadius?: number
  backgroundColor?: string
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const reducedMotion = useReducedMotion()
  const mouseRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    active: false,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let dots: Dot[] = []
    let frame = 0
    let running = true
    let visible = true

    const createDots = () => {
      dots = []
      for (let y = spacing / 2; y < height; y += spacing) {
        for (let x = spacing / 2; x < width; x += spacing) {
          dots.push({
            x,
            y,
            phase: Math.random() * Math.PI * 2,
            speed: 0.4 + Math.random() * 0.8,
            currentMouseStrength: 0,
          })
        }
      }
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      createDots()
    }

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.targetX = e.clientX - rect.left
      mouseRef.current.targetY = e.clientY - rect.top
      mouseRef.current.active = true
    }

    const draw = (ms: number) => {
      if (!running) return
      const time = ms * 0.001
      const mouse = mouseRef.current
      mouse.x = lerp(mouse.x, mouse.targetX, 0.12)
      mouse.y = lerp(mouse.y, mouse.targetY, 0.12)
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, width, height)

      for (const dot of dots) {
        let targetMouse = 0
        if (!reducedMotion && mouse.active) {
          const dist = Math.hypot(dot.x - mouse.x, dot.y - mouse.y)
          if (dist < mouseRadius) {
            const norm = dist / mouseRadius
            targetMouse = (1 - norm) ** 3
          }
        }
        dot.currentMouseStrength = lerp(
          dot.currentMouseStrength,
          targetMouse,
          0.12
        )
        const blink = reducedMotion
          ? 0.2
          : Math.sin(time * (1.1 + dot.speed) + dot.phase + dot.x * 0.02) ** 2
        const brightness = clamp01(0.18 + blink * 0.22)
        const radius =
          (baseRadius + blink * 0.4) * (1 - dot.currentMouseStrength * 0.7)
        ctx.beginPath()
        ctx.fillStyle = `hsla(210, 8%, ${16 + brightness * 70}%, ${0.28 + brightness * 0.5})`
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2)
        ctx.fill()
      }

      if (visible && !reducedMotion) frame = requestAnimationFrame(draw)
    }

    resize()
    draw(0)
    if (!reducedMotion) frame = requestAnimationFrame(draw)

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
      if (visible && !reducedMotion) frame = requestAnimationFrame(draw)
    })
    visibility.observe(canvas)
    canvas.addEventListener("pointermove", handlePointerMove)
    canvas.addEventListener("pointerleave", () => {
      mouseRef.current.active = false
    })
    window.addEventListener("resize", resize)

    return () => {
      running = false
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibility.disconnect()
      canvas.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("resize", resize)
    }
  }, [backgroundColor, baseRadius, mouseRadius, reducedMotion, spacing])

  return (
    <canvas
      ref={canvasRef}
      className={`block h-full w-full ${className}`}
      aria-hidden
    />
  )
}

export default DottedGrid
