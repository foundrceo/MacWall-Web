"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"

type OrbitImage = {
  url: string
  name: string
}

export function CloudOrbit({
  duration = 2,
  children,
  size = 160,
  className,
  images = [],
}: {
  duration?: number
  children?: React.ReactNode
  size?: number
  className?: string
  images?: OrbitImage[]
}) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const lastTimestamp = React.useRef(0)

  React.useEffect(() => {
    let animationFrameId: number
    const updateFrame = (timestamp: number) => {
      if (lastTimestamp.current === 0) lastTimestamp.current = timestamp
      const elapsedTime = (timestamp - lastTimestamp.current) / 1000
      const next =
        images.length === 0
          ? 0
          : Math.floor(elapsedTime / duration) % images.length
      setCurrentIndex(next)
      animationFrameId = requestAnimationFrame(updateFrame)
    }
    if (images.length > 0) animationFrameId = requestAnimationFrame(updateFrame)
    return () => cancelAnimationFrame(animationFrameId)
  }, [duration, images.length])

  return (
    <div
      style={{ "--size": `${size}px` } as React.CSSProperties}
      className={cn(
        "relative flex h-full w-full items-center justify-center rounded-full select-none",
        className
      )}
    >
      <AnimatePresence>
        {images.map(
          (image, index) =>
            index === currentIndex && (
              <motion.img
                key={image.url}
                src={image.url}
                alt={image.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: [0.8, 1] }}
                exit={{ opacity: 0, scale: [1, 0.8] }}
                transition={{ type: "spring", stiffness: 100, damping: 7 }}
                className="absolute z-10 rounded-full border border-border object-cover"
                style={{ width: size, height: size }}
              />
            )
        )}
      </AnimatePresence>
      {children}
    </div>
  )
}

export function OrbitingImage({
  speed = 20,
  radius = 100,
  startAt = 0,
  size = 80,
  className,
  images = [],
  duration = 2,
}: {
  speed?: number
  radius?: number
  startAt?: number
  size?: number
  className?: string
  images?: OrbitImage[]
  duration?: number
}) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const lastTimestamp = React.useRef(0)

  React.useEffect(() => {
    let animationFrameId: number
    const updateFrame = (timestamp: number) => {
      if (lastTimestamp.current === 0) lastTimestamp.current = timestamp
      const elapsedTime = (timestamp - lastTimestamp.current) / 1000
      const next =
        images.length === 0
          ? 0
          : Math.floor(elapsedTime / duration) % images.length
      setCurrentIndex(next)
      animationFrameId = requestAnimationFrame(updateFrame)
    }
    if (images.length > 0) animationFrameId = requestAnimationFrame(updateFrame)
    return () => cancelAnimationFrame(animationFrameId)
  }, [duration, images.length])

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
      }}
      animate={{
        transform: [
          `rotate(${startAt * 360}deg) translateY(-${radius}px) rotate(-${startAt * 360}deg)`,
          `rotate(${startAt * 360 + 360}deg) translateY(-${radius}px) rotate(-${startAt * 360 + 360}deg)`,
        ],
      }}
      transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      className={cn(
        "absolute z-5 flex items-center justify-center rounded-full",
        className
      )}
    >
      <AnimatePresence>
        {images.map(
          (image, index) =>
            index === currentIndex && (
              <motion.div
                key={image.url}
                style={{ width: size, height: size, position: "absolute" }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: [0.8, 1] }}
                exit={{ opacity: 0, scale: [1, 0.8] }}
                transition={{ type: "spring", stiffness: 100, damping: 7 }}
                className="overflow-hidden rounded-full border border-border bg-card"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.name}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            )
        )}
      </AnimatePresence>
    </motion.div>
  )
}
