"use client"

import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import * as React from "react"

import { cn } from "@/lib/utils"

interface OrbitImage {
  url: string
  name: string
}

/** Steps through `count` items, one every `duration` seconds. */
function useCycle(count: number, duration: number, still: boolean) {
  const [index, setIndex] = React.useState(0)
  React.useEffect(() => {
    if (count < 2 || still) return
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % count),
      duration * 1000
    )
    return () => window.clearInterval(id)
  }, [count, duration, still])
  return index
}

const SPRING = { type: "spring", stiffness: 100, damping: 7 } as const
const TILE =
  "border border-white/10 bg-gradient-to-t from-surface-1 to-surface-3 inset-shadow-sm inset-shadow-white/7"

/**
 * The centre of the orbit: a round tile that swaps its image every
 * `duration` seconds, or holds whatever `children` you put in it.
 */
export function CloudOrbit({
  duration = 2,
  children,
  size = 160,
  className,
  images = [],
}: Readonly<{
  duration?: number
  children?: React.ReactNode
  size?: number
  className?: string
  images?: OrbitImage[]
}>) {
  const still = useReducedMotion() ?? false
  const current = useCycle(images.length, duration, still)

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center rounded-full select-none",
        className
      )}
    >
      <AnimatePresence>
        {images.map(
          (image, index) =>
            index === current && (
               
              <motion.img
                key={image.url}
                src={image.url}
                alt={image.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: [0.8, 1] }}
                exit={{ opacity: 0, scale: [1, 0.8] }}
                transition={SPRING}
                className={cn("absolute z-10 rounded-full", TILE)}
                style={{ width: size, height: size }}
              />
            )
        )}
      </AnimatePresence>
      {children}
    </div>
  )
}

/**
 * One body on the orbit: travels a full circle every `speed` seconds,
 * starting `startAt` of the way round, and swaps its image every `duration`.
 */
export function OrbitingImage({
  speed = 20,
  radius = 100,
  startAt = 0,
  size = 80,
  className,
  images = [],
  duration = 2,
}: Readonly<{
  speed?: number
  radius?: number
  startAt?: number
  size?: number
  className?: string
  images?: OrbitImage[]
  duration?: number
}>) {
  const still = useReducedMotion() ?? false
  const current = useCycle(images.length, duration, still)
  const at = (deg: number) =>
    `rotate(${deg}deg) translateY(-${radius}px) rotate(${-deg}deg)`
  const start = startAt * 360

  return (
    <motion.div
      style={{
        width: size,
        height: size,
        position: "absolute",
        left: "50%",
        top: "50%",
        marginLeft: -size / 2,
        marginTop: -size / 2,
        transform: at(start),
      }}
      animate={
        still
          ? undefined
          : { transform: [0, 90, 180, 270, 360].map((d) => at(start + d)) }
      }
      transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      className={cn(
        "z-[5] flex transform-gpu items-center justify-center rounded-full",
        className
      )}
    >
      <AnimatePresence>
        {images.map(
          (image, index) =>
            index === current && (
              <motion.div
                key={image.url}
                style={{ width: size, height: size, position: "absolute" }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: [0.8, 1] }}
                exit={{ opacity: 0, scale: [1, 0.8] }}
                transition={SPRING}
                className={cn("rounded-full p-[8%]", TILE)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.name}
                  className="h-full w-full rounded-full object-cover"
                />
              </motion.div>
            )
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default CloudOrbit
